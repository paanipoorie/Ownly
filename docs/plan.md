# Ownly --- Product Plan

## Vision

Ownly is a personal ownership hub that helps users organize everything
they own, import purchases from Gmail or manually, and receive reminders
before warranty and exchange deadlines.

## Problem

Invoices and receipts are scattered across email and local storage.
Users forget warranties, lose invoices, and miss return windows.

## Goals

-   Centralize owned items
-   Support Gmail and manual imports
-   Track warranties and exchange windows
-   Provide a searchable dashboard
-   Send reminder emails

## MVP Scope

### Module 1 --- Smart Imports

-   Gmail import
-   Manual entry
-   Import Queue
-   Amazon, Flipkart and generic parser

### Module 2 --- Dashboard

-   Product cards
-   Universal search
-   Filters
-   Side drawer

### Module 3 --- Timeline

-   Global chronological timeline

### Module 4 --- Search

-   Search products, merchants, invoice numbers and notes
-   Filters

### Module 5 --- Reminder Engine

-   Warranty reminder emails
-   Exchange reminder emails

## Navigation

-   Dashboard
-   Timeline
-   Imports
-   Settings

## Tech Stack

Frontend: Astro, React, TypeScript, TailwindCSS, shadcn/ui

Backend: Go, Fiber, GORM

Database: PostgreSQL (Neon)

Storage: Cloudflare R2

Authentication: Google OAuth

Email: Gmail API, Resend

Deployment: Vercel + Railway

## Non Goals

-   AI features
-   Analytics
-   Categories
-   Teams
-   Subscription tracking
-   Domain management

## Success Criteria

A user can connect Gmail, import purchases, manually manage assets,
search them, view timeline events, and receive reminder emails.
