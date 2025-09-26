package models

import (
	"time"
)

type User struct {
	ID        string    `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"-" db:"password_hash"`
	Name      string    `json:"name" db:"name"`
	Role      string    `json:"role" db:"role"`
	Avatar    *string   `json:"avatar" db:"avatar"`
	IsOnline  bool      `json:"isOnline" db:"is_online"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type Chat struct {
	ID          string    `json:"id" db:"id"`
	CustomerID  string    `json:"customerId" db:"customer_id"`
	AgentID     *string   `json:"agentId" db:"agent_id"`
	Status      string    `json:"status" db:"status"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
	Customer    *User     `json:"customer,omitempty"`
	Agent       *User     `json:"agent,omitempty"`
	Messages    []Message `json:"messages,omitempty"`
	LastMessage *Message  `json:"lastMessage,omitempty"`
	IsActive    bool      `json:"isActive"`
}

type Message struct {
	ID          string    `json:"id" db:"id"`
	ChatID      string    `json:"chatId" db:"chat_id"`
	SenderID    string    `json:"senderId" db:"sender_id"`
	Content     string    `json:"content" db:"content"`
	MessageType string    `json:"type" db:"message_type"`
	CreatedAt   time.Time `json:"timestamp" db:"created_at"`
	Sender      *User     `json:"sender,omitempty"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role"`
}

type SendMessageRequest struct {
	Content     string `json:"content" binding:"required"`
	MessageType string `json:"type"`
}

type CreateChatRequest struct {
	CustomerID string  `json:"customerId" binding:"required"`
	AgentID    *string `json:"agentId,omitempty"`
}

type UpdateStatusRequest struct {
	IsOnline bool `json:"isOnline"`
}

type UpdateChatStatusRequest struct {
	Status string `json:"status" binding:"required"`
}
