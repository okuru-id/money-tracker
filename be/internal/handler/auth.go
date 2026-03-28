package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/model"
	"money-tracker-be/internal/service"
)

type AuthHandler struct {
	authSvc service.AuthService
}

func NewAuthHandler(authSvc service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

// Register godoc
// @Summary Register new user
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.RegisterRequest true "Register request"
// @Success 201 {object} map[string]interface{} "User created successfully"
// @Failure 400 {object} model.ErrorResponse "Invalid request data"
// @Failure 409 {object} model.ErrorResponse "Email already registered"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request data",
			gin.H{"error": err.Error()},
		))
		return
	}

	user, err := h.authSvc.Register(c.Request.Context(), &req)
	if err != nil {
		log.Printf("Register error: %v", err)
		if err.Error() == "email already registered" {
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"Email already registered",
				nil,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to register user",
			nil,
		))
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"created_at": user.CreatedAt,
		},
	})
}

// Login godoc
// @Summary User login
// @Description Authenticate user and create session
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.LoginRequest true "Login request"
// @Success 200 {object} map[string]interface{} "Login successful"
// @Failure 400 {object} model.ErrorResponse "Invalid request data"
// @Failure 401 {object} model.ErrorResponse "Invalid credentials"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request data",
			gin.H{"error": err.Error()},
		))
		return
	}

	sessionID, user, err := h.authSvc.Login(c.Request.Context(), &req)
	if err != nil {
		log.Printf("Login error: %v", err)
		if err.Error() == "invalid credentials" {
			c.JSON(http.StatusUnauthorized, middleware.ErrorResponse(
				middleware.CodeUnauthorized,
				"Invalid email or password",
				nil,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to login",
			nil,
		))
		return
	}

	// Set session cookie
	middleware.SetSessionCookie(c, sessionID, 7*24*60*60*1e9) // 7 days

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"role":       user.Role,
			"created_at": user.CreatedAt,
		},
	})
}

// Logout godoc
// @Summary User logout
// @Description End user session and clear cookie
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{} "Logout successful"
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	sessionID, err := c.Cookie(middleware.SessionCookie)
	if err == nil && sessionID != "" {
		_ = h.authSvc.Logout(c.Request.Context(), sessionID)
	}

	middleware.ClearSessionCookie(c)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Me godoc
// @Summary Get current user
// @Description Get current authenticated user info including family context
// @Tags auth
// @Produce json
// @Success 200 {object} map[string]interface{} "Current user info"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Router /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID := middleware.GetUserID(c)
	familyID := middleware.GetFamilyID(c)
	userRole := middleware.GetUserRole(c)

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":        userID,
			"family_id": familyID,
			"role":      userRole,
		},
	})
}