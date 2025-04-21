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

	_ "github.com/shalluv/network/server/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

//	@title			Server
//	@version		1.0
//	@description	network project backend server

// @host	localhost:8080
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

	r.POST("/profiles", profileHandler.UploadProfile)
	r.GET("/profiles", profileHandler.GetAllProfiles)
	r.GET("/profiles/:username", profileHandler.GetProfile)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.Run(fmt.Sprintf(":%d", config.Port))
}
