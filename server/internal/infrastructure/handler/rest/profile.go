package rest

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shalluv/network/server/internal/service"
)

type profile struct {
	profileService *service.Profile
}

func NewProfile(profileService *service.Profile) *profile {
	return &profile{profileService}
}

type UploadProfileInput struct {
	Username string `json:"username"`
	Image    string `json:"image"`
}

// UploadProfile godoc
//
//	@Summary		upload profile
//	@Description	upload user profile
//	@Tags			profiles
//	@Accept			json
//	@Param			request	body	UploadProfileInput	true	"request"
//	@Success		204
//	@Router			/profiles [post]
func (p *profile) UploadProfile(c *gin.Context) {
	input := &UploadProfileInput{}

	if err := c.ShouldBindJSON(input); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	if err := p.profileService.UploadProfile(input.Username, input.Image); err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetProfile godoc
//
//	@Summary		get user profile
//	@Description	get profile by username
//	@Tags			profiles
//	@Produce		json
//	@Param			username	path		string	true	"username"
//	@Success		200			{object}	domain.Profile
//	@Failure		404			{object}	errorResponse
//	@Router			/profiles/{username} [get]
func (p *profile) GetProfile(c *gin.Context) {
	username := c.Param("username")

	profile, err := p.profileService.GetUserProfile(username)
	if err != nil {
		c.JSON(http.StatusNotFound, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// GetAllProfiles godoc
//
//	@Summary		get all user profiles
//	@Description	retrieve all user profiles in the system
//	@Tags			profiles
//	@Produce		json
//	@Success		200	{array}	domain.Profile
//	@Router			/profiles [get]
func (p *profile) GetAllProfiles(c *gin.Context) {
	profiles, err := p.profileService.GetAllUserProfiles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, profiles)
}

// GetUserGroups godoc
//
//	@Summary		get all groups of user
//	@Description	retrieve all groups of user
//	@Tags			profiles
//	@Param			username	path	string	true	"username"
//	@Produce		json
//	@Success		200	{array}	domain.Group
//	@Router			/profiles/{username}/groups [get]
func (p *profile) GetUserGroups(c *gin.Context) {
	username := c.Param("username")

	groups, err := p.profileService.GetUserGroups(username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, groups)
}
