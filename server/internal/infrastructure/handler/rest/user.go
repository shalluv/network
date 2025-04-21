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

// UploadProfile godoc
//
//	@Summary		upload profile
//	@Description	upload user profile
//	@Tags			profiles
//	@Accept			json
//	@Param			request	body	UploadProfileInput	true	"request"
//	@Success		204
//	@Router			/profiles [post]
func (p *profileHandler) UploadProfile(c *gin.Context) {
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
func (p *profileHandler) GetProfile(c *gin.Context) {
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
//	@Success		200	{array}		domain.Profile
//	@Failure		500	{object}	errorResponse
//	@Router			/profiles [get]
func (h *profileHandler) GetAllProfiles(c *gin.Context) {
	profiles, err := h.profileService.GetAllUserProfiles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, &errorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, profiles)
}
