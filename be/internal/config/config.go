package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	ServerPort       string
	ServerEnv        string
	DBHost           string
	DBPort           string
	DBName           string
	DBUser           string
	DBPassword       string
	DBSSLMode        string
	RedisHost        string
	RedisPort        string
	RedisPassword    string
	RedisDB          int
	SessionSecret    string
	SessionDuration  string
	CORSOrigins      string
	CookieSecure     bool
	AdminEmails      string
}

func Load() *Config {
	return &Config{
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		ServerEnv:        getEnv("SERVER_ENV", "development"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBName:           getEnv("DB_NAME", "money_tracker"),
		DBUser:           getEnv("DB_USER", "app_user"),
		DBPassword:       getEnv("DB_PASSWORD", "app_password"),
		DBSSLMode:        getEnv("DB_SSLMODE", "disable"),
		RedisHost:        getEnv("REDIS_HOST", "localhost"),
		RedisPort:        getEnv("REDIS_PORT", "6379"),
		RedisPassword:    getEnv("REDIS_PASSWORD", ""),
		RedisDB:          0,
		SessionSecret:    getEnv("SESSION_SECRET", "change-me-in-production"),
		SessionDuration:  getEnv("SESSION_DURATION", "168h"),
		CORSOrigins:      getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"),
		CookieSecure:     getEnv("COOKIE_SECURE", "true") == "true",
		AdminEmails:      getEnv("ADMIN_EMAILS", ""),
	}
}

func (c *Config) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName, c.DBSSLMode)
}

func (c *Config) RedisAddr() string {
	return c.RedisHost + ":" + c.RedisPort
}

// GetAdminEmails returns parsed list of admin emails
func (c *Config) GetAdminEmails() []string {
	if c.AdminEmails == "" {
		return nil
	}
	emails := strings.Split(c.AdminEmails, ",")
	for i, e := range emails {
		emails[i] = strings.TrimSpace(strings.ToLower(e))
	}
	return emails
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}