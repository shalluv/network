package service

import (
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
)

type Group struct {
	groupRepo domain.GroupRepository
}

func NewGroup(groupRepo domain.GroupRepository) *Group {
	return &Group{groupRepo}
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
	return g.groupRepo.AddGroupMember(groupMember)
}

func (g *Group) GetMembersInGroup(id uuid.UUID) ([]*domain.Profile, error) {
	return g.groupRepo.FindMembersByGroupId(id)
}

func (g *Group) LeaveGroup(groupId uuid.UUID, username string) error {
	return g.groupRepo.LeaveGroup(groupId, username)
}
