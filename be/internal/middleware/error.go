package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorCodes maps to API error codes
const (
	CodeValidationError = "VALIDATION_ERROR"
	CodeUnauthorized    = "UNAUTHORIZED"
	CodeForbidden       = "FORBIDDEN"
	CodeNotFound        = "NOT_FOUND"
	CodeConflict        = "CONFLICT"
	CodeRateLimited     = "RATE_LIMITED"
	CodeInternalError   = "INTERNAL_ERROR"
)

// ErrorResponse creates a standardized error response
func ErrorResponse(code, message string, details map[string]interface{}) gin.H {
	return gin.H{
		"error": gin.H{
			"code":    code,
			"message": message,
			"details": details,
		},
	}
}

// Recovery middleware catches panics and returns 500
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				c.AbortWithStatusJSON(http.StatusInternalServerError, ErrorResponse(
					CodeInternalError,
					"An unexpected error occurred",
					nil,
				))
			}
		}()
		c.Next()
	}
}