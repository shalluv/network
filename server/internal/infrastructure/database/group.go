package database

import (
	"errors"

	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/domain"
	"gorm.io/gorm"
)

type group struct {
	*gorm.DB
}

func NewGroup(db *gorm.DB) *group {
	return &group{db}
}

func (g *group) CreateGroup(group *domain.Group) error {
	return g.Create(group).Error
}

func (g *group) FindAllGroups() ([]*domain.Group, error) {
	groups := []*domain.Group{}
	if err := g.Find(&groups).Error; err != nil {
		return nil, err
	}
	return groups, nil
}

func (g *group) CheckIsUserInGroup(username string, groupId uuid.UUID) (bool, error) {
	if err := g.First(&domain.GroupMember{GroupId: groupId, Username: username}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}

func (g *group) AddGroupMember(groupMember *domain.GroupMember) error {
	return g.Create(groupMember).Error
}

func (g *group) FindMembersByGroupId(id uuid.UUID) ([]*domain.Profile, error) {
	groupMembers := []*domain.GroupMember{}

	if err := g.Find(&groupMembers, "group_id = ?", id).Error; err != nil {
		return nil, err
	}

	// TODO: use join

	members := []string{}
	for _, member := range groupMembers {
		members = append(members, member.Username)
	}

	profiles := []*domain.Profile{}

	if err := g.Find(&profiles, "username IN (?)", members).Error; err != nil {
		return nil, err
	}

	return profiles, nil
}

func (g *group) FindGroupsByUsername(username string) ([]*domain.Group, error) {
	groupMembers := []*domain.GroupMember{}

	if err := g.Find(&groupMembers, "username = ?", username).Error; err != nil {
		return nil, err
	}

	// TODO: use join

	groupIds := []uuid.UUID{}

	for _, group := range groupMembers {
		groupIds = append(groupIds, group.GroupId)
	}

	groups := []*domain.Group{}

	if err := g.Find(&groups, "id IN (?)", groupIds).Error; err != nil {
		return nil, err
	}

	return groups, nil
}

func (g *group) LeaveGroup(groupId uuid.UUID, username string) error {
	return g.Delete(&domain.GroupMember{}, "group_id = ? AND username = ?", groupId, username).Error
}
