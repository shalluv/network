package ws

import (
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
)

const (
	DefaultNamespace      string = "/"
	UserConnectedEvent    string = "user connected"
	UserDisconnectedEvent string = "user disconnected"
	PrivateMessageEvent   string = "private message"
	GroupMessageEvent     string = "group message"
	MessageDeletedEvent   string = "message deleted"
	MessageEditedEvent    string = "message edited"
	JoinedGroupEvent      string = "joined group"
	LeftGroupEvent        string = "left group"
	UsersEvent            string = "users"
)

type UserConnectedEventMsg struct {
	*domain.Profile
}

type UserDisconnectedEventMsg struct {
	Username string `json:"username"`
}

type PrivateMessageEventMsg struct {
	*domain.Message
}

type GroupMessageEventMsg struct {
	*domain.Message
}

type MessageDeletedEventMsg struct {
	*domain.Message
}

type MessageEditedEventMsg struct {
	*domain.Message
}

type JoinedGroupEventMsg struct {
	GroupId  uuid.UUID `json:"group_id"`
	Username string    `json:"username"`
}

type LeftGroupEventMsg struct {
	GroupId  uuid.UUID `json:"group_id"`
	Username string    `json:"username"`
}
