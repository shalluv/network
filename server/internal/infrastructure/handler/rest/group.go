package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/service"
)

type group struct {
	groupService *service.Group
}

func NewGroup(groupService *service.Group) *group {
	return &group{groupService}
}

type CreateGroupInput struct {
	Name     string `json:"name"`
	Username string `json:"username"`
}

// CreateGroup godoc
//
//	@Summary		create group chat
//	@Description	create group chat
//	@Tags			groups
//	@Accept			json
//	@Param			request	body		CreateGroupInput	true	"request"
//	@Success		201		{object}	domain.Group
//	@Router			/groups [post]
func (g *group) CreateGroup(c *gin.Context) {
	input := &CreateGroupInput{}

	if err := c.ShouldBindJSON(input); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}
	group, err := g.groupService.CreateGroup(input.Name, input.Username)

	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, group)
}

// GetAllGroups godoc
//
//	@Summary		get all groups
//	@Description	retrieve all groups
//	@Tags			groups
//	@Produce		json
//	@Success		200	{array}	domain.Group
//	@Router			/groups [get]
func (g *group) GetAllGroups(c *gin.Context) {
	groups, err := g.groupService.GetAllGroups()
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, groups)
}

type JoinGroupInput struct {
	Username string `json:"username"`
}

// JoinGroup godoc
//
//	@Summary		join group
//	@Description	join a group
//	@Tags			groups
//	@Param			group_id	path	string			true	"group_id"
//	@Param			request		body	JoinGroupInput	true	"request"
//	@Success		204
//	@Router			/groups/{group_id} [post]
func (g *group) JoinGroup(c *gin.Context) {
	groupId := c.Param("group_id")
	input := &JoinGroupInput{}

	if err := c.ShouldBindJSON(input); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	if err := g.groupService.JoinGroup(uuid.MustParse(groupId), input.Username); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetGroupMembers godoc
//
//	@Summary		get members in group
//	@Description	retrieve members in group
//	@Tags			groups
//	@Param			group_id	path	string	true	"group_id"
//	@Produce		json
//	@Success		200	{array}	domain.Profile
//	@Router			/groups/{group_id}/members [get]
func (g *group) GetGroupMembers(c *gin.Context) {
	groupId := uuid.MustParse(c.Param("group_id"))

	members, err := g.groupService.GetMembersInGroup(groupId)
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, members)
}

// LeaveGroup godoc
//
//	@Summary		leave group
//	@Description	leave a group
//	@Tags			groups
//	@Param			group_id	path	string	true	"group_id"
//	@Param			username	path	string	true	"username"
//	@Success		204
//	@Router			/groups/{group_id}/members/{username} [delete]
func (g *group) LeaveGroup(c *gin.Context) {
	groupId := uuid.MustParse(c.Param("group_id"))
	username := c.Param("username")

	if err := g.groupService.LeaveGroup(groupId, username); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetGroupMessages godoc
//
//	@Summary		get messages in group
//	@Description	retrieve messages in group
//	@Tags			groups
//	@Param			group_id	path	string	true	"group_id"
//	@Param			user		query	string	true	"user"
//	@Produce		json
//	@Success		200	{array}	domain.Message
//	@Router			/groups/{group_id}/messages [get]
func (g *group) GetGroupMessages(c *gin.Context) {
	username := c.Query("user")
	groupId := uuid.MustParse(c.Param("group_id"))
	messages, err := g.groupService.GetGroupChatMessages(groupId, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, messages)
}
