package database

import (
	"database/sql"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
)

func SeedDatabase(db *sql.DB) error {
	// Check if users already exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("Database already seeded, skipping...")
		return nil
	}

	log.Println("Seeding database with initial data...")

	// Create test users
	users := []struct {
		username string
		email    string
		password string
		name     string
		role     string
	}{
		{"agent1", "agent1@example.com", "password123", "Agent John", "agent"},
		{"agent2", "agent2@example.com", "password123", "Agent Sarah", "agent"},
		{"agent3", "agent3@example.com", "password123", "Agent David", "agent"},
		{"superagent1", "superagent1@example.com", "password123", "Super Agent Admin", "super-agent"},
		{"customer1", "customer1@example.com", "password123", "Customer Mike", "customer"},
		{"customer2", "customer2@example.com", "password123", "Customer Lisa", "customer"},
	}

	// Store user IDs for creating chats
	userIDs := make(map[string]string)

	for _, user := range users {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("failed to hash password for %s: %w", user.username, err)
		}

		var userID string
		err = db.QueryRow(`
			INSERT INTO users (username, email, password_hash, name, role, is_online) 
			VALUES ($1, $2, $3, $4, $5, false)
			RETURNING id`,
			user.username, user.email, string(hashedPassword), user.name, user.role).Scan(&userID)
		if err != nil {
			return fmt.Errorf("failed to create user %s: %w", user.username, err)
		}
		userIDs[user.username] = userID
	}

	// Create sample chats
	chats := []struct {
		customerUsername string
		agentUsername    string
		status           string
	}{
		{"customer1", "agent1", "active"},
		{"customer2", "agent2", "active"},
	}

	for _, chat := range chats {
		customerID := userIDs[chat.customerUsername]
		agentID := userIDs[chat.agentUsername]

		var chatID string
		err := db.QueryRow(`
			INSERT INTO chats (customer_id, agent_id, status, created_at, updated_at)
			VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			RETURNING id`,
			customerID, agentID, chat.status).Scan(&chatID)
		if err != nil {
			return fmt.Errorf("failed to create chat: %w", err)
		}

		// Add a sample message to each chat
		_, err = db.Exec(`
			INSERT INTO messages (chat_id, sender_id, content, message_type, created_at)
			VALUES ($1, $2, $3, 'text', CURRENT_TIMESTAMP)`,
			chatID, customerID, "Hello, I need help with my account")
		if err != nil {
			return fmt.Errorf("failed to create sample message: %w", err)
		}
	}

	log.Println("Database seeded successfully!")
	return nil
}
