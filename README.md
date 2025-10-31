# FIX2AN Monorepo

This repository is now structured as a monorepo with separate frontend and backend folders.

**📋 Full MVP Requirements:** See [REQUIREMENTS.md](./REQUIREMENTS.md) for complete specifications.

## Current Status

✅ **Implemented:**
- Monorepo structure (frontend, backend, shared)
- Authentication system with NextAuth (JWT, email/password)
- Role-based access control (Customer, Workshop, Admin)
- Route protection (protected pages, auth redirects)
- Internationalization (Swedish/English with i18n)
- Navbar with logout functionality
- Database setup with PostgreSQL + Prisma
- Basic API structure (auth, vehicles)

⏳ **Next Priorities:**
- File upload to S3/Cloud Storage
- Workshop verification system
- Offers & booking flow
- Klarna Checkout integration
- Admin panel
- Email notifications (full template integration)

## Structure

- `frontend/` — Next.js 14 app (moved here from the original root)
- `backend/` — Express + TypeScript API server with Prisma
- `shared/` — Common TypeScript types/utilities used by both

## Workspaces

This repo uses npm workspaces. Run commands from the repo root.

- Install all workspaces

```bash
npm install
```

- Run both backend and frontend concurrently

```bash
npm run dev
```

- Build all

```bash
npm run build
```

- Lint all

```bash
npm run lint
```

- Format all (Prettier)

```bash
npm run format
```

- Run a specific workspace

```bash
npm run dev -w backend
npm run dev -w frontend
```

## Database: PostgreSQL (recommended)

1) Install and start PostgreSQL locally (e.g., via Docker):
```bash
docker run --name pg-fix2an -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=fixa2an -p 5432:5432 -d postgres:16
```

2) Configure backend env at `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fixa2an?schema=public"
```

3) Push schema and generate client:
```bash
npm run db:push -w backend
npm run db:generate -w backend
```

Note: For quick local runs without Postgres, set `DATABASE_URL="file:./prisma/dev.db"` and switch the Prisma provider to `sqlite` in `backend/prisma/schema.prisma`.

## Getting Started

### Frontend

```bash
# in repo root
npm run dev -w frontend
# or
cd frontend && npm install && npm run dev
```

### Backend

```bash
# in repo root
npm run dev -w backend
# or
cd backend && npm install && npm run dev
```

Notes:

- Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `frontend/.env.local`.
- Prisma schema lives in `backend/prisma`. Use backend scripts to manage it.
- Shared types in `shared/src/`; import via `@fix2an/shared`.
