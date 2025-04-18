package main

import (
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/shalluv/network/server/internal/config"
	"github.com/shalluv/network/server/internal/infrastructure/database"
	"github.com/shalluv/network/server/internal/infrastructure/handler/rest"
	"github.com/shalluv/network/server/internal/service"
)

func main() {
	config, err := config.Load()
	if err != nil {
		log.Fatal(err)
	}

	db, err := database.NewSqlite(config.SqliteFilename)
	if err != nil {
		log.Fatal(err)
	}
	profileDB := database.NewProfile(db)

	profileService := service.NewProfile(profileDB)

	profileHandler := rest.NewProfileHandler(profileService)

	r := gin.Default()
	r.Use(cors.Default())

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	r.POST("/profiles", profileHandler.UploadProfile)
	r.GET("/profiles/:username", profileHandler.GetProfile)

	r.Run(fmt.Sprintf(":%d", config.Port))
}
