package domain

import "github.com/google/uuid"

type ProfileRepository interface {
	CreateProfile(profile *Profile) error
	UpdateProfile(profile *Profile) error
	FindOneByUsername(username string) (*Profile, error)
	FindAll() ([]*Profile, error)
}

type GroupRepository interface {
	CreateGroup(group *Group) error
	FindAllGroups() ([]*Group, error)
	CheckIsUserInGroup(username string, groupId uuid.UUID) (bool, error)
	AddGroupMember(groupMember *GroupMember) error
	FindMembersByGroupId(id uuid.UUID) ([]*Profile, error)
	FindGroupsByUsername(username string) ([]*Group, error)
	LeaveGroup(groupId uuid.UUID, username string) error
}
