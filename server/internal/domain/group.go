package domain

import "github.com/google/uuid"

type Group struct {
	Id   uuid.UUID `json:"id" gorm:"primaryKey"`
	Name string    `json:"name"`
}

func CreateGroup(name string) *Group {
	return &Group{
		Id:   uuid.New(),
		Name: name,
	}
}

type GroupMember struct {
	GroupId  uuid.UUID `gorm:"uniqueIndex:idx_user_group"`
	Username string    `gorm:"uniqueIndex:idx_user_group"`
	Group    Group     `gorm:"foreignKey:GroupId;OnDelete:SET NULL;"`
}

func CreateGroupMember(groupId uuid.UUID, username string) *GroupMember {
	return &GroupMember{
		GroupId:  groupId,
		Username: username,
	}
}
