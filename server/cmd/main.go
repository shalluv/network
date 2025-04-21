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
	"github.com/shalluv/network/server/internal/ws"

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

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()

	r := gin.Default()
	r.Use(cors.Default())

	r.POST("/profiles", profileHandler.UploadProfile)
	r.GET("/profiles", profileHandler.GetAllProfiles)
	r.GET("/profiles/:username", profileHandler.GetProfile)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	r.POST("/ws/group", wsHandler.CreateGroup)
	r.GET("/ws/group/:groupId", wsHandler.JoinGroup)
	r.GET("/ws/groups", wsHandler.GetGroups)
	r.GET("/ws/clients/:groupId", wsHandler.GetClients)
	r.GET("/ws/users/:username/groups", wsHandler.GetGroupByUsername)
	r.DELETE("/ws/deleteGroup/:groupId", wsHandler.DeleteGroup)

	r.Run(fmt.Sprintf(":%d", config.Port))
}
