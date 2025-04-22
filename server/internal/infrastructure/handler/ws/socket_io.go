package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
	"github.com/shalluv/network/server/internal/service"
	"github.com/zishang520/socket.io/v2/socket"
	socketio "github.com/zishang520/socket.io/v2/socket"
)

type socketIo struct {
	mu             sync.Mutex
	userConns      map[string][]*socketio.Socket
	server         *socketio.Server
	profileService *service.Profile
	messageService *service.Message
}

func NewSocketIo(server *socketio.Server, profileService *service.Profile, messageService *service.Message) *socketIo {
	socketio := &socketIo{
		server:         server,
		profileService: profileService,
		messageService: messageService,
		userConns:      map[string][]*socketio.Socket{},
	}
	// go func() {
	// 	log.Printf("debug")
	// 	for {
	// 		time.Sleep(10 * time.Second)
	// 		socketio.mu.Lock()
	// 		for user, conns := range socketio.userConns {
	// 			log.Printf("user %s has %d conns", user, len(conns))
	// 		}
	// 		socketio.mu.Unlock()
	// 	}
	// }()
	return socketio
}

func (s *socketIo) OnConnect(clients ...any) {
	conn := clients[0].(*socket.Socket)
	usernames, ok := conn.Handshake().Query["username"]
	if !ok || len(usernames) != 1 {
		log.Printf("unauthorized: %s", conn.Handshake().Url)
		return
	}

	username := usernames[0]

	log.Printf("user %s is connecting", username)

	groups, err := s.profileService.GetUserGroups(username)
	if err != nil {
		log.Printf("failed to get user groups: %v", err)
		return
	}

	//s.server.JoinRoom(DefaultNamespace, username, conn)
	conn.Join(socketio.Room(username))
	for _, group := range groups {
		//s.server.JoinRoom(DefaultNamespace, group.Id.String(), conn)
		conn.Join(socketio.Room(group.Id.String()))
	}

	conn.SetData(username)
	onlineUsers := []string{}

	s.mu.Lock()
	if len(s.userConns[username]) == 0 {
		msg := UserConnectedEventMsg{Username: username}
		//s.server.BroadcastToNamespace(DefaultNamespace, "user connected", &msg)
		s.server.Emit("user connected", &msg)
	}
	for user, conns := range s.userConns {
		if user != username && len(conns) > 0 {
			onlineUsers = append(onlineUsers, user)
		}
	}
	s.userConns[username] = append(s.userConns[username], conn)
	s.mu.Unlock()

	conn.Emit(UsersEvent, onlineUsers)

	log.Printf("user %s connected successfully", username)

	conn.On(PrivateMessageEvent, func(args ...interface{}) {
		if len(args) != 1 {
			log.Printf("invalid args: %v", args)
			return
		}

		inputBytes, err := json.Marshal(args[0])
		if err != nil {
			log.Printf("failed to get input bytes: %v", err)
			return
		}

		s.SendPrivateMessage(conn, inputBytes)
	})

	conn.On(GroupMessageEvent, func(args ...interface{}) {
		if len(args) != 1 {
			log.Printf("invalid args: %v", args)
			return
		}

		inputBytes, err := json.Marshal(args[0])
		if err != nil {
			log.Printf("failed to get input bytes: %v", err)
			return
		}
		s.SendGroupMessage(conn, inputBytes)
	})

	conn.On("disconnect", func(...any) {
		s.OnDisconnect(conn, "leaving")
	})
}

type MessageInput struct {
	To      string `json:"to"`
	Content string `json:"content"`
}

func (s *socketIo) SendPrivateMessage(conn *socketio.Socket, msg []byte) {
	input := &MessageInput{}
	err := json.Unmarshal(msg, input)
	if err != nil {
		log.Printf("send private message unmarshal err: %v", err)
		return
	}

	username := conn.Data().(string)

	message, err := s.messageService.CreateMessage(username, input.To, input.Content, false)
	if err != nil {
		log.Printf("failed to send message: %v", err)
		return
	}

	eventMsg := PrivateMessageEventMsg{message}

	//s.server.BroadcastToRoom(DefaultNamespace, input.To, PrivateMessageEvent, eventMsg)
	s.server.To(socketio.Room(input.To)).Emit(PrivateMessageEvent, eventMsg)
	s.server.To(socketio.Room(username)).Emit(PrivateMessageEvent, eventMsg)
}

func (s *socketIo) SendGroupMessage(conn *socketio.Socket, msg []byte) {
	input := &MessageInput{}
	err := json.Unmarshal(msg, input)
	if err != nil {
		log.Printf("send private message unmarshal err: %v", err)
		return
	}

	username := conn.Data().(string)

	message, err := s.messageService.CreateMessage(username, input.To, input.Content, true)
	if err != nil {
		log.Printf("failed to send message: %v", err)
		return
	}

	eventMsg := GroupMessageEventMsg{message}

	//s.server.BroadcastToRoom(DefaultNamespace, input.To, GroupMessageEvent, eventMsg)
	s.server.To(socketio.Room(input.To)).Emit(GroupMessageEvent, eventMsg)
}

func (s *socketIo) OnDisconnect(conn *socketio.Socket, reason string) {
	username, ok := conn.Data().(string)
	if !ok {
		return
	}
	log.Printf("conn %s user %s disconnecting: %s", conn.Id(), username, reason)
	//s.server.JoinRoom(DefaultNamespace, username, conn)
	defer conn.Leave(socketio.Room(username))

	s.mu.Lock()
	idx := -1
	for i, c := range s.userConns[username] {
		if c.Id() == conn.Id() {
			idx = i
			break
		}
	}

	if idx == -1 {
		log.Printf("conn %s not found in map", conn.Id())
		return
	}

	connsLen := len(s.userConns[username])
	s.userConns[username][idx] = s.userConns[username][connsLen-1]
	s.userConns[username] = s.userConns[username][:connsLen-1]

	if connsLen-1 == 0 {
		msg := UserDisconnectedEventMsg{Username: username}
		// s.server.BroadcastToNamespace(DefaultNamespace, UserDisconnectedEvent, &msg)
		s.server.Emit(UserDisconnectedEvent, &msg)
	}
	s.mu.Unlock()
}

func (s *socketIo) OnError(conn *socketio.Socket, err error) {
	log.Printf("conn %s: %v", conn.Id(), err)
}

func (s *socketIo) PublishMessageDeletedEvent(message *domain.Message) {
	// namespace := DefaultNamespace

	// s.server.BroadcastToNamespace(namespace, MessageDeletedEvent, message)
	s.server.Emit(MessageDeletedEvent, message)
}

func (s *socketIo) PublishMessageEdited(message *domain.Message) {
	// namespace := DefaultNamespace

	// s.server.BroadcastToNamespace(namespace, MessageEditedEvent, message)
	s.server.Emit(MessageDeletedEvent, message)
}

func (s *socketIo) PublishJoinedGroupEvent(username string, groupId uuid.UUID) {
	msg := &JoinedGroupEventMsg{
		GroupId:  groupId,
		Username: username,
	}
	// s.server.BroadcastToRoom(DefaultNamespace, groupId.String(), JoinedGroupEvent, msg)
	s.server.To(socketio.Room(groupId.String())).Emit(JoinedGroupEvent, msg)

	s.mu.Lock()
	for _, conn := range s.userConns[username] {
		// s.server.JoinRoom(DefaultNamespace, groupId.String(), conn)
		conn.Join(socketio.Room(groupId.String()))
	}
	s.mu.Unlock()
}

func (s *socketIo) PublishLeftGroupEvent(username string, groupId uuid.UUID) {
	msg := &LeftGroupEventMsg{
		GroupId:  groupId,
		Username: username,
	}

	s.mu.Lock()
	for _, conn := range s.userConns[username] {
		// s.server.LeaveRoom(DefaultNamespace, groupId.String(), conn)
		conn.Leave(socketio.Room(groupId.String()))
	}
	s.mu.Unlock()

	// s.server.BroadcastToRoom(DefaultNamespace, groupId.String(), LeftGroupEvent, msg)
	s.server.To(socketio.Room(groupId.String())).Emit(LeftGroupEvent, msg)
}
