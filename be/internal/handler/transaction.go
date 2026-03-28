package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/model"
	"money-tracker-be/internal/repository"
	"money-tracker-be/internal/service"
)

type TransactionHandler struct {
	transactionSvc service.TransactionService
}

func NewTransactionHandler(transactionSvc service.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactionSvc: transactionSvc}
}

// List godoc
// @Summary List transactions
// @Description Get paginated list of transactions for the user's family
// @Tags transaction
// @Produce json
// @Security session
// @Param ownerId query string false "Filter by wallet owner ID"
// @Param period query string false "Time period (today, week, month)"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} model.TransactionListResponse "List of transactions"
// @Failure 400 {object} model.ErrorResponse "Invalid request"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /transactions [get]
func (h *TransactionHandler) List(c *gin.Context) {
	// Get family_id from session
	familyID := middleware.GetFamilyID(c)
	if familyID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"No family associated with your account. Please create or join a family first.",
			nil,
		))
		return
	}

	ownerID := c.Query("ownerId")
	period := c.Query("period")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	filter := repository.TransactionFilter{
		FamilyID: familyID,
		Page:     page,
		Limit:    limit,
	}

	if ownerID != "" {
		filter.OwnerID = &ownerID
	}

	// Parse period
	if period != "" {
		now := time.Now()
		switch period {
		case "today":
			start := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
			filter.StartDate = &start
		case "week":
			weekday := int(now.Weekday())
			start := time.Date(now.Year(), now.Month(), now.Day()-weekday, 0, 0, 0, 0, now.Location())
			filter.StartDate = &start
		case "month":
			start := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
			filter.StartDate = &start
		}
	}

	// Parse explicit date range (startDate, endDate in YYYY-MM-DD)
	if startStr := c.Query("startDate"); startStr != "" {
		if t, err := time.Parse("2006-01-02", startStr); err == nil {
			filter.StartDate = &t
		}
	}
	if endStr := c.Query("endDate"); endStr != "" {
		if t, err := time.Parse("2006-01-02", endStr); err == nil {
			filter.EndDate = &t
		}
	}

	result, err := h.transactionSvc.List(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get transactions",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, result)
}

// Create godoc
// @Summary Create transaction
// @Description Create a new transaction for the authenticated user's family
// @Tags transaction
// @Accept json
// @Produce json
// @Security session
// @Param request body model.CreateTransactionRequest true "Transaction data"
// @Success 201 {object} model.TransactionResponse "Transaction created successfully"
// @Failure 400 {object} model.ErrorResponse "Invalid request data"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /transactions [post]
func (h *TransactionHandler) Create(c *gin.Context) {
	familyID := middleware.GetFamilyID(c)
	userID := middleware.GetUserID(c)

	var req model.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request data",
			gin.H{"error": err.Error()},
		))
		return
	}

	tx, err := h.transactionSvc.Create(c.Request.Context(), familyID, userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			err.Error(),
			nil,
		))
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":               tx.ID,
		"family_id":        tx.FamilyID,
		"wallet_owner_id":  tx.WalletOwnerID,
		"account_number":   tx.AccountNumber,
		"type":             tx.Type,
		"amount":           tx.Amount,
		"category_id":      tx.CategoryID,
		"note":             tx.Note,
		"transaction_date": tx.TransactionDate.Format("2006-01-02"),
		"created_by":       tx.CreatedBy,
		"created_at":       tx.CreatedAt,
	})
}

// Update godoc
// @Summary Update transaction
// @Description Update an existing transaction. Only the creator can modify.
// @Tags transaction
// @Accept json
// @Produce json
// @Security session
// @Param id path string true "Transaction ID"
// @Param request body model.UpdateTransactionRequest true "Transaction update data"
// @Success 200 {object} model.TransactionResponse "Transaction updated successfully"
// @Failure 400 {object} model.ErrorResponse "Invalid request data"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 403 {object} model.ErrorResponse "Not authorized to modify"
// @Failure 404 {object} model.ErrorResponse "Transaction not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /transactions/{id} [patch]
func (h *TransactionHandler) Update(c *gin.Context) {
	transactionID := c.Param("id")
	userID := middleware.GetUserID(c)

	var req model.UpdateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request data",
			gin.H{"error": err.Error()},
		))
		return
	}

	tx, err := h.transactionSvc.Update(c.Request.Context(), userID, transactionID, &req)
	if err != nil {
		msg := err.Error()
		switch msg {
		case "transaction not found":
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				msg,
				nil,
			))
			return
		case "not authorized to modify this transaction":
			c.JSON(http.StatusForbidden, middleware.ErrorResponse(
				middleware.CodeForbidden,
				msg,
				nil,
			))
			return
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				msg,
				nil,
			))
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"id":               tx.ID,
		"family_id":        tx.FamilyID,
		"wallet_owner_id":  tx.WalletOwnerID,
		"type":             tx.Type,
		"amount":           tx.Amount,
		"category_id":      tx.CategoryID,
		"note":             tx.Note,
		"transaction_date": tx.TransactionDate.Format("2006-01-02"),
		"created_by":       tx.CreatedBy,
		"updated_at":       tx.UpdatedAt,
	})
}

// Delete godoc
// @Summary Delete transaction
// @Description Delete a transaction. Only the creator can delete.
// @Tags transaction
// @Produce json
// @Security session
// @Param id path string true "Transaction ID"
// @Success 200 {object} map[string]string "Transaction deleted successfully"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 403 {object} model.ErrorResponse "Not authorized to delete"
// @Failure 404 {object} model.ErrorResponse "Transaction not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /transactions/{id} [delete]
func (h *TransactionHandler) Delete(c *gin.Context) {
	transactionID := c.Param("id")
	userID := middleware.GetUserID(c)

	err := h.transactionSvc.Delete(c.Request.Context(), userID, transactionID)
	if err != nil {
		msg := err.Error()
		switch msg {
		case "transaction not found":
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				msg,
				nil,
			))
			return
		case "not authorized to delete this transaction":
			c.JSON(http.StatusForbidden, middleware.ErrorResponse(
				middleware.CodeForbidden,
				msg,
				nil,
			))
			return
		default:
			c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
				middleware.CodeInternalError,
				msg,
				nil,
			))
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

// GetPersonalSummary godoc
// @Summary Get personal summary
// @Description Get personal income/expense summary for the authenticated user
// @Tags transaction
// @Produce json
// @Security session
// @Success 200 {object} model.PersonalSummaryResponse "Personal summary"
// @Failure 400 {object} model.ErrorResponse "No family"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /transactions/summary [get]
func (h *TransactionHandler) GetPersonalSummary(c *gin.Context) {
	familyID := middleware.GetFamilyID(c)

	if familyID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"No family associated with your account.",
			nil,
		))
		return
	}

	summary, err := h.transactionSvc.GetPersonalSummary(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get personal summary",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, summary)
}

// GetInsights godoc
// @Summary Get insights data
// @Description Get insights data for dashboard (totals, counts, top categories)
// @Tags transaction
// @Produce json
// @Security session
// @Success 200 {object} model.InsightsResponse "Insights data"
// @Failure 400 {object} model.ErrorResponse "No family"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /transactions/insights [get]
func (h *TransactionHandler) GetInsights(c *gin.Context) {
	familyID := middleware.GetFamilyID(c)

	if familyID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"No family associated with your account.",
			nil,
		))
		return
	}

	insights, err := h.transactionSvc.GetInsights(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get insights",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, insights)
}