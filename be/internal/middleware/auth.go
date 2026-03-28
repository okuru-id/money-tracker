package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/service"
)

const (
	ContextUserID   = "userID"
	ContextFamilyID = "familyID"
	ContextUserRole = "userRole"
	SessionCookie   = "session_id"
)

var cookieSecure = true

// SetCookieSecure configures the secure flag for session cookies
func SetCookieSecure(secure bool) {
	cookieSecure = secure
}

// Auth middleware validates session and injects user context
func Auth(authSvc service.AuthService, sessionDuration time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get session cookie
		sessionID, err := c.Cookie(SessionCookie)
		if err != nil || sessionID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse(
				CodeUnauthorized,
				"Authentication required",
				nil,
			))
			return
		}

		// Validate session
		session, err := authSvc.ValidateSession(c.Request.Context(), sessionID)
		if err != nil {
			c.SetCookie(SessionCookie, "", -1, "/", "", cookieSecure, true)
			c.AbortWithStatusJSON(http.StatusUnauthorized, ErrorResponse(
				CodeUnauthorized,
				"Invalid or expired session",
				nil,
			))
			return
		}

		// Extend session TTL
		// This is done in the auth service

		// Inject user context
		c.Set(ContextUserID, session.UserID)
		c.Set(ContextFamilyID, session.FamilyID)
		c.Set(ContextUserRole, session.UserRole)

		c.Next()
	}
}

// SetSessionCookie sets the session cookie with proper flags
func SetSessionCookie(c *gin.Context, sessionID string, duration time.Duration) {
	c.SetCookie(
		SessionCookie,
		sessionID,
		int(duration.Seconds()),
		"/",
		"",
		cookieSecure,
		true, // HttpOnly
	)
}

// ClearSessionCookie clears the session cookie
func ClearSessionCookie(c *gin.Context) {
	c.SetCookie(SessionCookie, "", -1, "/", "", cookieSecure, true)
}

// GetUserID gets user ID from context
func GetUserID(c *gin.Context) string {
	if userID, exists := c.Get(ContextUserID); exists {
		if id, ok := userID.(string); ok {
			return id
		}
	}
	return ""
}

// GetFamilyID gets family ID from context
func GetFamilyID(c *gin.Context) string {
	if familyID, exists := c.Get(ContextFamilyID); exists {
		if id, ok := familyID.(string); ok {
			return id
		}
	}
	return ""
}

// GetIsAdmin checks if user is admin from context
func GetIsAdmin(c *gin.Context) bool {
	if role, exists := c.Get(ContextUserRole); exists {
		if r, ok := role.(string); ok {
			return r == "admin"
		}
	}
	return false
}

// GetUserRole gets user role from context
func GetUserRole(c *gin.Context) string {
	if role, exists := c.Get(ContextUserRole); exists {
		if r, ok := role.(string); ok {
			return r
		}
	}
	return "user"
}

// RequireAdmin middleware checks if user is admin
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !GetIsAdmin(c) {
			c.AbortWithStatusJSON(http.StatusForbidden, ErrorResponse(
				CodeForbidden,
				"Admin access required",
				nil,
			))
			return
		}
		c.Next()
	}
}

// RequireFamily checks if family_id in path matches session family
func RequireFamily() gin.HandlerFunc {
	return func(c *gin.Context) {
		familyID := c.Param("id")
		if familyID == "" {
			familyID = c.Query("familyId")
		}

		sessionFamilyID := GetFamilyID(c)

		if familyID != "" && familyID != sessionFamilyID {
			c.AbortWithStatusJSON(http.StatusForbidden, ErrorResponse(
				CodeForbidden,
				"Access denied to this family",
				nil,
			))
			return
		}

		c.Next()
	}
}

// CORS middleware handles CORS headers
func CORS(allowedOrigins string) gin.HandlerFunc {
	origins := strings.Split(allowedOrigins, ",")

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		for _, allowed := range origins {
			if strings.TrimSpace(allowed) == origin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}