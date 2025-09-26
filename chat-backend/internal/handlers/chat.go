package handlers

import (
	"net/http"
	"strconv"

	"cs-socket/internal/models"
	"cs-socket/internal/services"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	chatService *services.ChatService
}

func NewChatHandler(chatService *services.ChatService) *ChatHandler {
	return &ChatHandler{
		chatService: chatService,
	}
}

func (h *ChatHandler) GetChats(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	chats, err := h.chatService.GetChats(userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    chats,
	})
}

func (h *ChatHandler) GetAvailableAgents(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	// Only customers can access this endpoint
	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only customers can view available agents"})
		return
	}

	agents, err := h.chatService.GetAvailableAgents(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    agents,
	})
}

func (h *ChatHandler) GetAvailableCustomers(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	// Only agents and super-agents can access this endpoint
	if role != "agent" && role != "super-agent" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only agents can view available customers"})
		return
	}

	customers, err := h.chatService.GetAvailableCustomers(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    customers,
	})
}

func (h *ChatHandler) GetChat(c *gin.Context) {
	chatID := c.Param("id")

	chat, err := h.chatService.GetChat(chatID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    chat,
	})
}

func (h *ChatHandler) CreateChat(c *gin.Context) {
	var req models.CreateChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chat, err := h.chatService.CreateChat(req.CustomerID, req.AgentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    chat,
	})
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	chatID := c.Param("id")
	senderID := c.GetString("userID")

	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.MessageType == "" {
		req.MessageType = "text"
	}

	message, err := h.chatService.SendMessage(chatID, senderID, req.Content, req.MessageType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    message,
	})
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	chatID := c.Param("id")

	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		offset = 0
	}

	messages, err := h.chatService.GetMessages(chatID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    messages,
	})
}

func (h *ChatHandler) UpdateChatStatus(c *gin.Context) {
	chatID := c.Param("id")

	var req models.UpdateChatStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.chatService.UpdateChatStatus(chatID, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Chat status updated successfully",
	})
}

func (h *ChatHandler) GetArchivedChats(c *gin.Context) {
	userID := c.GetString("userID")
	role := c.GetString("role")

	chats, err := h.chatService.GetArchivedChats(userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    chats,
	})
}

func (h *ChatHandler) ArchiveChat(c *gin.Context) {
	chatID := c.Param("id")
	userID := c.GetString("userID")
	role := c.GetString("role")

	err := h.chatService.ArchiveChat(chatID, userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Chat archived successfully",
	})
}

func (h *ChatHandler) UnarchiveChat(c *gin.Context) {
	chatID := c.Param("id")
	userID := c.GetString("userID")
	role := c.GetString("role")

	err := h.chatService.UnarchiveChat(chatID, userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Chat unarchived successfully",
	})
}

func (h *ChatHandler) DeleteChat(c *gin.Context) {
	chatID := c.Param("id")

	err := h.chatService.DeleteChat(chatID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Chat deleted successfully",
	})
}
