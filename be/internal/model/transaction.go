package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type TransactionType string

const (
	TransactionDebit  TransactionType = "debit"
	TransactionCredit TransactionType = "credit"
)

type Transaction struct {
	ID              string          `json:"id" db:"id"`
	MessageID       *string         `json:"message_id,omitempty" db:"message_id"`
	BankName        *string         `json:"bank_name,omitempty" db:"bank_name"`
	AccountNumber   *string         `json:"account_number,omitempty" db:"account_number"`
	FamilyID        string          `json:"family_id" db:"family_id"`
	WalletOwnerID   string          `json:"wallet_owner_id" db:"wallet_owner_id"`
	Type            TransactionType `json:"type" db:"type"`
	Amount          decimal.Decimal `json:"amount" db:"amount"`
	CategoryID      *string         `json:"category_id,omitempty" db:"category_id"`
	Note            *string         `json:"note,omitempty" db:"note"`
	TransactionDate time.Time       `json:"transaction_date" db:"transaction_date"`
	CreatedBy       string          `json:"created_by" db:"created_by"`
	Balance         *decimal.Decimal `json:"balance,omitempty" db:"balance"`
	RawEmail        *string         `json:"raw_email,omitempty" db:"raw_email"`
	CreatedAt       time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt       *time.Time      `json:"updated_at,omitempty" db:"updated_at"`
}

// CanModify returns true if the given user can modify this transaction
func (t *Transaction) CanModify(userID string) bool {
	return t.CreatedBy == userID
}