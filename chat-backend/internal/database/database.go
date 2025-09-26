package database

import (
	"database/sql"
	"fmt"

	"cs-socket/internal/config"

	_ "github.com/lib/pq"
)

func Connect(cfg config.DatabaseConfig) (*sql.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

func RunMigrations(cfg config.DatabaseConfig) error {
	db, err := Connect(cfg)
	if err != nil {
		return err
	}
	defer db.Close()

	// Create tables
	queries := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			username VARCHAR(50) UNIQUE NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			name VARCHAR(100) NOT NULL,
			role VARCHAR(20) NOT NULL DEFAULT 'customer',
			avatar VARCHAR(255),
			is_online BOOLEAN DEFAULT false,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS chats (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			customer_id UUID NOT NULL REFERENCES users(id),
			agent_id UUID REFERENCES users(id),
			status VARCHAR(20) DEFAULT 'active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS messages (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
			sender_id UUID NOT NULL REFERENCES users(id),
			content TEXT NOT NULL,
			message_type VARCHAR(20) DEFAULT 'text',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE INDEX IF NOT EXISTS idx_chats_customer_id ON chats(customer_id)`,
		`CREATE INDEX IF NOT EXISTS idx_chats_agent_id ON chats(agent_id)`,
		`CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id)`,
		`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return fmt.Errorf("failed to execute migration: %w", err)
		}
	}

	return nil
}
