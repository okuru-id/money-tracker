package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/model"
	"money-tracker-be/internal/service"
)

type AdminHandler struct {
	adminSvc service.AdminService
}

func NewAdminHandler(adminSvc service.AdminService) *AdminHandler {
	return &AdminHandler{adminSvc: adminSvc}
}

// ListTransactions returns all transactions (admin only)
func (h *AdminHandler) ListTransactions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	familyID := c.Query("familyId")
	userID := c.Query("userId")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	filter := service.TransactionFilter{
		FamilyID: familyID,
		Page:     page,
		Limit:    limit,
	}

	if userID != "" {
		filter.CreatedBy = &userID
	}

	result, err := h.adminSvc.ListAllTransactions(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to fetch transactions",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, result)
}

// ListFamilies returns all families (admin only)
func (h *AdminHandler) ListFamilies(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	result, err := h.adminSvc.ListAllFamilies(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to fetch families",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, result)
}

// ListUsers returns all users (admin only)
func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	result, err := h.adminSvc.ListAllUsers(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to fetch users",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, result)
}

// AddMember adds a user to a family (admin only)
func (h *AdminHandler) AddMember(c *gin.Context) {
	var req model.AddMemberRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	err := h.adminSvc.AddMemberToFamily(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case service.ErrFamilyNotFound:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"Family not found",
				nil,
			))
		case service.ErrUserNotFound:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"User not found",
				nil,
			))
		case service.ErrAlreadyMember:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"User is already a member of this family",
				nil,
			))
		case service.ErrUserAlreadyInFamily:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"User is already a member of another family",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to add member",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member added successfully"})
}

// RemoveMember removes a user from a family (admin only)
func (h *AdminHandler) RemoveMember(c *gin.Context) {
	familyID := c.Query("familyId")
	userID := c.Query("userId")

	if familyID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"familyId and userId are required",
			nil,
		))
		return
	}

	err := h.adminSvc.RemoveMemberFromFamily(c.Request.Context(), familyID, userID)
	if err != nil {
		switch err {
		case service.ErrNotMember:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"User is not a member of this family",
				nil,
			))
		case service.ErrMemberHasTransactions:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"Tidak dapat menghapus member: Member memiliki transaksi di keluarga ini. Hapus transaksi terlebih dahulu.",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to remove member",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member removed successfully"})
}

// CreateUser creates a new user (admin only)
func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req model.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	// Default role to "user" if not specified
	if req.Role == "" {
		req.Role = "user"
	}

	user, err := h.adminSvc.CreateUser(c.Request.Context(), &req)
	if err != nil {
		switch err {
		case service.ErrEmailExists:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"Email already exists",
				nil,
			))
		case service.ErrInvalidRole:
			c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
				middleware.CodeValidationError,
				"Invalid role. Must be 'user' or 'admin'",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to create user",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusCreated, user)
}

// UpdateUser updates a user's role (admin only)
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var req model.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	err := h.adminSvc.UpdateUserRole(c.Request.Context(), userID, req.Role)
	if err != nil {
		switch err {
		case service.ErrUserNotFound:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"User not found",
				nil,
			))
		case service.ErrInvalidRole:
			c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
				middleware.CodeValidationError,
				"Invalid role. Must be 'user' or 'admin'",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to update user",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// DeleteUser deletes a user (admin only)
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	err := h.adminSvc.DeleteUser(c.Request.Context(), userID)
	if err != nil {
		switch err {
		case service.ErrUserNotFound:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"User not found",
				nil,
			))
		case service.ErrUserHasTransactions:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"Tidak dapat menghapus user: User memiliki transaksi. Hapus transaksi terlebih dahulu.",
				nil,
			))
		case service.ErrUserCreatedFamilies:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"Tidak dapat menghapus user: User telah membuat keluarga. Hapus atau transfer kepemilikan keluarga terlebih dahulu.",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to delete user",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// CreateFamily creates a new family (admin only)
func (h *AdminHandler) CreateFamily(c *gin.Context) {
	var req model.CreateFamilyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	family, err := h.adminSvc.CreateFamily(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to create family",
			nil,
		))
		return
	}

	c.JSON(http.StatusCreated, family)
}

// UpdateFamily updates a family (admin only)
func (h *AdminHandler) UpdateFamily(c *gin.Context) {
	familyID := c.Param("id")

	var req model.UpdateFamilyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	err := h.adminSvc.UpdateFamily(c.Request.Context(), familyID, &req)
	if err != nil {
		switch err {
		case service.ErrFamilyNotFound:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"Family not found",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to update family",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Family updated successfully"})
}

// DeleteFamily deletes a family (admin only)
func (h *AdminHandler) DeleteFamily(c *gin.Context) {
	familyID := c.Param("id")

	err := h.adminSvc.DeleteFamily(c.Request.Context(), familyID)
	if err != nil {
		switch err {
		case service.ErrFamilyNotFound:
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"Family not found",
				nil,
			))
		case service.ErrFamilyHasTransactions:
			c.JSON(http.StatusConflict, middleware.ErrorResponse(
				middleware.CodeConflict,
				"Tidak dapat menghapus keluarga: Keluarga memiliki transaksi. Hapus transaksi terlebih dahulu.",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				"Failed to delete family",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Family deleted successfully"})
}

// GetFamilyMembers returns members of a family (admin only)
func (h *AdminHandler) GetFamilyMembers(c *gin.Context) {
	familyID := c.Param("id")

	members, err := h.adminSvc.GetFamilyMembers(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to fetch family members",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, members)
}

// GetUsersWithoutFamily returns users without a family (admin only)
func (h *AdminHandler) GetUsersWithoutFamily(c *gin.Context) {
	users, err := h.adminSvc.GetUsersWithoutFamily(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to fetch users",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, users)
}

// RegisterAdminRoutes registers admin routes
func RegisterAdminRoutes(r *gin.RouterGroup, h *AdminHandler, authSvc service.AuthService, sessionDuration interface{}, txHandler *TransactionHandler) {
	admin := r.Group("/admin")
	admin.Use(
		gin.HandlerFunc(func(c *gin.Context) {
			middleware.Auth(authSvc, 0)(c)
		}),
		middleware.RequireAdmin(),
	)
	{
		admin.GET("/transactions", h.ListTransactions)
		admin.PUT("/transactions/:id", txHandler.Update)
		admin.DELETE("/transactions/:id", txHandler.Delete)
		admin.GET("/families", h.ListFamilies)
		admin.POST("/families", h.CreateFamily)
		admin.GET("/families/users-without-family", h.GetUsersWithoutFamily)
		admin.GET("/families/:id/members", h.GetFamilyMembers)
		admin.PUT("/families/:id", h.UpdateFamily)
		admin.DELETE("/families/:id", h.DeleteFamily)
		admin.GET("/users", h.ListUsers)
		admin.POST("/users", h.CreateUser)
		admin.PUT("/users/:id", h.UpdateUser)
		admin.DELETE("/users/:id", h.DeleteUser)
		admin.POST("/families/members", h.AddMember)
		admin.DELETE("/families/members", h.RemoveMember)
	}
}