package middleware

import (
	"context"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type RateLimitConfig struct {
	Requests   int
	Window     time.Duration
	KeyPrefix  string
	Message    string
}

// RateLimit creates a rate limiting middleware using Redis
func RateLimit(redis *redis.Client, config RateLimitConfig) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := config.KeyPrefix + ":" + c.ClientIP()

		ctx := context.Background()
		count, err := redis.Incr(ctx, key).Result()
		if err != nil {
			// If Redis fails, allow the request
			c.Next()
			return
		}

		if count == 1 {
			redis.Expire(ctx, key, config.Window)
		}

		if count > int64(config.Requests) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, ErrorResponse(
				CodeRateLimited,
				config.Message,
				gin.H{
					"retry_after": config.Window.Seconds(),
				},
			))
			return
		}

		c.Next()
	}
}

// InMemoryRateLimit is a fallback rate limiter when Redis is unavailable
type InMemoryRateLimit struct {
	mu      sync.RWMutex
	clients map[string]*clientInfo
}

type clientInfo struct {
	count     int
	expiresAt time.Time
}

func NewInMemoryRateLimit() *InMemoryRateLimit {
	return &InMemoryRateLimit{
		clients: make(map[string]*clientInfo),
	}
}

func (r *InMemoryRateLimit) Middleware(config RateLimitConfig) gin.HandlerFunc {
	// Cleanup old entries periodically
	go func() {
		ticker := time.NewTicker(time.Minute)
		for range ticker.C {
			r.mu.Lock()
			now := time.Now()
			for ip, info := range r.clients {
				if now.After(info.expiresAt) {
					delete(r.clients, ip)
				}
			}
			r.mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		r.mu.Lock()
		defer r.mu.Unlock()

		now := time.Now()
		info, exists := r.clients[ip]

		if !exists || now.After(info.expiresAt) {
			r.clients[ip] = &clientInfo{
				count:     1,
				expiresAt: now.Add(config.Window),
			}
			c.Next()
			return
		}

		info.count++
		if info.count > config.Requests {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, ErrorResponse(
				CodeRateLimited,
				config.Message,
				gin.H{
					"retry_after": time.Until(info.expiresAt).Seconds(),
				},
			))
			return
		}

		c.Next()
	}
}

// Rate limit configurations
var (
	LoginRateLimit = RateLimitConfig{
		Requests:  5,
		Window:    15 * time.Minute,
		KeyPrefix: "rl:login",
		Message:   "Too many login attempts. Please try again later.",
	}

	RegisterRateLimit = RateLimitConfig{
		Requests:  100,
		Window:    time.Hour,
		KeyPrefix: "rl:register",
		Message:   "Too many registration attempts. Please try again later.",
	}

	InviteRateLimit = RateLimitConfig{
		Requests:  10,
		Window:    time.Hour,
		KeyPrefix: "rl:invite",
		Message:   "Too many invite requests. Please try again later.",
	}
)