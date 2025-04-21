package domain

type ProfileRepository interface {
	CreateProfile(profile *Profile) error
	UpdateProfile(profile *Profile) error
	FindOneByUsername(username string) (*Profile, error)
	FindAll() ([]*Profile, error)
}
