package middleware

import (
	"context"
	"net/http"
	"strings"

	"linkit-v2/internal/service"
)

type contextKey string

const (
	UserIDKey contextKey = "userID"
	RoleKey   contextKey = "role"
)

func RequireAuth(authService *service.AuthService) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, `{"error": "Unauthorized: missing bearer token"}`, http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := authService.ValidateToken(tokenString)
			if err != nil {
				http.Error(w, `{"error": "Unauthorized: invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			// Store user identity in request context
			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, RoleKey, claims.Role)
			next(w, r.WithContext(ctx))
		}
	}
}

func AuthOptional(authService *service.AuthService) func(http.HandlerFunc) http.HandlerFunc {
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString := strings.TrimPrefix(authHeader, "Bearer ")
				if claims, err := authService.ValidateToken(tokenString); err == nil {
					ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
					ctx = context.WithValue(ctx, RoleKey, claims.Role)
					next(w, r.WithContext(ctx))
					return
				}
			}
			next(w, r)
		}
	}
}

func GetUserID(ctx context.Context) *int64 {
	if val := ctx.Value(UserIDKey); val != nil {
		if id, ok := val.(int64); ok {
			return &id
		}
	}
	return nil
}
