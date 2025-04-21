package service

import "github.com/shalluv/network/server/internal/domain"

type Profile struct {
	profileRepo domain.ProfileRepository
}

func NewProfile(profileRepo domain.ProfileRepository) *Profile {
	return &Profile{profileRepo}
}

func (p *Profile) UploadProfile(username string, image string) error {
	profile, err := p.profileRepo.FindOneByUsername(username)
	if err == nil {
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
