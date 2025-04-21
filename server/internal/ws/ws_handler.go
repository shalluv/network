package ws

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) *Handler {
	return &Handler{
		hub: h,
	}
}

type CreateGroupReq struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) CreateGroup(c *gin.Context) {
	var req CreateGroupReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.hub.Groups[req.ID] = &Group{
		ID:      req.ID,
		Name:    req.Name,
		Clients: make(map[string]*Client),
	}

	c.JSON(http.StatusOK, req)
}

func (h *Handler) DeleteGroup(c *gin.Context) {
	groupID := c.Param("groupId")

	if _, ok := h.hub.Groups[groupID]; !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "Group not found"})
		return
	}

	delete(h.hub.Groups, groupID)

	c.JSON(http.StatusOK, gin.H{"message": "Group deleted", "groupID": groupID})
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *Handler) JoinGroup(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	groupID := c.Param("groupId")
	username := c.Query("username")

	cl := &Client{
		Conn:     conn,
		Message:  make(chan *Message, 10),
		GroupID:  groupID,
		Username: username,
	}

	m := &Message{
		Content:  "A new user has joined the room",
		GroupID:  groupID,
		Username: username,
	}

	h.hub.Register <- cl
	h.hub.Broadcast <- m

	go cl.writeMessage()
	cl.readMessage(h.hub)
}

type GroupRes struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) GetGroups(c *gin.Context) {
	groups := make([]GroupRes, 0)

	for _, r := range h.hub.Groups {
		groups = append(groups, GroupRes{
			ID:   r.ID,
			Name: r.Name,
		})
	}

	c.JSON(http.StatusOK, groups)
}

type ClientRes struct {
	Username string `json:"username"`
}

func (h *Handler) GetClients(c *gin.Context) {
	var clients []ClientRes
	groupId := c.Param("groupId")

	if _, ok := h.hub.Groups[groupId]; !ok {
		clients = make([]ClientRes, 0)
		c.JSON(http.StatusOK, clients)
	}

	for _, c := range h.hub.Groups[groupId].Clients {
		clients = append(clients, ClientRes{
			Username: c.Username,
		})
	}

	c.JSON(http.StatusOK, clients)
}

func (h *Handler) GetGroupByUsername(c *gin.Context) {
	username := c.Param("username")
	var joinedGroups []GroupRes

	for _, group := range h.hub.Groups {
		if _, ok := group.Clients[username]; ok {
			joinedGroups = append(joinedGroups, GroupRes{
				ID:   group.ID,
				Name: group.Name,
			})
		}
	}

	c.JSON(http.StatusOK, joinedGroups)
}
