package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"money-tracker-be/internal/model"
)

type InviteRepository interface {
	Create(ctx context.Context, invite *model.InviteToken) error
	FindByToken(ctx context.Context, token string) (*model.InviteToken, error)
	MarkUsed(ctx context.Context, inviteID string) error
}

type inviteRepository struct {
	db *pgxpool.Pool
}

func NewInviteRepository(db *pgxpool.Pool) InviteRepository {
	return &inviteRepository{db: db}
}

func (r *inviteRepository) Create(ctx context.Context, invite *model.InviteToken) error {
	query := `
		INSERT INTO invite_tokens (id, family_id, token, expires_at, used_at, created_by, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.Exec(ctx, query,
		invite.ID,
		invite.FamilyID,
		invite.Token,
		invite.ExpiresAt,
		invite.UsedAt,
		invite.CreatedBy,
		invite.CreatedAt,
	)
	return err
}

func (r *inviteRepository) FindByToken(ctx context.Context, token string) (*model.InviteToken, error) {
	query := `
		SELECT id, family_id, token, expires_at, used_at, created_by, created_at
		FROM invite_tokens
		WHERE token = $1
	`
	invite := &model.InviteToken{}
	err := r.db.QueryRow(ctx, query, token).Scan(
		&invite.ID,
		&invite.FamilyID,
		&invite.Token,
		&invite.ExpiresAt,
		&invite.UsedAt,
		&invite.CreatedBy,
		&invite.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return invite, nil
}

func (r *inviteRepository) MarkUsed(ctx context.Context, inviteID string) error {
	query := `
		UPDATE invite_tokens
		SET used_at = $1
		WHERE id = $2
	`
	_, err := r.db.Exec(ctx, query, time.Now(), inviteID)
	return err
}

// GenerateInviteToken creates a new unique token
func GenerateInviteToken() string {
	return uuid.New().String()
}