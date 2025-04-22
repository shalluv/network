package domain

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	Id        uuid.UUID `json:"id" gorm:"primaryKey"`
	From      string    `json:"from"`
	To        string    `json:"to"`
	Content   string    `json:"content"`
	ToGroup   bool      `json:"to_group"`
	CreatedAt time.Time `json:"created_at"`
}

func CreateMessage(from string, to string, content string, toGroup bool) *Message {
	return &Message{
		Id:        uuid.New(),
		From:      from,
		To:        to,
		Content:   content,
		ToGroup:   toGroup,
		CreatedAt: time.Now(),
	}
}
