package database

import (
	"github.com/shalluv/network/server/internal/domain"
	"gorm.io/gorm"
)

type profile struct {
	*gorm.DB
}

func NewProfile(db *gorm.DB) *profile {
	return &profile{db}
}

func (p *profile) FindOneByUsername(username string) (*domain.Profile, error) {
	profile := &domain.Profile{}

	if err := p.First(profile, "username = ?", username).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func (p *profile) CreateProfile(profile *domain.Profile) error {
	return p.Create(profile).Error
}

func (p *profile) UpdateProfile(profile *domain.Profile) error {
	return p.Save(profile).Error
}
