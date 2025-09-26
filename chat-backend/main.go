package main

import (
	"log"
	"os"

	"cs-socket/internal/config"
	"cs-socket/internal/database"
	"cs-socket/internal/handlers"
	"cs-socket/internal/middleware"
	"cs-socket/internal/services"
	"cs-socket/internal/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

	// Run migrations
	if err := database.RunMigrations(cfg.Database); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Seed database with initial data
	if err := database.SeedDatabase(db); err != nil {
		log.Printf("Warning: Failed to seed database: %v", err)
	}

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize services
	authService := services.NewAuthService(db, cfg.JWT.Secret)
	chatService := services.NewChatService(db, hub)
	userService := services.NewUserService(db)

	// Set status update function for the hub
	hub.SetStatusUpdateFunc(authService.UpdateUserStatus)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	chatHandler := handlers.NewChatHandler(chatService)
	userHandler := handlers.NewUserHandler(userService)
	wsHandler := handlers.NewWebSocketHandler(hub, authService)

	// Setup Gin
	if cfg.Server.Mode == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// CORS middleware - only apply if enabled
	if cfg.CORS.Enabled {
		log.Printf("CORS enabled with origins: %v", cfg.CORS.AllowedOrigins)
		router.Use(cors.New(cors.Config{
			AllowOrigins:     cfg.CORS.AllowedOrigins,
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
		}))
	} else {
		log.Printf("CORS disabled")
	}

	// Setup API routes
	api := router.Group("/api")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/logout", authHandler.Logout)
		}

		// Protected routes (require authentication)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
		{
			// User routes
			protected.GET("/users/me", userHandler.GetMe)
			protected.GET("/users", userHandler.GetUsers)
			protected.PUT("/users/status", userHandler.UpdateStatus)

			// Chat routes
			chats := protected.Group("/chats")
			{
				chats.GET("", chatHandler.GetChats)
				chats.POST("", chatHandler.CreateChat)
				chats.GET("/:id", chatHandler.GetChat)
				chats.POST("/:id/messages", chatHandler.SendMessage)
				chats.GET("/:id/messages", chatHandler.GetMessages)
				chats.PUT("/:id/status", chatHandler.UpdateChatStatus)
				chats.DELETE("/:id", chatHandler.DeleteChat)
				chats.PUT("/:id/archive", chatHandler.ArchiveChat)
				chats.PUT("/:id/unarchive", chatHandler.UnarchiveChat)
			}

			// Archived chats route
			protected.GET("/archived-chats", chatHandler.GetArchivedChats)

			// Available agents for customers
			protected.GET("/available-agents", chatHandler.GetAvailableAgents)

			// Available customers for agents
			protected.GET("/available-customers", chatHandler.GetAvailableCustomers)

			// WebSocket endpoint
			protected.GET("/ws", wsHandler.HandleWebSocket)
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = cfg.Server.Port
	}

	log.Printf("CS Socket Server starting on port %s", port)
	log.Printf("Environment: %s", cfg.Server.Mode)
	log.Fatal(router.Run(":" + port))
}
