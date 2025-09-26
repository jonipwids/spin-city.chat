package handlers

import (
	"net/http"

	"cs-socket/internal/services"
	wshub "cs-socket/internal/websocket"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type WebSocketHandler struct {
	hub         *wshub.Hub
	authService *services.AuthService
	upgrader    websocket.Upgrader
}

func NewWebSocketHandler(hub *wshub.Hub, authService *services.AuthService) *WebSocketHandler {
	return &WebSocketHandler{
		hub:         hub,
		authService: authService,
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // Allow all origins in development
			},
		},
	}
}

func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// Get user info from JWT middleware
	userID := c.GetString("userID")
	username := c.GetString("username")
	role := c.GetString("role")

	if userID == "" || username == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upgrade connection"})
		return
	}

	// Update user status to online
	h.authService.UpdateUserStatus(userID, true)

	// Handle the WebSocket connection
	h.hub.HandleWebSocket(conn, userID, username, role)
}
