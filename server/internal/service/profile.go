package service

import "github.com/shalluv/network/server/internal/domain"

type Profile struct {
	profileRepo domain.ProfileRepository
	groupRepo   domain.GroupRepository
}

func NewProfile(profileRepo domain.ProfileRepository, groupRepo domain.GroupRepository) *Profile {
	return &Profile{
		profileRepo,
		groupRepo,
	}
}

func (p *Profile) UploadProfile(username string, image string) error {
	profile, err := p.profileRepo.FindOneByUsername(username)
	if err == nil {
		// cannot remove profile :D
		if len(image) == 0 {
			return nil
		}
		profile.Image = image
		return p.profileRepo.UpdateProfile(profile)
	}
	// assume err is always not found, so this will create new profile

	profile = domain.CreateProfile(username, image)
	return p.profileRepo.CreateProfile(profile)
}

func (p *Profile) GetUserProfile(username string) (*domain.Profile, error) {
	return p.profileRepo.FindOneByUsername(username)
}

func (p *Profile) GetAllUserProfiles() ([]*domain.Profile, error) {
	return p.profileRepo.FindAll()
}

func (g *Profile) GetUserGroups(username string) ([]*domain.Group, error) {
	return g.groupRepo.FindGroupsByUsername(username)
}
