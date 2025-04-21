package ws

import (
	"encoding/json"
	"errors"
	"log"
	"net/url"
	"sync"

	"github.com/google/uuid"
	socketio "github.com/googollee/go-socket.io"
	"github.com/shalluv/network/server/internal/domain"
	"github.com/shalluv/network/server/internal/service"
)

type socketIo struct {
	mu             sync.Mutex
	userConns      map[string][]socketio.Conn
	server         *socketio.Server
	profileService *service.Profile
	messageService *service.Message
}

func NewSocketIo(server *socketio.Server, profileService *service.Profile, messageService *service.Message) *socketIo {
	return &socketIo{
		server:         server,
		profileService: profileService,
		messageService: messageService,
		userConns:      map[string][]socketio.Conn{},
	}
}

func (s *socketIo) OnConnect(conn socketio.Conn) error {
	queryParams, err := url.ParseQuery(conn.URL().RawQuery)
	if err != nil {
		return err
	}
	usernames, ok := queryParams["username"]
	if !ok || len(usernames) != 1 {
		return errors.New("unauthorized")
	}

	username := usernames[0]

	groups, err := s.profileService.GetUserGroups(username)
	if err != nil {
		return err
	}

	s.server.JoinRoom(defaultNamespace, username, conn)
	for _, group := range groups {
		s.server.JoinRoom(groupNamespace, group.Id.String(), conn)
	}

	conn.SetContext(username)
	onlineUsers := []string{}

	s.mu.Lock()
	if len(s.userConns[username]) == 0 {
		msg := UserConnectedEventMsg{Username: username}
		s.server.BroadcastToNamespace(defaultNamespace, "user connected", &msg)
	}
	for user := range s.userConns {
		if user != username {
			onlineUsers = append(onlineUsers, user)
		}
	}
	s.userConns[username] = append(s.userConns[username], conn)
	s.mu.Unlock()

	conn.Emit(UsersEvent, onlineUsers)

	return nil
}

type MessageInput struct {
	To      string `json:"to"`
	Content string `json:"content"`
}

func (s *socketIo) SendPrivateMessage(conn socketio.Conn, msg string) {
	input := &MessageInput{}
	err := json.Unmarshal([]byte(msg), input)
	if err != nil {
		log.Printf("send private message unmarshal err: %v", err)
		return
	}

	username := conn.Context().(string)

	if _, err := s.messageService.CreateMessage(username, input.To, input.Content, false); err != nil {
		log.Printf("failed to send message: %v", err)
		return
	}

	eventMsg := &PrivateMessageEventMsg{
		From:    username,
		Content: input.Content,
	}

	s.server.BroadcastToRoom(defaultNamespace, input.To, PrivateMessageEvent, eventMsg)
}

func (s *socketIo) SendGroupMessage(conn socketio.Conn, msg string) {
	input := &MessageInput{}
	err := json.Unmarshal([]byte(msg), input)
	if err != nil {
		log.Printf("send private message unmarshal err: %v", err)
		return
	}

	username := conn.Context().(string)

	if _, err := s.messageService.CreateMessage(username, input.To, input.Content, true); err != nil {
		log.Printf("failed to send message: %v", err)
		return
	}

	eventMsg := &GroupMessageEventMsg{
		From:    username,
		To:      input.To,
		Content: input.Content,
	}

	s.server.BroadcastToRoom(groupNamespace, input.To, GroupMessageEvent, eventMsg)
}

func (s *socketIo) OnDisconnect(conn socketio.Conn, reason string) {
	username := conn.Context().(string)
	log.Printf("conn %s disconnecting: %s", conn.ID(), reason)

	s.mu.Lock()
	idx := -1
	for i, c := range s.userConns[username] {
		if c.ID() == conn.ID() {
			idx = i
			break
		}
	}

	if idx == -1 {
		log.Printf("conn %s not found in map", conn.ID())
		return
	}

	connsLen := len(s.userConns[username])
	s.userConns[username][idx] = s.userConns[username][connsLen-1]
	s.userConns[username] = s.userConns[username][:connsLen-1]

	if connsLen-1 == 0 {
		msg := UserDisconnectedEventMsg{Username: username}
		s.server.BroadcastToNamespace(defaultNamespace, UserDisconnectedEvent, &msg)
	}
	s.mu.Unlock()

	conn.Close()
}

func (s *socketIo) OnError(conn socketio.Conn, err error) {
	log.Printf("conn %s: %v", conn.ID(), err)
}

func (s *socketIo) PublishMessageDeletedEvent(chat *domain.Message) {
	namespace := defaultNamespace
	if chat.ToGroup {
		namespace = groupNamespace
	}

	s.server.BroadcastToNamespace(namespace, MessageDeletedEvent, chat)
}

func (s *socketIo) PublishMessageEdited(chat *domain.Message) {
	namespace := defaultNamespace
	if chat.ToGroup {
		namespace = groupNamespace
	}

	s.server.BroadcastToNamespace(namespace, MessageEditedEvent, chat)
}

func (s *socketIo) PublishJoinedGroupEvent(username string, groupId uuid.UUID) {
	msg := &JoinedGroupEventMsg{
		GroupId:  groupId,
		Username: username,
	}
	s.server.BroadcastToNamespace(groupNamespace, JoinedGroupEvent, msg)

	s.mu.Lock()
	for _, conn := range s.userConns[username] {
		s.server.JoinRoom(groupNamespace, groupId.String(), conn)
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
		s.server.LeaveRoom(groupNamespace, groupId.String(), conn)
	}
	s.mu.Unlock()

	s.server.BroadcastToNamespace(groupNamespace, LeftGroupEvent, msg)
}
