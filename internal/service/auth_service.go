package service

import (
	"context"
	"errors"
	"time"

	"linkit-v2/internal/model"
	"linkit-v2/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid username or password")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type AuthService struct {
	repo      *repository.UserRepository
	jwtSecret []byte
}

func NewAuthService(repo *repository.UserRepository, jwtSecret string) *AuthService {
	if jwtSecret == "" {
		jwtSecret = "linkit-super-secret-key-change-in-prod"
	}
	return &AuthService{
		repo:      repo,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *AuthService) Register(ctx context.Context, username, password string) (model.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return model.User{}, err
	}

	return s.repo.Create(ctx, username, string(hash), "user")
}

func (s *AuthService) Login(ctx context.Context, username, password string) (string, model.User, error) {
	user, err := s.repo.GetByUsername(ctx, username)
	if err != nil {
		return "", model.User{}, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", model.User{}, ErrInvalidCredentials
	}

	claims := model.UserClaims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", model.User{}, err
	}

	return tokenString, user, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*model.UserClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &model.UserClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return s.jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*model.UserClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	return claims, nil
}
