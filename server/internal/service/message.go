package service

import (
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
)

type Message struct {
	messageRepo    domain.MessageRepository
	eventPublisher EventPublisher
}

func NewMessage(messageRepo domain.MessageRepository) *Message {
	return &Message{
		messageRepo: messageRepo,
	}
}

// TODO: use domain event?
func (m *Message) SetEventPublisher(eventPublisher EventPublisher) {
	m.eventPublisher = eventPublisher
}

func (m *Message) CreateMessage(from string, to string, content string, toGroup bool) (*domain.Message, error) {
	message := domain.CreateMessage(from, to, content, toGroup)

	if err := m.messageRepo.CreateMessage(message); err != nil {
		return nil, err
	}

	return message, nil
}

func (m *Message) EditMessage(id uuid.UUID, newContent string) (*domain.Message, error) {
	message, err := m.messageRepo.FindOneMessageById(id)
	if err != nil {
		return nil, err
	}

	message.Content = newContent
	if err := m.messageRepo.UpdateMessage(message); err != nil {
		return nil, err
	}

	m.eventPublisher.PublishMessageEdited(message)

	return message, nil
}

func (m *Message) DeleteMessage(id uuid.UUID) error {
	message, err := m.messageRepo.FindOneMessageById(id)
	if err != nil {
		return err
	}

	if err := m.messageRepo.DeleteMessageById(id); err != nil {
		return err
	}

	m.eventPublisher.PublishMessageDeletedEvent(message)
	return nil
}

func (m *Message) GetPrivateChatMessages(userA string, userB string) ([]*domain.Message, error) {
	return m.messageRepo.FindPrivateMessages(userA, userB)
}
