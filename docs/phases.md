# Ownly --- Development Phases

## Phase 1 --- Project Setup

Deliverables: - Monorepo - Config - Fiber server - Astro app

Acceptance: - Frontend and backend run locally.

Status: **Complete**

- Initialized monorepo with `backend/` (Go/Fiber) and `frontend/` (Astro/React/TailwindCSS/shadcn)
- Backend boots on `:3000`, frontend dev server on `:5173`
- `.env.example` files for all required configuration
- ESLint/prettier formatting configuration

## Phase 2 --- Database

Deliverables: - Migrations - Models - Repositories

Acceptance: - CRUD verified.

Status: **Complete**

- 6 GORM models: User, Session, Asset, ImportCandidate, TimelineEvent, Reminder
- SQL migration file (`backend/migrations/001_initial.sql`) with all tables and indexes
- Repository layer per entity with user-scoped queries
- PostgreSQL via GORM with connection pooling

## Phase 3 --- Authentication

Deliverables: - Google OAuth - Sessions

Acceptance: - Login/logout works.

Status: **Complete**

- Google OAuth flow: redirect → token exchange → user info → find-or-create user
- HttpOnly cookie sessions with SHA-256 hashed tokens, 7-day expiry
- AuthMiddleware protecting all authenticated API routes (supports Cookie and Bearer token)
- AuthService with FindOrCreateUser, CreateSession, ValidateSession, DeleteSession

## Phase 4 --- Manual Assets

Deliverables: - Asset CRUD - Timeline events - File uploads

Acceptance: - Manual asset lifecycle complete.

## Phase 5 --- Dashboard

Deliverables: - Product grid - Drawer - Filters

Acceptance: - Dashboard functional.

## Phase 6 --- Timeline

Deliverables: - Timeline API - Timeline UI

## Phase 7 --- Search

Deliverables: - Full-text search - Filters

## Phase 8 --- Smart Import

Deliverables: - Gmail integration - Parser registry - Import queue -
Confirm/ignore flow

## Phase 9 --- Reminder Engine

Deliverables: - Reminder scheduling - Email delivery

## Phase 10 --- Polish

Deliverables: - Empty/loading/error states - Security hardening - Demo
seed
