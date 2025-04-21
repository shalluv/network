package domain

import "github.com/google/uuid"

type Chat struct {
	Id      uuid.UUID `json:"id" gorm:"primaryKey"`
	From    string    `json:"from"`
	To      uuid.UUID `json:"to"`
	ToGroup bool      `json:"-"`
}

func CreateChat(from string, to uuid.UUID, toGroup bool) *Chat {
	return &Chat{
		Id:      uuid.New(),
		From:    from,
		To:      to,
		ToGroup: toGroup,
	}
}
