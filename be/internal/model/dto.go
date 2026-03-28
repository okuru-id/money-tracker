package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Auth DTOs
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	User  *User `json:"user"`
	Token string `json:"token,omitempty"`
}

// Family DTOs
type CreateFamilyRequest struct {
	Name      string `json:"name" binding:"required"`
	CreatedBy string `json:"created_by"`
}

type FamilyResponse struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	CreatedBy     string    `json:"created_by"`
	CreatedByName string    `json:"created_by_name,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type FamilyMemberResponse struct {
	ID       string    `json:"id"`
	UserID   string    `json:"user_id"`
	Email    string    `json:"email"`
	Name     string    `json:"name"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}

type FamilySummaryResponse struct {
	TotalIncome  decimal.Decimal `json:"total_income"`
	TotalExpense decimal.Decimal `json:"total_expense"`
	NetBalance   decimal.Decimal `json:"net_balance"`
	Period       string          `json:"period"`
}

type PersonalSummaryResponse struct {
	TotalIncome  decimal.Decimal `json:"total_income"`
	TotalExpense decimal.Decimal `json:"total_expense"`
	NetBalance   decimal.Decimal `json:"net_balance"`
}

type CategoryTotal struct {
	Category string          `json:"category"`
	Amount   decimal.Decimal `json:"amount"`
}

type InsightsResponse struct {
	TotalIncome  decimal.Decimal `json:"total_income"`
	TotalExpense decimal.Decimal `json:"total_expense"`
	NetBalance   decimal.Decimal `json:"net_balance"`
	TotalTx      int64           `json:"total_tx"`
	ExpenseTx    int64           `json:"expense_tx"`
	IncomeTx     int64           `json:"income_tx"`
	ExpenseRatio decimal.Decimal `json:"expense_ratio"`
	TopExpense   []CategoryTotal `json:"top_expense"`
	TopIncome    []CategoryTotal `json:"top_income"`
}

// Bank Account DTOs
type CreateBankAccountRequest struct {
	Name          string          `json:"name" binding:"required,max=100"`
	AccountNumber string          `json:"account_number" binding:"required,max=50"`
	Balance       decimal.Decimal `json:"balance"`
	Icon          *string         `json:"icon,omitempty" binding:"omitempty,max=50"`
	Color         *string         `json:"color,omitempty" binding:"omitempty,max=20"`
}

type UpdateBankAccountRequest struct {
	Name          *string         `json:"name,omitempty" binding:"omitempty,max=100"`
	AccountNumber *string         `json:"account_number,omitempty" binding:"omitempty,max=50"`
	Balance       *decimal.Decimal `json:"balance,omitempty"`
	Icon          *string         `json:"icon,omitempty" binding:"omitempty,max=50"`
	Color         *string         `json:"color,omitempty" binding:"omitempty,max=20"`
}

type BankAccountResponse struct {
	ID            string          `json:"id"`
	Name          string          `json:"name"`
	AccountNumber string          `json:"account_number"`
	Balance       decimal.Decimal `json:"balance"`
	Icon          *string         `json:"icon,omitempty"`
	Color         *string         `json:"color,omitempty"`
}

// Invite DTOs
type CreateInviteResponse struct {
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
}

type JoinInviteRequest struct {
	// Token is from URL path, no body needed
}

// Transaction DTOs
type CreateTransactionRequest struct {
	WalletOwnerID   *string         `json:"wallet_owner_id,omitempty"`
	AccountNumber   *string         `json:"account_number,omitempty"`
	Type            string          `json:"type" binding:"required,oneof=income expense debit credit"`
	Amount          decimal.Decimal `json:"amount" binding:"required"`
	CategoryID      *string         `json:"category_id,omitempty"`
	Note            *string         `json:"note,omitempty"`
	TransactionDate string          `json:"transaction_date" binding:"required"`
}

type UpdateTransactionRequest struct {
	WalletOwnerID   *string         `json:"wallet_owner_id,omitempty"`
	Type            *string         `json:"type,omitempty" binding:"omitempty,oneof=income expense debit credit"`
	Amount          *decimal.Decimal `json:"amount,omitempty"`
	CategoryID      *string         `json:"category_id,omitempty"`
	Note            *string         `json:"note,omitempty"`
	TransactionDate *string         `json:"transaction_date,omitempty"`
}

type TransactionResponse struct {
	ID                string          `json:"id"`
	FamilyID          string          `json:"family_id"`
	WalletOwnerID     string          `json:"wallet_owner_id"`
	WalletOwnerName   string          `json:"wallet_owner_name,omitempty"`
	AccountNumber     *string         `json:"account_number,omitempty"`
	Type              string          `json:"type"`
	Amount            decimal.Decimal `json:"amount"`
	CategoryID        *string         `json:"category_id,omitempty"`
	CategoryName      string          `json:"category_name,omitempty"`
	Note              *string         `json:"note,omitempty"`
	TransactionDate   time.Time       `json:"transaction_date"`
	CreatedBy         string          `json:"created_by"`
	CreatedByName     string          `json:"created_by_name,omitempty"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         *time.Time      `json:"updated_at,omitempty"`
}

type TransactionListResponse struct {
	Data       []TransactionResponse `json:"data"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"total_pages"`
}

// Category DTOs
type CategoryResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Type      string `json:"type"`
	IsDefault bool   `json:"is_default"`
}

// Session data stored in Redis
type SessionData struct {
	UserID    string    `json:"user_id"`
	FamilyID  string    `json:"family_id"`
	UserRole  string    `json:"user_role"`
	ExpiresAt time.Time `json:"expires_at"`
}

// Admin DTOs
type AddMemberRequest struct {
	FamilyID string `json:"family_id" binding:"required"`
	UserID   string `json:"user_id" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=owner member"`
}

func (r *AddMemberRequest) ToFamilyMember() *FamilyMember {
	return &FamilyMember{
		ID:        uuid.New().String(),
		FamilyID:  r.FamilyID,
		UserID:    r.UserID,
		Role:      r.Role,
		JoinedAt:  time.Now(),
	}
}

type FamilyListResponse struct {
	Data       []FamilyListItem `json:"data"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	TotalPages int              `json:"total_pages"`
}

type FamilyListItem struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	CreatedBy     string    `json:"created_by"`
	CreatedByName string    `json:"created_by_name,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type UserListResponse struct {
	Data       []*User `json:"data"`
	Total      int64   `json:"total"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
	TotalPages int     `json:"total_pages"`
}

type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role" binding:"omitempty,oneof=user admin"`
}

type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

type UpdateUserRequest struct {
	Role string `json:"role" binding:"required,oneof=user admin"`
}

type UpdateFamilyRequest struct {
	Name string `json:"name" binding:"required"`
}

// API Error Response
type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

type ErrorDetail struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}