package main

import (
	"log"

	"cs-socket/internal/config"
	"cs-socket/internal/database"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := database.Connect(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Println("Resetting database...")

	// Clear existing data (in correct order due to foreign keys)
	queries := []string{
		"DELETE FROM messages",
		"DELETE FROM chats",
		"DELETE FROM users",
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			log.Printf("Warning: Failed to execute %s: %v", query, err)
		}
	}

	log.Println("Database reset completed. Run the main server to re-seed.")
}
