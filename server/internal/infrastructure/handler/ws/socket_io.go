package ws

import (
	"encoding/json"
	"errors"
	"log"
	"net/url"
	"sync"

	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
	"github.com/shalluv/network/server/internal/service"
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
	return &socketIo{
		server:         server,
		profileService: profileService,
		messageService: messageService,
		userConns:      map[string][]*socketio.Socket{},
	}
}

func (s *socketIo) OnConnect(conn *socketio.Socket) error {
	queryParams, err := url.ParseQuery(conn.Handshake().Url)
	if err != nil {
		log.Printf("on connect err: %v", err)
		return err
	}
	usernames, ok := queryParams["username"]
	if !ok || len(usernames) != 1 {
		log.Printf("unauthorized: %s", conn.Handshake().Url)
		return errors.New("unauthorized")
	}

	username := usernames[0]

	log.Printf("user %s is connecting", username)

	groups, err := s.profileService.GetUserGroups(username)
	if err != nil {
		return err
	}

	//s.server.JoinRoom(DefaultNamespace, username, conn)
	conn.Join(socketio.Room(username))
	for _, group := range groups {
		//s.server.JoinRoom(DefaultNamespace, group.Id.String(), conn)
		conn.Join(socketio.Room(group.Id.String()))
		s.server.To()
	}

	conn.SetData(username)
	onlineUsers := []string{}

	s.mu.Lock()
	if len(s.userConns[username]) == 0 {
		msg := UserConnectedEventMsg{Username: username}
		//s.server.BroadcastToNamespace(DefaultNamespace, "user connected", &msg)
		s.server.To(socketio.Room(DefaultNamespace)).Emit("user connected", &msg)
	}
	for user := range s.userConns {
		if user != username {
			onlineUsers = append(onlineUsers, user)
		}
	}
	s.userConns[username] = append(s.userConns[username], conn)
	s.mu.Unlock()

	conn.Emit(UsersEvent, onlineUsers)

	log.Printf("user %s connected successfully", username)

	return nil
}

type MessageInput struct {
	To      string `json:"to"`
	Content string `json:"content"`
}

func (s *socketIo) SendPrivateMessage(conn *socketio.Socket, msg string) {
	input := &MessageInput{}
	err := json.Unmarshal([]byte(msg), input)
	if err != nil {
		log.Printf("send private message unmarshal err: %v", err)
		return
	}

	username := conn.Data().(string)

	if _, err := s.messageService.CreateMessage(username, input.To, input.Content, false); err != nil {
		log.Printf("failed to send message: %v", err)
		return
	}

	eventMsg := &PrivateMessageEventMsg{
		From:    username,
		Content: input.Content,
	}

	//s.server.BroadcastToRoom(DefaultNamespace, input.To, PrivateMessageEvent, eventMsg)
	s.server.To(socketio.Room(input.To)).Emit(PrivateMessageEvent, eventMsg)
}

func (s *socketIo) SendGroupMessage(conn *socketio.Socket, msg string) {
	input := &MessageInput{}
	err := json.Unmarshal([]byte(msg), input)
	if err != nil {
		log.Printf("send private message unmarshal err: %v", err)
		return
	}

	username := conn.Data().(string)

	if _, err := s.messageService.CreateMessage(username, input.To, input.Content, true); err != nil {
		log.Printf("failed to send message: %v", err)
		return
	}

	eventMsg := &GroupMessageEventMsg{
		From:    username,
		To:      input.To,
		Content: input.Content,
	}

	//s.server.BroadcastToRoom(DefaultNamespace, input.To, GroupMessageEvent, eventMsg)
	s.server.To(socketio.Room(input.To)).Emit(GroupMessageEvent, eventMsg)
}

func (s *socketIo) OnDisconnect(conn *socketio.Socket, reason string) {
	queryParams, err := url.ParseQuery(conn.Handshake().Url)
	if err != nil {
		log.Printf("on connect err: %v", err)
		return
	}
	usernames, ok := queryParams["username"]

	usernameR := usernames[0]
	//s.server.JoinRoom(DefaultNamespace, username, conn)
	defer conn.Leave(socketio.Room(usernameR))

	username, ok := conn.Data().(string)
	log.Printf("conn %s disconnecting: %s", conn.Id(), reason)
	if !ok {
		return
	}

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
		s.server.Emit(GroupMessageEvent, &msg)
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
