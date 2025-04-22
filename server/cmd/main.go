package main

import (
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
	"github.com/shalluv/network/server/internal/config"
	"github.com/shalluv/network/server/internal/infrastructure/database"
	"github.com/shalluv/network/server/internal/infrastructure/handler/rest"
	"github.com/shalluv/network/server/internal/infrastructure/handler/ws"
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
	groupDB := database.NewGroup(db)
	messageDB := database.NewMessage(db)

	profileService := service.NewProfile(profileDB, groupDB)
	messageService := service.NewMessage(messageDB)
	groupService := service.NewGroup(groupDB, messageDB)

	socketIoServer := socketio.NewServer(nil)
	socketIoHandler := ws.NewSocketIo(socketIoServer, profileService, messageService)
	groupService.SetEventPublisher(socketIoHandler)
	messageService.SetEventPublisher(socketIoHandler)

	socketIoServer.OnConnect(ws.DefaultNamespace, socketIoHandler.OnConnect)
	socketIoServer.OnEvent(ws.DefaultNamespace, ws.PrivateMessageEvent, socketIoHandler.SendPrivateMessage)
	socketIoServer.OnEvent(ws.DefaultNamespace, ws.GroupMessageEvent, socketIoHandler.SendGroupMessage)
	socketIoServer.OnDisconnect(ws.DefaultNamespace, socketIoHandler.OnDisconnect)
	socketIoServer.OnError(ws.DefaultNamespace, socketIoHandler.OnError)

	go func() {
		if err := socketIoServer.Serve(); err != nil {
			log.Fatalf("socketio listen error: %s\n", err)
		}
	}()
	defer socketIoServer.Close()

	profileHandler := rest.NewProfile(profileService)
	groupHandler := rest.NewGroup(groupService)
	messageHandler := rest.NewMessage(messageService)

	// hub := ws.NewHub()
	// wsHandler := ws.NewHandler(hub)
	// go hub.Run()

	r := gin.Default()
	r.Use(cors.Default())

	r.POST("/profiles", profileHandler.UploadProfile)
	r.GET("/profiles", profileHandler.GetAllProfiles)
	r.GET("/profiles/:username", profileHandler.GetProfile)
	r.GET("/profiles/:username/groups", profileHandler.GetUserGroups)

	r.POST("/groups", groupHandler.CreateGroup)
	r.GET("/groups", groupHandler.GetAllGroups)
	r.POST("/groups/:group_id", groupHandler.JoinGroup)
	r.GET("/groups/:group_id/members", groupHandler.GetGroupMembers)
	r.DELETE("/groups/:group_id/members/:username", groupHandler.LeaveGroup)
	r.GET("/groups/:group_id/messages", groupHandler.GetGroupMessages)

	r.PATCH("/messages/:id", messageHandler.EditMessage)
	r.DELETE("/messages/:id", messageHandler.DeleteMessage)
	r.GET("/:user1/:user2/messages", messageHandler.GetPrivateMessages)

	r.GET("/socket.io/*any", gin.WrapH(socketIoServer))
	r.POST("/socket.io/*any", gin.WrapH(socketIoServer))
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// r.POST("/ws/group", wsHandler.CreateGroup)
	// r.GET("/ws/group/:groupId", wsHandler.JoinGroup)
	// r.GET("/ws/groups", wsHandler.GetGroups)
	// r.GET("/ws/clients/:groupId", wsHandler.GetClients)
	// r.GET("/ws/users/:username/groups", wsHandler.GetGroupByUsername)
	// r.DELETE("/ws/deleteGroup/:groupId", wsHandler.DeleteGroup)

	r.Run(fmt.Sprintf(":%d", config.Port))
}
