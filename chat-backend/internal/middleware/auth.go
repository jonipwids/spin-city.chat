package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(secretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// Try to get token from Authorization header first
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			// Check if the header starts with "Bearer "
			tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Bearer token required"})
				c.Abort()
				return
			}
		} else {
			// If no Authorization header, try to get token from query parameter (for WebSocket)
			tokenString = c.Query("token")
			if tokenString == "" {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
				c.Abort()
				return
			}
		}

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(secretKey), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userID", claims["userID"])
			c.Set("username", claims["username"])
			c.Set("role", claims["role"])
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		c.Next()
	}
}
