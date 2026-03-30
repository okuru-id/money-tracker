package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"money-tracker-be/internal/middleware"
	"money-tracker-be/internal/model"
	"money-tracker-be/internal/service"
)

type BankAccountHandler struct {
	bankAccountSvc service.BankAccountService
}

func NewBankAccountHandler(bankAccountSvc service.BankAccountService) *BankAccountHandler {
	return &BankAccountHandler{
		bankAccountSvc: bankAccountSvc,
	}
}

// Create godoc
// @Summary Create bank account
// @Description Create a new bank account for tracking assets
// @Tags bank-accounts
// @Accept json
// @Produce json
// @Security session
// @Param request body model.CreateBankAccountRequest true "Bank account data"
// @Success 201 {object} model.BankAccountResponse "Bank account created"
// @Failure 400 {object} model.ErrorResponse "Invalid request"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /bank-accounts [post]
func (h *BankAccountHandler) Create(c *gin.Context) {
	familyID := middleware.GetFamilyID(c)
	if familyID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"No family associated with your account.",
			nil,
		))
		return
	}

	var req model.CreateBankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	account, err := h.bankAccountSvc.Create(c.Request.Context(), familyID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to create bank account",
			nil,
		))
		return
	}

	c.JSON(http.StatusCreated, model.BankAccountResponse{
		ID:                account.ID,
		Name:              account.Name,
		AccountNumber:     account.AccountNumber,
		Balance:           account.Balance,
		CalculatedBalance: account.CalculatedBalance, // Will be 0 for new account
		Icon:              account.Icon,
		Color:             account.Color,
	})
}

// List godoc
// @Summary List bank accounts
// @Description Get all bank accounts for the user's family
// @Tags bank-accounts
// @Produce json
// @Security session
// @Success 200 {array} model.BankAccountResponse "List of bank accounts"
// @Failure 400 {object} model.ErrorResponse "No family"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /bank-accounts [get]
func (h *BankAccountHandler) List(c *gin.Context) {
	familyID := middleware.GetFamilyID(c)
	if familyID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"No family associated with your account.",
			nil,
		))
		return
	}

	accounts, err := h.bankAccountSvc.List(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get bank accounts",
			nil,
		))
		return
	}

	var response []model.BankAccountResponse
	for _, account := range accounts {
		response = append(response, model.BankAccountResponse{
			ID:                account.ID,
			Name:              account.Name,
			AccountNumber:     account.AccountNumber,
			Balance:           account.Balance,
			CalculatedBalance: account.CalculatedBalance,
			Icon:              account.Icon,
			Color:             account.Color,
		})
	}

	c.JSON(http.StatusOK, gin.H{"bank_accounts": response})
}

// Update godoc
// @Summary Update bank account
// @Description Update a bank account
// @Tags bank-accounts
// @Accept json
// @Produce json
// @Security session
// @Param id path string true "Bank account ID"
// @Param request body model.UpdateBankAccountRequest true "Bank account data"
// @Success 200 {object} model.BankAccountResponse "Bank account updated"
// @Failure 400 {object} model.ErrorResponse "Invalid request"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 404 {object} model.ErrorResponse "Not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /bank-accounts/{id} [patch]
func (h *BankAccountHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req model.UpdateBankAccountRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"Invalid request body",
			nil,
		))
		return
	}

	account, err := h.bankAccountSvc.Update(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "bank account not found" {
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"Bank account not found",
				nil,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to update bank account",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, model.BankAccountResponse{
		ID:                account.ID,
		Name:              account.Name,
		AccountNumber:     account.AccountNumber,
		Balance:           account.Balance,
		CalculatedBalance: account.CalculatedBalance,
		Icon:              account.Icon,
		Color:             account.Color,
	})
}

// Delete godoc
// @Summary Delete bank account
// @Description Delete a bank account
// @Tags bank-accounts
// @Security session
// @Param id path string true "Bank account ID"
// @Success 204 "Bank account deleted"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 404 {object} model.ErrorResponse "Not found"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /bank-accounts/{id} [delete]
func (h *BankAccountHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.bankAccountSvc.Delete(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "bank account not found" {
			c.JSON(http.StatusNotFound, middleware.ErrorResponse(
				middleware.CodeNotFound,
				"Bank account not found",
				nil,
			))
			return
		}
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to delete bank account",
			nil,
		))
		return
	}

	c.Status(http.StatusNoContent)
}

// GetTotalBalance godoc
// @Summary Get total balance
// @Description Get total balance across all bank accounts
// @Tags bank-accounts
// @Produce json
// @Security session
// @Success 200 {object} map[string]string "Total balance"
// @Failure 400 {object} model.ErrorResponse "No family"
// @Failure 401 {object} model.ErrorResponse "Unauthorized"
// @Failure 500 {object} model.ErrorResponse "Internal server error"
// @Router /bank-accounts/total [get]
func (h *BankAccountHandler) GetTotalBalance(c *gin.Context) {
	familyID := middleware.GetFamilyID(c)
	if familyID == "" {
		c.JSON(http.StatusBadRequest, middleware.ErrorResponse(
			middleware.CodeValidationError,
			"No family associated with your account.",
			nil,
		))
		return
	}

	total, err := h.bankAccountSvc.GetTotalBalance(c.Request.Context(), familyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, middleware.ErrorResponse(
			middleware.CodeInternalError,
			"Failed to get total balance",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, gin.H{"total_balance": total.String()})
}