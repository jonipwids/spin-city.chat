package websocket

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

type Hub struct {
	clients          map[*Client]bool
	broadcast        chan []byte
	register         chan *Client
	unregister       chan *Client
	statusUpdateFunc func(userID string, isOnline bool) error
}

type Client struct {
	hub      *Hub
	conn     *websocket.Conn
	send     chan []byte
	userID   string
	username string
	role     string
}

type Message struct {
	Type     string      `json:"type"`
	Data     interface{} `json:"data"`
	UserID   string      `json:"userId,omitempty"`
	Username string      `json:"username,omitempty"`
	ChatID   string      `json:"chatId,omitempty"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) SetStatusUpdateFunc(fn func(userID string, isOnline bool) error) {
	h.statusUpdateFunc = fn
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
			log.Printf("Client connected: %s (%s)", client.username, client.userID)

			// Update user status in database
			if h.statusUpdateFunc != nil {
				h.statusUpdateFunc(client.userID, true)
			}

			// Notify other clients about the new connection
			notification := Message{
				Type:     "user_connected",
				UserID:   client.userID,
				Username: client.username,
				Data: map[string]interface{}{
					"userId":   client.userID,
					"username": client.username,
					"isOnline": true,
				},
			}
			h.broadcastToOthers(client, notification)

		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("Client disconnected: %s (%s)", client.username, client.userID)

				// Update user status in database
				if h.statusUpdateFunc != nil {
					h.statusUpdateFunc(client.userID, false)
				}

				// Notify other clients about the disconnection
				notification := Message{
					Type:     "user_disconnected",
					UserID:   client.userID,
					Username: client.username,
					Data: map[string]interface{}{
						"userId":   client.userID,
						"username": client.username,
						"isOnline": false,
					},
				}
				h.broadcastToOthers(client, notification)
			}

		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

func (h *Hub) broadcastToOthers(sender *Client, message Message) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	for client := range h.clients {
		if client != sender {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

func (h *Hub) BroadcastToChat(chatID string, message Message) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	message.ChatID = chatID
	// Broadcast to all clients for now - in a real implementation,
	// you would filter by chat participants, but this ensures
	// all users see updated chat lists when messages are sent
	for client := range h.clients {
		select {
		case client.send <- data:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
}

func (h *Hub) BroadcastToUser(userID string, message Message) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	for client := range h.clients {
		if client.userID == userID {
			select {
			case client.send <- data:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		// Set sender information
		msg.UserID = c.userID
		msg.Username = c.username

		// Broadcast the message
		if data, err := json.Marshal(msg); err == nil {
			c.hub.broadcast <- data
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("WebSocket write error: %v", err)
				return
			}
		}
	}
}

func (h *Hub) HandleWebSocket(conn *websocket.Conn, userID, username, role string) {
	client := &Client{
		hub:      h,
		conn:     conn,
		send:     make(chan []byte, 256),
		userID:   userID,
		username: username,
		role:     role,
	}

	h.register <- client

	go client.writePump()
	go client.readPump()
}
