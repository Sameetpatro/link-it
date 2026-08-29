package repository

import (
	"context"
	"database/sql"
	"errors"
	"linkit-v2/internal/model"
)

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("username already taken")
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, username, passwordHash, role string) (model.User, error) {
	query := `
		INSERT INTO users (username, password_hash, role, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, username, role, created_at
	`
	var user model.User
	user.PasswordHash = passwordHash
	err := r.db.QueryRowContext(ctx, query, username, passwordHash, role).Scan(
		&user.ID,
		&user.Username,
		&user.Role,
		&user.CreatedAt,
	)
	if err != nil {
		return model.User{}, err
	}
	return user, nil
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (model.User, error) {
	query := `SELECT id, username, password_hash, role, created_at FROM users WHERE username = $1`
	var user model.User
	err := r.db.QueryRowContext(ctx, query, username).Scan(
		&user.ID,
		&user.Username,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return model.User{}, ErrUserNotFound
		}
		return model.User{}, err
	}
	return user, nil
}