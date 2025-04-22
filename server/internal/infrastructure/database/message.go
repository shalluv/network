package database

import (
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
	"gorm.io/gorm"
)

type message struct {
	*gorm.DB
}

func NewMessage(db *gorm.DB) *message {
	return &message{db}
}

func (m *message) CreateMessage(message *domain.Message) error {
	return m.Create(message).Error
}

func (m *message) FindOneMessageById(id uuid.UUID) (*domain.Message, error) {
	message := &domain.Message{}
	if err := m.First(message, "id = ?", id).Error; err != nil {
		return nil, nil
	}
	return message, nil
}

func (m *message) FindGroupMessages(groupId uuid.UUID) ([]*domain.Message, error) {
	messages := []*domain.Message{}
	if err := m.Find(&messages, `"to" = ? AND to_group = true`, groupId).Order("created_AT ASC").Error; err != nil {
		return nil, err
	}
	return messages, nil
}

func (m *message) FindPrivateMessages(userA string, userB string) ([]*domain.Message, error) {
	messages := []*domain.Message{}
	if err := m.
		Find(&messages, `(("from" = ? AND "to" = ?) OR ("from" = ? AND "to" = ?)) AND to_group = false`, userA, userB, userB, userA).
		Order("created_at ASC").
		Error; err != nil {
		return nil, err
	}
	return messages, nil
}

func (m *message) UpdateMessage(message *domain.Message) error {
	return m.Updates(message).Error
}

func (m *message) DeleteMessageById(id uuid.UUID) error {
	return m.Delete(&domain.Message{}, "id = ?", id).Error
}
