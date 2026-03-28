# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Selalu jawab dalam Bahasa Indonesia.

## Project Overview

Money Tracker Backend - Go backend API for a mobile-first PWA frontend. Provides RESTful API for authentication, family management, transaction ledger, and invite system.

## Commands

```bash
# Build
go build ./...

# Run server
go run ./cmd/server

# Run with Docker
docker compose up --build

# Apply database migrations (Atlas)
atlas migrate apply --env local

# Verify schema
docker exec postgres_db psql -U app_user -d money_tracker -c "\d transactions"
```

## Architecture

4-layer clean architecture:

1. **Handler** (`internal/handler/`) - Gin HTTP handlers, request parsing, response formatting
2. **Service** (`internal/service/`) - Business logic, authorization, validation
3. **Repository** (`internal/repository/`) - PostgreSQL/Redis operations
4. **Model** (`internal/model/`) - Domain entities and DTOs

Flow: HTTP Request → Handler → Service → Repository → Database → Response

## Project Structure

```
be/
├── cmd/server/main.go          # Entry point
├── internal/
│   ├── handler/                # HTTP handlers
│   ├── service/                # Business logic
│   ├── repository/             # Data access (PostgreSQL + Redis)
│   ├── model/                  # Domain entities + DTOs
│   ├── middleware/             # Auth, error recovery, rate limiting
│   ├── router/                 # Route definitions
│   ├── bootstrap/              # Dependency wiring
│   └── config/                 # Environment config
├── migrations/                  # Atlas migration files
├── Dockerfile
└── docker-compose.yml
```

## Key Design Decisions

- **Session Management**: Redis-backed sessions with key `session:{session_id}`, 7-day TTL, cookie-based auth with HttpOnly/Secure/SameSite=Strict flags
- **Password Security**: bcrypt with cost factor 10, minimum 8 characters
- **Transaction Ownership**: Only `created_by` user can update/delete transactions. `wallet_owner_id` can differ from creator (for tracking family members' wallets)
- **Legacy Data**: Existing transactions from email parsing system are read-only. System user (`system@money-tracker.local`) cannot login. Legacy fields preserved: `message_id`, `bank_name`, `account_number`, `balance`, `raw_email`

## Rate Limiting Rules

- `/api/auth/login`: 5 attempts per 15 minutes per IP
- `/api/auth/register`: 3 attempts per hour per IP
- `/api/families/:id/invites`: 10 per hour per family

## Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0",
    "details": { "field": "amount" }
  }
}
```

Error codes: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`

## Tech Stack

- Go 1.21+, Gin, PostgreSQL 17, Redis, Atlas, Docker
- Driver: `github.com/jackc/pgx/v5` for PostgreSQL
- Redis client: `github.com/redis/go-redis/v9`