package service

import (
	"errors"

	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
)

type Group struct {
	groupRepo      domain.GroupRepository
	messageRepo    domain.MessageRepository
	eventPublisher EventPublisher
}

func NewGroup(groupRepo domain.GroupRepository, messageRepo domain.MessageRepository) *Group {
	return &Group{
		groupRepo:   groupRepo,
		messageRepo: messageRepo,
	}
}

// TODO: use domain event?
func (g *Group) SetEventPublisher(eventPublisher EventPublisher) {
	g.eventPublisher = eventPublisher
}

func (g *Group) CreateGroup(name string, username string) (*domain.Group, error) {
	group := domain.CreateGroup(name)
	if err := g.groupRepo.CreateGroup(group); err != nil {
		return nil, err
	}

	groupMember := domain.CreateGroupMember(group.Id, username)
	if err := g.groupRepo.AddGroupMember(groupMember); err != nil {
		return nil, err
	}

	return group, nil
}

func (g *Group) GetAllGroups() ([]*domain.Group, error) {
	return g.groupRepo.FindAllGroups()
}

func (g *Group) JoinGroup(groupId uuid.UUID, username string) error {
	groupMember := domain.CreateGroupMember(groupId, username)
	if err := g.groupRepo.AddGroupMember(groupMember); err != nil {
		return err
	}
	g.eventPublisher.PublishJoinedGroupEvent(username, groupId)
	return nil
}

func (g *Group) GetMembersInGroup(id uuid.UUID) ([]*domain.Profile, error) {
	return g.groupRepo.FindMembersByGroupId(id)
}

func (g *Group) LeaveGroup(groupId uuid.UUID, username string) error {
	if err := g.groupRepo.LeaveGroup(groupId, username); err != nil {
		return err
	}
	g.eventPublisher.PublishLeftGroupEvent(username, groupId)
	return nil
}

func (g *Group) GetGroupChatMessages(groupId uuid.UUID, username string) ([]*domain.Message, error) {
	isInGroup, err := g.groupRepo.CheckIsUserInGroup(username, groupId)
	if err != nil {
		return nil, err
	}
	if !isInGroup {
		return nil, errors.New("unauthorized")
	}

	return g.messageRepo.FindGroupMessages(groupId)
}
