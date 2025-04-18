package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shalluv/network/server/internal/service"
)

type profileHandler struct {
	profileService *service.Profile
}

func NewProfileHandler(profileService *service.Profile) *profileHandler {
	return &profileHandler{profileService}
}

type UploadProfileInput struct {
	Username string `json:"username"`
	Image    string `json:"image"`
}

func (p *profileHandler) UploadProfile(c *gin.Context) {
	input := &UploadProfileInput{}

	if err := c.ShouldBindJSON(input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := p.profileService.UploadProfile(input.Username, input.Image); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func (p *profileHandler) GetProfile(c *gin.Context) {
	username := c.Param("username")

	profile, err := p.profileService.GetUserProfile(username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}
