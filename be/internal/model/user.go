package model

import "time"

type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Role         UserRole  `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

// IsSystemUser returns true if this is the system user for legacy transactions
func (u *User) IsSystemUser() bool {
	return u.Email == "system@money-tracker.local"
}

// IsAdmin returns true if user has admin role
func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}