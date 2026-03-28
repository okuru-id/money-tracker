package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
	"money-tracker-be/internal/service"
)

type FamilyHandler struct {
	familySvc  service.FamilyService
	familyRepo repository.FamilyRepository
	authSvc    service.AuthService
}

func NewFamilyHandler(familySvc service.FamilyService, familyRepo repository.FamilyRepository, authSvc service.AuthService) *FamilyHandler {
	return &FamilyHandler{familySvc: familySvc, familyRepo: familyRepo, authSvc: authSvc}
}

// Create godoc
// @Summary Create new family
// @Description Create a new family group. User becomes the owner.
// @Tags family
// @Accept json
// @Produce json
// @Security session
// @Param request body model.CreateFamilyRequest true "Family creation request"
// @Success 201 {object} model.FamilyResponse "Family created successfully"
// @Failure 400 {object} model.ErrorResponse "Invalid request data"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /families [post]
func (h *FamilyHandler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req model.CreateFamilyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request data",
			gin.H{"error": err.Error()},
		))
		return
	}

	family, err := h.familySvc.Create(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to create family",
			nil,
		))
		return
	}

	// Update session with family ID
	sessionID, err := c.Cookie(middleware.SessionCookie)
	if err == nil && sessionID != "" {
		_ = h.authSvc.UpdateSessionFamily(c.Request.Context(), sessionID, family.ID)
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":         family.ID,
		"name":       family.Name,
		"created_by": family.CreatedBy,
		"created_at": family.CreatedAt,
	})
}

// GetSummary godoc
// @Summary Get family financial summary
// @Description Get total income, expense, and net balance for the family
// @Tags family
// @Produce json
// @Security session
// @Param id path string true "Family ID"
// @Param period query string false "Time period (today, week, month)" default(month)
// @Success 200 {object} model.FamilySummaryResponse "Family summary"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 403 {object} model.ErrorResponse "Forbidden"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /families/{id}/summary [get]
func (h *FamilyHandler) GetSummary(c *gin.Context) {
	familyID := c.Param("id")
	period := c.DefaultQuery("period", "month")

	summary, err := h.familySvc.GetSummary(c.Request.Context(), familyID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get family summary",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GetMembers godoc
// @Summary Get family members
// @Description Get list of all members in the family
// @Tags family
// @Produce json
// @Security session
// @Param id path string true "Family ID"
// @Success 200 {object} map[string][]model.FamilyMemberResponse "Family members"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 403 {object} model.ErrorResponse "Forbidden"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /families/{id}/members [get]
func (h *FamilyHandler) GetMembers(c *gin.Context) {
	familyID := c.Param("id")

	members, err := h.familySvc.GetMembers(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get family members",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, gin.H{"members": members})
}

// RemoveMember godoc
// @Summary Remove family member
// @Description Remove a member from the family. Only owner can remove members.
// @Tags family
// @Produce json
// @Security session
// @Param id path string true "Family ID"
// @Param userId path string true "User ID to remove"
// @Success 204 "Member removed successfully"
// @Failure 400 {object} model.ErrorResponse "Cannot remove owner"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 403 {object} model.ErrorResponse "Forbidden - not owner"
// @Failure 404 {object} model.ErrorResponse "Member not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /families/{id}/members/{userId} [delete]
func (h *FamilyHandler) RemoveMember(c *gin.Context) {
	familyID := c.Param("id")
	userIDToRemove := c.Param("userId")
	currentUserID := middleware.GetUserID(c)

	// Check if current user is owner
	isOwner, err := h.familySvc.IsOwner(c.Request.Context(), familyID, currentUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to verify ownership",
			nil,
		))
		return
	}

	if !isOwner {
		c.JSON(http.StatusForbidden, middleware.ErrorResponse(
			middleware.CodeForbidden,
			"Only family owner can remove members",
			nil,
		))
		return
	}

	// Check if trying to remove owner (self)
	if userIDToRemove == currentUserID {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Cannot remove owner. Transfer ownership first or delete family.",
			nil,
		))
		return
	}

	// Check if member exists
	member, err := h.familyRepo.FindMemberByUserID(c.Request.Context(), familyID, userIDToRemove)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to check member",
			nil,
		))
		return
	}

	if member == nil {
		c.JSON(http.StatusNotFound, middleware.ErrorResponse(
			middleware.CodeNotFound,
			"Member not found in this family",
			nil,
		))
		return
	}

	// Remove member
	err = h.familySvc.RemoveMember(c.Request.Context(), familyID, userIDToRemove)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to remove member",
			nil,
		))
		return
	}

	c.Status(http.StatusNoContent)
}