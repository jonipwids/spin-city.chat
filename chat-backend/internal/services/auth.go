package services

import (
	"database/sql"
	"fmt"
	"time"

	"cs-socket/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db        *sql.DB
	jwtSecret string
}

func NewAuthService(db *sql.DB, jwtSecret string) *AuthService {
	return &AuthService{
		db:        db,
		jwtSecret: jwtSecret,
	}
}

func (s *AuthService) Login(username, password string) (*models.User, string, error) {
	var user models.User
	query := `SELECT id, username, email, password_hash, name, role, avatar, is_online, created_at, updated_at 
			  FROM users WHERE username = $1`

	err := s.db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.Password,
		&user.Name, &user.Role, &user.Avatar, &user.IsOnline,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, "", fmt.Errorf("invalid credentials")
		}
		return nil, "", err
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, "", fmt.Errorf("invalid credentials")
	}

	// Update online status
	s.UpdateUserStatus(user.ID, true)
	user.IsOnline = true

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID":   user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, "", err
	}

	// Clear password from response
	user.Password = ""

	return &user, tokenString, nil
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.User, string, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = "customer"
	}

	// Generate UUID
	userID := uuid.New().String()

	// Insert user
	query := `INSERT INTO users (id, username, email, password_hash, name, role, is_online, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
			  RETURNING id, username, email, name, role, avatar, is_online, created_at, updated_at`

	var user models.User
	err = s.db.QueryRow(query, userID, req.Username, req.Email, string(hashedPassword), req.Name, req.Role).Scan(
		&user.ID, &user.Username, &user.Email, &user.Name,
		&user.Role, &user.Avatar, &user.IsOnline, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, "", err
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userID":   user.ID,
		"username": user.Username,
		"role":     user.Role,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, "", err
	}

	return &user, tokenString, nil
}

func (s *AuthService) UpdateUserStatus(userID string, isOnline bool) error {
	query := `UPDATE users SET is_online = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := s.db.Exec(query, isOnline, userID)
	return err
}

func (s *AuthService) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	query := `SELECT id, username, email, name, role, avatar, is_online, created_at, updated_at 
			  FROM users WHERE id = $1`

	err := s.db.QueryRow(query, userID).Scan(
		&user.ID, &user.Username, &user.Email, &user.Name,
		&user.Role, &user.Avatar, &user.IsOnline, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}
