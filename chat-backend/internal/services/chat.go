package services

import (
	"database/sql"

	"cs-socket/internal/models"
	"cs-socket/internal/websocket"

	"github.com/google/uuid"
)

type ChatService struct {
	db  *sql.DB
	hub *websocket.Hub
}

func NewChatService(db *sql.DB, hub *websocket.Hub) *ChatService {
	return &ChatService{
		db:  db,
		hub: hub,
	}
}

func (s *ChatService) GetChats(userID, role string) ([]models.Chat, error) {
	var query string
	var args []interface{}

	if role == "customer" {
		query = `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
				 u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
				 u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
				 FROM chats c
				 LEFT JOIN users u1 ON c.customer_id = u1.id
				 LEFT JOIN users u2 ON c.agent_id = u2.id
				 WHERE c.customer_id = $1 AND c.status != 'archived'
				 ORDER BY c.updated_at DESC`
		args = []interface{}{userID}
	} else if role == "super-agent" {
		// Super-agents can see all chats
		query = `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
				 u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
				 u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
				 FROM chats c
				 LEFT JOIN users u1 ON c.customer_id = u1.id
				 LEFT JOIN users u2 ON c.agent_id = u2.id
				 WHERE c.status != 'archived'
				 ORDER BY c.updated_at DESC`
		args = []interface{}{}
	} else {
		// Regular agents can see their assigned chats and unassigned chats
		query = `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
				 u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
				 u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
				 FROM chats c
				 LEFT JOIN users u1 ON c.customer_id = u1.id
				 LEFT JOIN users u2 ON c.agent_id = u2.id
				 WHERE (c.agent_id = $1 OR c.agent_id IS NULL) AND c.status != 'archived'
				 ORDER BY c.updated_at DESC`
		args = []interface{}{userID}
	}

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chats []models.Chat
	for rows.Next() {
		var chat models.Chat
		var customer models.User
		var agent models.User
		var agentID sql.NullString
		var agentIDField, agentUsername, agentName, agentRole, agentAvatar sql.NullString
		var agentIsOnline sql.NullBool

		err := rows.Scan(
			&chat.ID, &chat.CustomerID, &agentID, &chat.Status, &chat.CreatedAt, &chat.UpdatedAt,
			&customer.ID, &customer.Username, &customer.Name, &customer.Role, &customer.Avatar, &customer.IsOnline,
			&agentIDField, &agentUsername, &agentName, &agentRole, &agentAvatar, &agentIsOnline,
		)
		if err != nil {
			return nil, err
		}

		chat.Customer = &customer
		if agentID.Valid && agentIDField.Valid {
			chat.AgentID = &agentID.String
			agent.ID = agentIDField.String
			agent.Username = agentUsername.String
			agent.Name = agentName.String
			agent.Role = agentRole.String
			if agentAvatar.Valid {
				agent.Avatar = &agentAvatar.String
			}
			agent.IsOnline = agentIsOnline.Bool
			chat.Agent = &agent
		}
		chat.IsActive = chat.Status == "active"

		// Get last message
		lastMessage, _ := s.getLastMessage(chat.ID)
		if lastMessage != nil {
			chat.LastMessage = lastMessage
		}

		chats = append(chats, chat)
	}

	return chats, nil
}

func (s *ChatService) GetChat(chatID string) (*models.Chat, error) {
	query := `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
			  u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
			  u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
			  FROM chats c
			  LEFT JOIN users u1 ON c.customer_id = u1.id
			  LEFT JOIN users u2 ON c.agent_id = u2.id
			  WHERE c.id = $1`

	var chat models.Chat
	var customer models.User
	var agent models.User
	var agentID sql.NullString
	var agentIDField, agentUsername, agentName, agentRole, agentAvatar sql.NullString
	var agentIsOnline sql.NullBool

	err := s.db.QueryRow(query, chatID).Scan(
		&chat.ID, &chat.CustomerID, &agentID, &chat.Status, &chat.CreatedAt, &chat.UpdatedAt,
		&customer.ID, &customer.Username, &customer.Name, &customer.Role, &customer.Avatar, &customer.IsOnline,
		&agentIDField, &agentUsername, &agentName, &agentRole, &agentAvatar, &agentIsOnline,
	)
	if err != nil {
		return nil, err
	}

	chat.Customer = &customer
	if agentID.Valid && agentIDField.Valid {
		chat.AgentID = &agentID.String
		agent.ID = agentIDField.String
		agent.Username = agentUsername.String
		agent.Name = agentName.String
		agent.Role = agentRole.String
		if agentAvatar.Valid {
			agent.Avatar = &agentAvatar.String
		}
		agent.IsOnline = agentIsOnline.Bool
		chat.Agent = &agent
	}
	chat.IsActive = chat.Status == "active"

	return &chat, nil
}

func (s *ChatService) CreateChat(customerID string, agentID *string) (*models.Chat, error) {
	chatID := uuid.New().String()

	var query string
	var args []interface{}

	if agentID != nil {
		query = `INSERT INTO chats (id, customer_id, agent_id, status, created_at, updated_at)
				 VALUES ($1, $2, $3, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				 RETURNING id, customer_id, agent_id, status, created_at, updated_at`
		args = []interface{}{chatID, customerID, *agentID}
	} else {
		query = `INSERT INTO chats (id, customer_id, status, created_at, updated_at)
				 VALUES ($1, $2, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
				 RETURNING id, customer_id, agent_id, status, created_at, updated_at`
		args = []interface{}{chatID, customerID}
	}

	var chat models.Chat
	err := s.db.QueryRow(query, args...).Scan(
		&chat.ID, &chat.CustomerID, &chat.AgentID, &chat.Status, &chat.CreatedAt, &chat.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get the complete chat with customer information
	completeChat, err := s.GetChat(chatID)
	if err != nil {
		return nil, err
	}

	// Broadcast new chat creation via WebSocket
	wsMessage := websocket.Message{
		Type:   "new_chat",
		ChatID: completeChat.ID,
		Data:   completeChat,
	}

	// Notify the customer who created the chat
	s.hub.BroadcastToUser(completeChat.CustomerID, wsMessage)

	// If there's an agent assigned, notify them too
	if completeChat.AgentID != nil {
		s.hub.BroadcastToUser(*completeChat.AgentID, wsMessage)
	}

	return completeChat, nil
}

func (s *ChatService) SendMessage(chatID, senderID, content, messageType string) (*models.Message, error) {
	messageID := uuid.New().String()

	query := `INSERT INTO messages (id, chat_id, sender_id, content, message_type, created_at)
			  VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
			  RETURNING id, chat_id, sender_id, content, message_type, created_at`

	var message models.Message
	err := s.db.QueryRow(query, messageID, chatID, senderID, content, messageType).Scan(
		&message.ID, &message.ChatID, &message.SenderID, &message.Content, &message.MessageType, &message.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Update chat's updated_at timestamp
	s.db.Exec(`UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, chatID)

	// Broadcast message via WebSocket
	wsMessage := websocket.Message{
		Type:   "new_message",
		ChatID: chatID,
		Data:   message,
	}
	s.hub.BroadcastToChat(chatID, wsMessage)

	return &message, nil
}

func (s *ChatService) GetMessages(chatID string, limit, offset int) ([]models.Message, error) {
	query := `SELECT m.id, m.chat_id, m.sender_id, m.content, m.message_type, m.created_at,
			  u.id, u.username, u.name, u.role, u.avatar, u.is_online
			  FROM messages m
			  LEFT JOIN users u ON m.sender_id = u.id
			  WHERE m.chat_id = $1
			  ORDER BY m.created_at DESC
			  LIMIT $2 OFFSET $3`

	rows, err := s.db.Query(query, chatID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var message models.Message
		var sender models.User

		err := rows.Scan(
			&message.ID, &message.ChatID, &message.SenderID, &message.Content, &message.MessageType, &message.CreatedAt,
			&sender.ID, &sender.Username, &sender.Name, &sender.Role, &sender.Avatar, &sender.IsOnline,
		)
		if err != nil {
			return nil, err
		}

		message.Sender = &sender
		messages = append(messages, message)
	}

	// Reverse the slice to get chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}

func (s *ChatService) UpdateChatStatus(chatID, status string) error {
	query := `UPDATE chats SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := s.db.Exec(query, status, chatID)
	return err
}

func (s *ChatService) DeleteChat(chatID string) error {
	// Messages will be deleted automatically due to CASCADE
	query := `DELETE FROM chats WHERE id = $1`
	_, err := s.db.Exec(query, chatID)
	return err
}

func (s *ChatService) GetAvailableAgents(customerID string) ([]models.User, error) {
	// Get agents who are online and available for new chats (exclude super-agents)
	query := `SELECT DISTINCT u.id, u.username, u.email, u.name, u.role, u.avatar, u.is_online, u.created_at, u.updated_at
			  FROM users u
			  WHERE u.role = 'agent' 
			  AND u.is_online = true
			  AND u.id NOT IN (
				  SELECT DISTINCT c.agent_id 
				  FROM chats c 
				  WHERE c.status = 'active' 
				  AND c.agent_id IS NOT NULL
				  AND c.customer_id != $1
			  )
			  ORDER BY u.name`

	rows, err := s.db.Query(query, customerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var agents []models.User
	for rows.Next() {
		var agent models.User
		err := rows.Scan(
			&agent.ID, &agent.Username, &agent.Email, &agent.Name,
			&agent.Role, &agent.Avatar, &agent.IsOnline, &agent.CreatedAt, &agent.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		agents = append(agents, agent)
	}

	return agents, nil
}

func (s *ChatService) GetAvailableCustomers(agentID string) ([]models.User, error) {
	// Get customers who are online and either have no active chats or need assistance
	query := `SELECT DISTINCT u.id, u.username, u.email, u.name, u.role, u.avatar, u.is_online, u.created_at, u.updated_at
			  FROM users u
			  WHERE u.role = 'customer' 
			  AND u.is_online = true
			  AND u.id NOT IN (
				  SELECT DISTINCT c.customer_id 
				  FROM chats c 
				  WHERE c.status = 'active' 
				  AND c.agent_id IS NOT NULL
				  AND c.agent_id != $1
			  )
			  ORDER BY u.name`

	rows, err := s.db.Query(query, agentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var customers []models.User
	for rows.Next() {
		var customer models.User
		err := rows.Scan(
			&customer.ID, &customer.Username, &customer.Email, &customer.Name,
			&customer.Role, &customer.Avatar, &customer.IsOnline, &customer.CreatedAt, &customer.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		customers = append(customers, customer)
	}

	return customers, nil
}

func (s *ChatService) GetArchivedChats(userID, role string) ([]models.Chat, error) {
	var query string
	var args []interface{}

	if role == "customer" {
		query = `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
				 u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
				 u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
				 FROM chats c
				 LEFT JOIN users u1 ON c.customer_id = u1.id
				 LEFT JOIN users u2 ON c.agent_id = u2.id
				 WHERE c.customer_id = $1 AND c.status = 'archived'
				 ORDER BY c.updated_at DESC`
		args = []interface{}{userID}
	} else if role == "super-agent" {
		// Super-agents can see all archived chats
		query = `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
				 u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
				 u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
				 FROM chats c
				 LEFT JOIN users u1 ON c.customer_id = u1.id
				 LEFT JOIN users u2 ON c.agent_id = u2.id
				 WHERE c.status = 'archived'
				 ORDER BY c.updated_at DESC`
		args = []interface{}{}
	} else {
		// Regular agents can see their archived chats
		query = `SELECT c.id, c.customer_id, c.agent_id, c.status, c.created_at, c.updated_at,
				 u1.id, u1.username, u1.name, u1.role, u1.avatar, u1.is_online,
				 u2.id, u2.username, u2.name, u2.role, u2.avatar, u2.is_online
				 FROM chats c
				 LEFT JOIN users u1 ON c.customer_id = u1.id
				 LEFT JOIN users u2 ON c.agent_id = u2.id
				 WHERE c.agent_id = $1 AND c.status = 'archived'
				 ORDER BY c.updated_at DESC`
		args = []interface{}{userID}
	}

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var chats []models.Chat
	for rows.Next() {
		var chat models.Chat
		var customer models.User
		var agent models.User
		var agentID sql.NullString
		var agentIDField, agentUsername, agentName, agentRole, agentAvatar sql.NullString
		var agentIsOnline sql.NullBool

		err := rows.Scan(
			&chat.ID, &chat.CustomerID, &agentID, &chat.Status, &chat.CreatedAt, &chat.UpdatedAt,
			&customer.ID, &customer.Username, &customer.Name, &customer.Role, &customer.Avatar, &customer.IsOnline,
			&agentIDField, &agentUsername, &agentName, &agentRole, &agentAvatar, &agentIsOnline,
		)
		if err != nil {
			return nil, err
		}

		chat.Customer = &customer
		if agentID.Valid && agentIDField.Valid {
			chat.AgentID = &agentID.String
			agent.ID = agentIDField.String
			agent.Username = agentUsername.String
			agent.Name = agentName.String
			agent.Role = agentRole.String
			if agentAvatar.Valid {
				agent.Avatar = &agentAvatar.String
			}
			agent.IsOnline = agentIsOnline.Bool
			chat.Agent = &agent
		}
		chat.IsActive = false // Archived chats are not active

		// Get last message
		lastMessage, _ := s.getLastMessage(chat.ID)
		if lastMessage != nil {
			chat.LastMessage = lastMessage
		}

		chats = append(chats, chat)
	}

	return chats, nil
}

func (s *ChatService) ArchiveChat(chatID, userID, role string) error {
	// Check if user has permission to archive this chat
	var checkQuery string
	var args []interface{}

	if role == "customer" {
		checkQuery = `SELECT id FROM chats WHERE id = $1 AND customer_id = $2`
		args = []interface{}{chatID, userID}
	} else if role == "super-agent" {
		checkQuery = `SELECT id FROM chats WHERE id = $1`
		args = []interface{}{chatID}
	} else { // agent
		checkQuery = `SELECT id FROM chats WHERE id = $1 AND agent_id = $2`
		args = []interface{}{chatID, userID}
	}

	var existingID string
	err := s.db.QueryRow(checkQuery, args...).Scan(&existingID)
	if err != nil {
		if err == sql.ErrNoRows {
			return err // Chat not found or no permission
		}
		return err
	}

	// Archive the chat
	query := `UPDATE chats SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err = s.db.Exec(query, chatID)
	return err
}

func (s *ChatService) UnarchiveChat(chatID, userID, role string) error {
	// Check if user has permission to unarchive this chat
	var checkQuery string
	var args []interface{}

	if role == "customer" {
		checkQuery = `SELECT id FROM chats WHERE id = $1 AND customer_id = $2 AND status = 'archived'`
		args = []interface{}{chatID, userID}
	} else if role == "super-agent" {
		checkQuery = `SELECT id FROM chats WHERE id = $1 AND status = 'archived'`
		args = []interface{}{chatID}
	} else { // agent
		checkQuery = `SELECT id FROM chats WHERE id = $1 AND agent_id = $2 AND status = 'archived'`
		args = []interface{}{chatID, userID}
	}

	var existingID string
	err := s.db.QueryRow(checkQuery, args...).Scan(&existingID)
	if err != nil {
		if err == sql.ErrNoRows {
			return err // Chat not found or no permission
		}
		return err
	}

	// Unarchive the chat
	query := `UPDATE chats SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err = s.db.Exec(query, chatID)
	return err
}

func (s *ChatService) getLastMessage(chatID string) (*models.Message, error) {
	query := `SELECT m.id, m.chat_id, m.sender_id, m.content, m.message_type, m.created_at,
			  u.id, u.username, u.name, u.role, u.avatar, u.is_online
			  FROM messages m
			  LEFT JOIN users u ON m.sender_id = u.id
			  WHERE m.chat_id = $1
			  ORDER BY m.created_at DESC
			  LIMIT 1`

	var message models.Message
	var sender models.User

	err := s.db.QueryRow(query, chatID).Scan(
		&message.ID, &message.ChatID, &message.SenderID, &message.Content, &message.MessageType, &message.CreatedAt,
		&sender.ID, &sender.Username, &sender.Name, &sender.Role, &sender.Avatar, &sender.IsOnline,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	message.Sender = &sender
	return &message, nil
}
