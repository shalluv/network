package domain

type Profile struct {
	Username string `json:"username" gorm:"primaryKey"`
	Image    string `json:"image"`
}

func CreateProfile(username string, image string) *Profile {
	return &Profile{
		Username: username,
		Image:    image,
	}
}
