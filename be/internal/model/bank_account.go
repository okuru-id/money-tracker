package model

import (
	"time"

	"github.com/shopspring/decimal"
)

type BankAccount struct {
	ID            string          `json:"id" db:"id"`
	FamilyID      string          `json:"family_id" db:"family_id"`
	Name          string          `json:"name" db:"name"`
	AccountNumber string          `json:"account_number" db:"account_number"`
	Balance       decimal.Decimal `json:"balance" db:"balance"`
	Icon          *string         `json:"icon,omitempty" db:"icon"`
	Color         *string         `json:"color,omitempty" db:"color"`
	CreatedAt     time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at" db:"updated_at"`
}