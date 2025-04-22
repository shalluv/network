package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shalluv/network/server/internal/service"
)

type message struct {
	messageService *service.Message
}

func NewMessage(messageService *service.Message) *message {
	return &message{messageService}
}

type EditMessageInput struct {
	Content string `json:"content"`
}

// EditMessage godoc
//
//	@Summary		edit a message
//	@Description	edit a message
//	@Tags			messages
//	@Param			id		path	string				true	"id"
//	@Param			request	body	EditMessageInput	true	"request"
//	@Produce		json
//	@Success		200	{object}	domain.Message
//	@Router			/messages/{id} [patch]
func (m *message) EditMessage(c *gin.Context) {
	id := uuid.MustParse(c.Param("id"))
	input := &EditMessageInput{}

	if err := c.ShouldBindJSON(input); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	message, err := m.messageService.EditMessage(id, input.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, message)
}

// DeleteMessage godoc
//
//	@Summary		delete a message
//	@Description	delete a message
//	@Tags			messages
//	@Param			id	path	string	true	"id"
//	@Success		204
//	@Router			/messages/{id} [delete]
func (m *message) DeleteMessage(c *gin.Context) {
	id := uuid.MustParse(c.Param("id"))

	if err := m.messageService.DeleteMessage(id); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetPrivateMessages godoc
//
//	@Summary		get messages between users
//	@Description	retrieve messages between users
//	@Tags			messages
//	@Param			user1	path	string	true	"user1"
//	@Param			user2	path	string	true	"user2"
//	@Produce		json
//	@Success		200	{array}	domain.Message
//	@Router			/{user1}/{user2}/messages [get]
func (m *message) GetPrivateMessages(c *gin.Context) {
	userA := c.Param("user1")
	userB := c.Param("user2")

	messages, err := m.messageService.GetPrivateChatMessages(userA, userB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, messages)
}
