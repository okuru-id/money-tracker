package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/service"
)

type InviteHandler struct {
	inviteSvc service.InviteService
}

func NewInviteHandler(inviteSvc service.InviteService) *InviteHandler {
	return &InviteHandler{inviteSvc: inviteSvc}
}

// CreateInvite godoc
// @Summary Create family invite
// @Description Generate an invite token for family membership. Only family owner can create invites.
// @Tags invite
// @Produce json
// @Security session
// @Param id path string true "Family ID"
// @Success 201 {object} model.CreateInviteResponse "Invite created successfully"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 403 {object} model.ErrorResponse "Only family owner can create invites"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /families/{id}/invites [post]
func (h *InviteHandler) CreateInvite(c *gin.Context) {
	familyID := c.Param("id")
	userID := middleware.GetUserID(c)

	invite, err := h.inviteSvc.CreateInvite(c.Request.Context(), familyID, userID)
	if err != nil {
		if err.Error() == "only family owner can create invites" {
			c.JSON(http.StatusForbidden, middleware.ErrorResponse(
				middleware.CodeForbidden,
				"Only family owner can create invites",
				nil,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to create invite",
			nil,
		))
		return
	}

	c.JSON(http.StatusCreated, invite)
}

// JoinWithToken godoc
// @Summary Join family with invite token
// @Description Join a family using an invite token
// @Tags invite
// @Produce json
// @Security session
// @Param token path string true "Invite token"
// @Success 200 {object} map[string]interface{} "Successfully joined family"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 404 {object} model.ErrorResponse "Invalid invite token"
// @Failure 409 {object} model.ErrorResponse "Token expired/used or already a member"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /invites/{token}/join [post]
func (h *InviteHandler) JoinWithToken(c *gin.Context) {
	token := c.Param("token")
	userID := middleware.GetUserID(c)

	family, err := h.inviteSvc.JoinWithToken(c.Request.Context(), token, userID)
	if err != nil {
		msg := err.Error()
		code := middleware.CodeInternalError
		status := http.StatusInternalServerError

		switch msg {
		case "invalid invite token":
			code = middleware.CodeNotFound
			status = http.StatusNotFound
		case "invite token has expired or already used":
			code = middleware.CodeConflict
			status = http.StatusConflict
		case "already a member of this family":
			code = middleware.CodeConflict
			status = http.StatusConflict
		}

		c.JSON(status, middleware.ErrorResponse(code, msg, nil))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully joined family",
		"family": gin.H{
			"id":   family.ID,
			"name": family.Name,
		},
	})
}