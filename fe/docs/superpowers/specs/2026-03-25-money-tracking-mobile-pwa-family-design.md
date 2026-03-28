# Design Spec: Money Tracking Mobile PWA (Family)

## Metadata
- Date: 2026-03-25
- Product: Money Tracking (mobile app view)
- Target platform: Mobile-first PWA (online-only for MVP)
- Primary users: Family/couple (multi-user)
- Chosen approach: Approach A (Speed-First Capture + Simple Structure)

## Problem Statement
Families need a practical way to record daily transactions quickly while still seeing a shared financial picture. Existing flows often optimize reporting but slow down transaction entry.

## Success Criteria
Primary KPI:
- Fast transaction input: user can submit a typical transaction in under 15 seconds.

Supporting outcomes:
- Family onboarding is reliable (invite and join).
- Family aggregate totals update quickly after each transaction.

## Scope
### In Scope (MVP)
- Email/password authentication per user.
- Family creation and invite-based join flow.
- Single-family membership per user for MVP (one user belongs to exactly one family).
- Personal wallet per member.
- Fast transaction entry (income/expense).
- Personal transaction history with light filtering.
- Family summary (combined income/expense/balance in selected period).

### Out of Scope (MVP)
- Offline mode and sync.
- Advanced analytics and rich charting.
- Complex budgeting rules and heavy notifications.
- Multi-currency and bank integrations.

## Product Principles
- Speed first for transaction capture.
- Keep required fields minimal.
- Prioritize one-hand mobile usage.
- Keep family model simple and understandable.

## Information Architecture (Mobile)
- Home
- Add
- History
- Family

Bottom tab navigation uses these four destinations only.

## Screen and Interaction Design
### 1) Home
- Shows personal balance card.
- Shows monthly family summary card.
- Quick actions: `+ Expense`, `+ Income`.
- Favorite categories for one-tap prefill into Add flow.

### 2) Add (Core KPI Screen)
Optimized order of interaction:
1. Enter amount (numeric keypad autofocus).
2. Pick category.
3. Submit.

Type handling:
- Default transaction type uses the last used type.
- User can switch type when needed (adds one optional interaction).

Defaults:
- Date = today.
- Wallet owner = logged-in user.
- Notes = optional.

Post-submit:
- Success toast.
- `Add Another` shortcut to maximize entry throughput.

### 3) History
- Personal transaction list.
- Light period filter (today/week/month).
- Simple edit support (amount/category/notes) for the transaction owner only.

### 4) Family
- Member list and invite status.
- Per-member contribution summary (lightweight totals).
- Generate new invite flow.

## Domain Model
Core entities:
- User
  - id, email, passwordHash, createdAt
- Family
  - id, name, createdBy, createdAt
- FamilyMember
  - id, familyId, userId, role, joinedAt
- InviteToken
  - id, familyId, token, expiresAt, usedAt, createdBy
- Transaction
  - id, familyId, walletOwnerId, type, amount, categoryId, note, transactionDate, createdBy, createdAt, updatedAt
- Category
  - id, name, type, isDefault

Derived/read model:
- FamilySummary
  - familyId, period, totalIncome, totalExpense, netBalance

## Data Flow
1. User authenticates and gets active session.
2. User family context is implicit from membership (single-family MVP).
3. User submits transaction payload with required fields.
4. Backend validates ownership and membership.
5. Backend stores transaction in ledger.
6. Backend updates or recomputes family summary read model.
7. Home and Family screens read from the summary for fast render.

## API Surface (Conceptual)
- `POST /auth/register`
- `POST /auth/login`
- `POST /families`
- `POST /families/:id/invites`
- `POST /invites/:token/join`
- `GET /families/:id/summary?period=month`
- `GET /transactions?familyId=&ownerId=&period=`
- `POST /transactions`
- `PATCH /transactions/:id`

## Validation Rules
- `amount` must be greater than 0.
- `type` and `categoryId` are required.
- `transactionDate` must be valid.
- `walletOwnerId` must match authenticated user permissions.
- Authenticated user must be a member of `familyId`.
- Transaction updates are allowed only when `createdBy` matches authenticated user id.

## Error Handling and Recovery
- Field validation errors shown inline under input.
- Network failure on submit keeps form data in-screen and offers `Retry`.
- Expired session redirects to login and returns user to last intended screen after re-auth.

## Security and Integrity
- Invite token has expiration and single-use behavior.
- Basic rate limiting on auth and invite endpoints.
- Audit fields on transaction create/update.
- Server-side authorization checks for all family-scoped reads/writes.
- Edit authorization is strict: members can edit only their own transactions in MVP.

## Performance and UX Targets
- Typical submit path from Add screen should be <= 3 core interactions for common entries (amount -> category -> submit).
- If user changes type from default, path becomes 4 interactions and is accepted as non-typical.
- First response feedback after submit should feel immediate (toast/snackbar).
- List and summary views should prioritize fast loading with simple payloads.
- Family summary freshness target: visible update within 2 seconds after successful transaction submit.

## Analytics Events
- `open_add`
- `submit_success`
- `submit_fail`
- `time_to_submit_ms`
- `type_switch_before_submit`

These events support measurement of the primary KPI.

## Favorite Categories Rules
- Favorite categories are client-side only in MVP (derived from each user's recent categories).
- Show maximum 6 favorites on Home.
- No dedicated server-side favorite management endpoint in MVP.

## QA Scenarios (Manual, No New Test Files)
- Register/login success and failure paths.
- Invite generation, invite acceptance, family join confirmation.
- Create transaction as member A and verify family summary updates.
- Verify personal history filters for today/week/month.
- Simulate submit-time network failure and retry recovery.
- Verify rapid-entry path can be completed in under 15 seconds for common transaction inputs.

## Risks and Mitigations
- Risk: Add flow grows too complex and harms speed.
  - Mitigation: Keep required fields minimal and postpone extra fields.
- Risk: Family summary lags behind writes.
  - Mitigation: Use lightweight recompute/update strategy and monitor latency.
- Risk: Invite misuse.
  - Mitigation: Expiring single-use tokens plus membership checks.

## Future Iterations (Post-MVP)
- Offline-first draft mode and background sync.
- Budget guardrails and overspending warnings.
- Rich trend insights and comparison visuals.
- Better invite lifecycle controls (revoke/history).

## Implementation Readiness
This spec is scoped for one implementation plan focused on a single subsystem set:
- mobile-first PWA client flow,
- auth/family membership,
- transaction ledger and family summary read model.

No independent extra subsystems are included beyond this scope.
