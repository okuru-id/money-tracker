package repository

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"

	"money-tracker-be/internal/model"
)

type SessionRepository interface {
	Create(ctx context.Context, sessionID string, data *model.SessionData, ttl time.Duration) error
	Get(ctx context.Context, sessionID string) (*model.SessionData, error)
	Delete(ctx context.Context, sessionID string) error
	Extend(ctx context.Context, sessionID string, ttl time.Duration) error
}

type sessionRepository struct {
	redis *redis.Client
}

func NewSessionRepository(redis *redis.Client) SessionRepository {
	return &sessionRepository{redis: redis}
}

func (r *sessionRepository) Create(ctx context.Context, sessionID string, data *model.SessionData, ttl time.Duration) error {
	key := "session:" + sessionID
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}
	return r.redis.Set(ctx, key, jsonData, ttl).Err()
}

func (r *sessionRepository) Get(ctx context.Context, sessionID string) (*model.SessionData, error) {
	key := "session:" + sessionID
	data, err := r.redis.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var session model.SessionData
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *sessionRepository) Delete(ctx context.Context, sessionID string) error {
	key := "session:" + sessionID
	return r.redis.Del(ctx, key).Err()
}

func (r *sessionRepository) Extend(ctx context.Context, sessionID string, ttl time.Duration) error {
	key := "session:" + sessionID
	return r.redis.Expire(ctx, key, ttl).Err()
}