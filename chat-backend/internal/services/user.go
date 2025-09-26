package services

import (
	"database/sql"

	"cs-socket/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{
		db: db,
	}
}

func (s *UserService) GetUsers(role string) ([]models.User, error) {
	var query string
	var args []interface{}

	if role == "admin" || role == "super-agent" {
		query = `SELECT id, username, email, name, role, avatar, is_online, created_at, updated_at 
				 FROM users ORDER BY name`
	} else {
		query = `SELECT id, username, email, name, role, avatar, is_online, created_at, updated_at 
				 FROM users WHERE role IN ('agent', 'super-agent') ORDER BY name`
	}

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID, &user.Username, &user.Email, &user.Name,
			&user.Role, &user.Avatar, &user.IsOnline, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (s *UserService) UpdateUserStatus(userID string, isOnline bool) error {
	query := `UPDATE users SET is_online = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := s.db.Exec(query, isOnline, userID)
	return err
}

func (s *UserService) GetUserByID(userID string) (*models.User, error) {
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
