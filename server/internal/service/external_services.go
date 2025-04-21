package service

import (
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
)

type EventPublisher interface {
	PublishMessageDeletedEvent(chat *domain.Message)
	PublishMessageEdited(chat *domain.Message)
	PublishJoinedGroupEvent(username string, groupId uuid.UUID)
	PublishLeftGroupEvent(username string, groupId uuid.UUID)
}
