# PlacesOS - Workplace Resource Platform

PlacesOS is a full-stack workplace resource platform built with TypeScript React frontend, TypeScript Node.js Express API backend, and PostgreSQL.

## Architecture

- `frontend/`: React + Vite + Tailwind UI for booking calendar, availability grid, and admin operations.
- `backend/`: Express REST API with strict runtime config validation, PostgreSQL persistence, and audit logging.
- `.github/workflows/ci.yml`: lint, test, build pipeline.

## REST API Coverage

The backend includes 20+ endpoints across:

- `users`
- `resource-types`
- `resources`
- `bookings`
- `recurring-rules`
- `availability`
- `audit-log`

## Database Schema

Migration file: `backend/src/db/migrations/001_init.sql`

Normalized tables:

- `users`
- `resource_types`
- `resources`
- `bookings`
- `recurring_rules`
- `audit_log`

## Local Setup

1. Install dependencies from repo root:
   - `npm install`
2. Copy env templates and set real values:
   - `backend/.env.example` -> `backend/.env`
   - `frontend/.env.example` -> `frontend/.env`
3. Run migration:
   - `npm run migrate -w backend`
4. Start backend:
   - `npm run dev -w backend`
5. Start frontend (separate terminal):
   - `npm run dev -w frontend`

## Quality Gates

- Lint: `npm run lint`
- Test: `npm run test`
- Build: `npm run build`

## Notes

- Runtime configuration is fail-fast. Missing required env vars will stop startup.
- API writes generate records in `audit_log`.
