# Ownly --- Architecture

## Principles

-   Single deployable Go monolith
-   Clean layered architecture
-   No Gmail polling; inbox scans are user-triggered
-   Background scheduler only for reminder processing
-   PostgreSQL as the source of truth

## High-Level Architecture

Browser (Astro/React) → Fiber REST API → Services → Repositories →
PostgreSQL

External services: - Gmail API - Cloudflare R2 - Resend

## Layers

Handlers → Services → Repositories → Database

## Core Services

-   AuthService
-   ImportService
-   AssetService
-   TimelineService
-   ReminderService
-   SearchService
-   StorageService

## Import Flow

User triggers Scan Gmail → Gmail API → Parser Registry →
import_candidates → Import Queue → Confirm → Asset → Timeline Event →
Reminder Schedule

## Search

PostgreSQL Full Text Search using generated tsvector and GIN index.

## Reminder Engine

Reminder rows are generated during asset creation/update. A scheduler
periodically sends due reminder emails through Resend.

## Security

-   Google OAuth
-   HttpOnly sessions
-   Signed R2 uploads
-   Validation
-   Rate limiting
-   User-scoped queries

## Deployment

Frontend: Vercel

Backend: Railway (single service)

Database: Neon PostgreSQL

Storage: Cloudflare R2
