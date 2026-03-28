package model

import "time"

type InviteToken struct {
	ID        string     `json:"id" db:"id"`
	FamilyID  string     `json:"family_id" db:"family_id"`
	Token     string     `json:"token" db:"token"`
	ExpiresAt time.Time  `json:"expires_at" db:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty" db:"used_at"`
	CreatedBy string     `json:"created_by" db:"created_by"`
	CreatedAt time.Time  `json:"created_at" db:"created_at"`
}

func (i *InviteToken) IsValid() bool {
	return i.UsedAt == nil && time.Now().Before(i.ExpiresAt)
}