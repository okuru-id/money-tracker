package model

import (
	"time"
)

type FailedParse struct {
	ID         string     `json:"id" db:"id"`
	MessageID  *string    `json:"message_id,omitempty" db:"message_id"`
	RawEmail   *string    `json:"raw_email,omitempty" db:"raw_email"`
	Error      *string    `json:"error,omitempty" db:"error"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
}