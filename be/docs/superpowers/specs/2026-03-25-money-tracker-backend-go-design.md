# Design Spec: Money Tracker Backend (Go)

## Metadata
- Date: 2026-03-25
- Product: Money Tracking Backend API
- Tech Stack: Go, Gin, PostgreSQL, Redis, Atlas, Docker
- Target: Backend API untuk mobile-first PWA frontend

## Problem Statement
Backend Go diperlukan untuk mendukung Money Tracking Mobile PWA yang dijelaskan dalam frontend spec. Backend harus menyediakan RESTful API untuk autentikasi, family management, transaction ledger, dan invite system.

## Success Criteria
- API response time < 200ms untuk typical operations
- Reliable session management dengan Redis
- Data integrity untuk family transaction sharing
- Transaction input dapat diproses < 1s untuk memenuhi KPI frontend (15s end-to-end)

## Tech Stack
- **Language**: Go 1.21+
- **Framework**: Gin (routing/middleware)
- **Database**: PostgreSQL 17
- **Cache/Session**: Redis
- **Migration Tool**: Atlas
- **Deployment**: Docker

## Architecture Overview

Backend menggunakan clean architecture dengan 4 layers:

### Layer Architecture
1. **Handler Layer**
   - Gin HTTP handlers
   - Request parsing dan validation
   - Response formatting
   - Routing management

2. **Service Layer**
   - Business logic implementation
   - Authorization checks
   - Validation rules dari spec
   - Transaction orchestration

3. **Repository Layer**
   - Database operations (pgx atau Gorm)
   - Redis session storage
   - Data access abstraction

4. **Model Layer**
   - Domain entities (User, Family, Transaction, etc.)
   - DTOs (Data Transfer Objects)
   - Request/Response structs

### Flow
HTTP Request → Handler → Service → Repository → Database → Response

## Project Structure

```
be/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handler/
│   │   ├── auth.go
│   │   ├── family.go
│   │   ├── transaction.go
│   │   └── invite.go
│   ├── service/
│   │   ├── auth.go
│   │   ├── family.go
│   │   ├── transaction.go
│   │   └── invite.go
│   ├── repository/
│   │   ├── user.go
│   │   ├── family.go
│   │   ├── transaction.go
│   │   └── session.go
│   ├── model/
│   │   ├── user.go
│   │   ├── family.go
│   │   ├── transaction.go
│   │   ├── category.go
│   │   └── dto.go
│   ├── middleware/
│   │   ├── auth.go
│   │   └── error.go
│   └── config/
│       └── config.go
├── migrations/
├── Dockerfile
├── go.mod
└── go.sum
```

Package `internal` untuk code yang hanya diakses internal (Go visibility rules).

## Data Model & Database Schema

### Database Integration
Backend akan menggunakan database `money_tracker` yang sudah ada di Docker container. Database ini sudah berisi table `transactions` dengan data legacy dari email parsing system (fields: message_id, bank_name, account_number, balance, raw_email). Table `transactions` yang sudah ada akan diupdate untuk mendukung family tracking dengan menambahkan columns baru (family_id, wallet_owner_id, category_id, note, created_by, updated_at) dan mengubah id dari integer ke UUID. Table-table baru (users, families, family_members, invite_tokens, categories) akan dibuat.

### Schema Design

**users**
- id (UUID, PK)
- email (VARCHAR, UNIQUE, NOT NULL)
- password_hash (VARCHAR, NOT NULL)
- created_at (TIMESTAMP)

**families**
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- created_by (UUID, FK users.id)
- created_at (TIMESTAMP)

**family_members**
- id (UUID, PK)
- family_id (UUID, FK families.id)
- user_id (UUID, FK users.id)
- role (VARCHAR: owner/member)
- joined_at (TIMESTAMP)

**invite_tokens**
- id (UUID, PK)
- family_id (UUID, FK families.id)
- token (VARCHAR, UNIQUE, NOT NULL)
- expires_at (TIMESTAMP, NOT NULL)
- used_at (TIMESTAMP, NULLABLE)
- created_by (UUID, FK users.id)

**transactions** (updated from existing)
- id (UUID, PK) - migrate dari integer ke UUID
- message_id (VARCHAR, UNIQUE, nullable) - untuk email parsing integration
- bank_name (VARCHAR, nullable) - untuk email parsing integration
- account_number (VARCHAR, nullable) - untuk email parsing integration
- family_id (UUID, FK families.id, NOT NULL) - NEW
- wallet_owner_id (UUID, FK users.id, NOT NULL) - NEW
- type (VARCHAR: income/expense/debit/credit) - expand dari spec
- amount (DECIMAL, NOT NULL)
- category_id (UUID, FK categories.id, nullable) - NEW
- note (TEXT) - rename/merge dari description
- transaction_date (DATE, NOT NULL) - convert dari timestamp
- created_by (UUID, FK users.id) - NEW
- balance (DECIMAL, nullable) - untuk email parsing integration
- raw_email (TEXT, nullable) - untuk email parsing integration
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP) - NEW

**categories**
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- type (VARCHAR: income/expense)
- is_default (BOOLEAN, DEFAULT true)

### Session Storage (Redis)
Key: `session:{session_id}`
Value: `{"user_id": "uuid", "family_id": "uuid", "expires_at": "timestamp"}`
TTL: 7 days

### Migration Strategy
1. Buat table-table baru (users, families, family_members, invite_tokens, categories)
2. Migrate existing transactions data ke schema baru:
   - Generate dummy family_id untuk existing data
   - Generate dummy wallet_owner_id untuk existing data
   - Generate dummy created_by untuk existing data
3. Update constraint dan index
4. Set default categories seed data

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login, create session
- `POST /api/auth/logout` - Destroy session

### Family
- `POST /api/families` - Create new family (auto-join as owner)
- `GET /api/families/:id/summary?period=month` - Get family summary
- `GET /api/families/:id/members` - List family members

### Invite
- `POST /api/families/:id/invites` - Generate invite token
- `POST /api/invites/:token/join` - Join family with token

### Transaction
- `GET /api/transactions?familyId=&ownerId=&period=&page=&limit=` - List transactions with filters dan pagination (default page=1, limit=20)
- `POST /api/transactions` - Create transaction (family_id auto-filled from session, wallet_owner_id optional - defaults to authenticated user)
- `PATCH /api/transactions/:id` - Update transaction (owner only)
- `DELETE /api/transactions/:id` - Delete transaction (owner only)

### Category
- `GET /api/categories?type=income|expense` - List categories

### Authentication
Semua endpoint (kecuali `/api/auth/*`) butuh authentication middleware. Session validation dilakukan di middleware.

## Authentication & Authorization

### Session Management
- Session stored di Redis dengan key `session:{session_id}`
- Session value: `{"user_id": "uuid", "family_id": "uuid", "expires_at": "timestamp"}`
- Session cookie: `session_id` with HttpOnly, Secure, SameSite=Strict
- Session expiry: 7 days default, refresh on activity
- Session cleanup: Expired sessions removed via Redis TTL

### Authorization Logic
- Middleware checks session validity dan user membership
- `family_id` dari session must match requested `family_id` di parameters
- Transaction creation: User dapat create transaction untuk family-nya sendiri dengan `wallet_owner_id` dapat berbeda dari user (misalnya tracking spouse's wallet)
- Transaction update/delete: Hanya user yang sama dengan `created_by` dapat modify transaction, terlepas dari `wallet_owner_id`
- Invite generation: user must be owner of family

### Password Security
- Hashing dengan bcrypt, cost factor 10
- Minimum password length: 8 characters
- Password validation di service layer

### Rate Limiting
- `/api/auth/login`: 5 attempts per 15 minutes per IP
- `/api/auth/register`: 3 attempts per hour per IP
- `/api/families/:id/invites`: 10 per hour per family

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than 0",
    "details": {
      "field": "amount"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failures (400)
- `UNAUTHORIZED`: Invalid or expired session (401)
- `FORBIDDEN`: User doesn't have permission (403)
- `NOT_FOUND`: Resource not found (404)
- `CONFLICT`: Email exists, invite expired/used (409)
- `RATE_LIMITED`: Too many requests (429)
- `INTERNAL_ERROR`: Server error (500)

### Validation Errors
- Field-level errors returned in `details`
- Multiple field errors aggregated in single response
- Consistent dengan frontend validation needs

### Recovery
- Database connection errors: Return 500 dengan generic message
- Redis unavailable: Fail auth, return 500
- Panic recovery middleware catches dan logs 500
- Semua errors logged untuk debugging

## Configuration

### Environment Variables
```bash
# Server
SERVER_PORT=8080
SERVER_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=money_tracker
DB_USER=app_user
DB_PASSWORD=app_password
DB_SSLMODE=disable

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Auth
SESSION_SECRET=random-secret-key-change-in-prod
SESSION_DURATION=168h  # 7 days

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Configuration Loading
- Configuration loaded via `os.Getenv()`
- Defaults hardcoded untuk development
- Struct-based config untuk type safety
- Validation saat startup untuk required env vars

## Docker Configuration

### Dockerfile
Multi-stage build:
1. Builder stage: Compile Go binary
2. Runtime stage: Minimal base image dengan Go binary

### Docker Compose
Services:
- `backend`: Go API service
- `postgres`: Database (existing)
- `redis`: Session storage (new)

### Environment
Environment variables disediakan via `.env` file di development dan secret management di production.

## Performance Targets

### Response Time
- Authentication operations: < 100ms
- Transaction CRUD operations: < 200ms
- Family summary queries: < 300ms
- Transaction list queries: < 200ms

### Throughput
- Support 100 concurrent users untuk MVP
- 1000 requests per minute tanpa degradation

### Optimization
- Database indexing di foreign keys dan frequently queried fields
- Redis caching untuk session store (memcached di Redis)
- Connection pooling untuk database connections

## Security Considerations

### Input Validation
- Semua input divalidasi di handler dan service layer
- SQL injection prevention via parameterized queries
- XSS prevention via proper sanitization

### CORS Configuration
- Allowed origins configured via environment variable
- Support preflight requests
- Proper headers configuration

### Secrets Management
- Password hashing dengan bcrypt
- Session secrets via environment variables
- No secrets di code or repository

### Rate Limiting
- Login attempts limited per IP
- Registration attempts limited per IP
- Invite generation limited per family

## Testing Strategy

### Unit Tests
- Service layer: Business logic testing
- Repository layer: Database operation mocking
- Handler layer: Request/response testing

### Integration Tests
- End-to-end API testing dengan test database
- Session flow testing
- Transaction lifecycle testing

### Manual QA Scenarios
- Register/login success dan failure paths
- Invite generation, invite acceptance, family join confirmation
- Create transaction sebagai member A dan verify family summary updates
- Verify personal history filters untuk today/week/month
- Simulate submit-time network failure dan retry recovery
- Verify rapid-entry path dapat diselesaikan dalam < 15 seconds

Note: Tidak ada unit test file yang akan dibuat sesuai policy, kecuali diminta oleh user.

## Migration Notes

### Existing Data Handling
Table `transactions` yang sudah ada berisi data dari email parsing system:
- `message_id`, `bank_name`, `account_number`, `raw_email` - untuk email integration
- `balance` - untuk bank statement reconciliation

Migration strategy:
1. Create default family "Imported" dengan name="Imported Transactions" dan created_by system user
2. Generate system user account untuk legacy data ownership (email="system@money-tracker.local", password random, marked as read-only via application logic)
3. Update existing transactions:
   - Set `family_id` ke ID dari "Imported" family
   - Set `wallet_owner_id` ke ID dari system user
   - Set `created_by` ke ID dari system user
4. Preserve legacy fields (message_id, bank_name, dll) untuk backward compatibility
5. Legacy transactions bersifat read-only melalui application logic (system user tidak boleh login, transaction modification disabled untuk created_by=system_user)

### Atlas Integration
- Migration files di `migrations/` directory
- Schema tracking via Atlas
- Rollback support untuk critical migrations

## Risks and Mitigations

### Risk: Session store unavailability
- Mitigation: Redis dengan persistence (RDB+AOF)
- Fallback: Degraded auth experience dengan clear messaging

### Risk: Database migration failures
- Mitigation: Comprehensive migration testing di staging
- Rollback plan untuk setiap migration
- Data backup sebelum production migration

### Risk: Performance degradation dengan data growth
- Mitigation: Database indexing strategy
- Query optimization dan pagination
- Redis caching untuk frequently accessed data

## Future Iterations (Post-MVP)

### Enhanced Features
- Advanced analytics dan reporting
- Real-time updates via WebSocket
- Push notifications untuk family updates
- Email integration untuk bank statement parsing

### Infrastructure
- Horizontal scaling dengan load balancer
- Database read replicas untuk read-heavy queries
- Redis cluster untuk high availability

### Security
- MFA implementation
- OAuth2 integration untuk third-party auth
- Enhanced audit logging

## Implementation Readiness

Design ini siap untuk implementation plan dengan:
- Tech stack terpilih: Go, Gin, PostgreSQL, Redis, Atlas, Docker
- Architecture yang jelas: Clean architecture dengan 4 layers
- API endpoints yang lengkap sesuai frontend spec
- Migration strategy yang handle existing data
- Security dan performance considerations teridentifikasi

Independent subsystem yang included:
- REST API service
- Auth/family membership
- Transaction ledger dengan family support
- Session management dengan Redis
- Email parsing integration (legacy support)

Tidak ada independent extra subsystems di luar scope ini.
