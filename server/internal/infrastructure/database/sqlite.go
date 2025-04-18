package database

import (
	"github.com/shalluv/network/server/internal/domain"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func NewSqlite(filename string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(filename), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(&domain.Profile{}); err != nil {
		return nil, err
	}
	return db, nil
}
