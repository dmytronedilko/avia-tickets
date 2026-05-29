# AviaTickets

A full-stack flight search and booking demo. Users can search one-way or round-trip flights, filter by cabin class, sort results, register an account, top up a wallet balance, and pay for bookings from that balance.

## Tech stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router) · React 19 · Tailwind CSS · TypeScript    |
| Backend  | NestJS 10 · Drizzle ORM · PostgreSQL · Passport JWT · TypeScript  |
| Infra    | Docker Compose · GitHub Actions CI                                |

## Features

- **Flight search** by origin, destination, and date, with cabin filter (economy / premium / business / first) and sorting (best / cheapest / fastest / earliest).
- **One-way and round-trip** booking, including a separate return leg.
- **Authentication** — register and log in with email + password (hashed with bcrypt), JWT-based sessions.
- **Change password** — signed-in users can set a new password by confirming their current one.
- **Wallet** — each account has a balance that can be topped up; bookings are paid from it.
- **Booking history** — view your past bookings.
- **Cancellation** — cancel a confirmed ticket; seats (both legs of a round trip) are released and the amount paid is refunded to the travel balance instantly.

## Architecture

The repo is a monorepo with two apps orchestrated by Docker Compose:

- `frontend/` — Next.js app served on port **3000**. It proxies `/api/*` to the backend at request time via a catch-all route handler (`src/app/api/[...path]/route.ts`), reading `BACKEND_URL` from the runtime environment.
- `backend/` — NestJS REST API served on port **3001**, backed by PostgreSQL through Drizzle ORM.
- `db` — PostgreSQL 15 with a persisted volume.

On startup the backend container runs migrations and seeds sample flights before serving requests. Compose uses healthchecks so each service only starts after its dependency is ready (db → backend → frontend).

## Quick start (Docker)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

The database is migrated and seeded with sample flights automatically.

## Local development

Run PostgreSQL yourself (or `docker compose up db`), then start each app.

### Backend

```bash
cd backend
npm install
npm run migrate    # apply schema
npm run seed       # insert sample flights
npm run start:dev  # watch mode on :3001
```

Environment variables:

| Variable         | Default                                                    | Description                  |
| ---------------- | ---------------------------------------------------------- | ---------------------------- |
| `DATABASE_URL`   | —                                                          | PostgreSQL connection string |
| `PORT`           | `3001`                                                     | API port                     |
| `JWT_SECRET`     | `dev-secret-change-me-in-production`                       | JWT signing secret           |
| `JWT_EXPIRES_IN` | `7d`                                                       | Token lifetime               |

### Frontend

```bash
cd frontend
npm install
npm run dev        # :3000
```

Set `BACKEND_URL` (default `http://localhost:3001`) so the `/api/*` proxy reaches the backend.

## API reference

Auth-protected routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint            | Auth | Description                                                            |
| ------ | ------------------- | ---- | --------------------------------------------------------------------- |
| POST   | `/auth/register`         | —    | Register (`email`, `name`, `password`); returns a JWT                 |
| POST   | `/auth/login`            | —    | Log in (`email`, `password`); returns a JWT                           |
| GET    | `/auth/me`               | ✓    | Current user profile                                                   |
| POST   | `/auth/change-password`  | ✓    | Change password (`currentPassword`, `newPassword`)                     |
| GET    | `/flights`               | —    | Search flights (`origin`, `destination`, `date`, `sort`, `cabin`, `passengers`) |
| POST   | `/bookings`              | ✓    | Create a booking (`flightId`, optional `returnFlightId`, `passengers`) |
| GET    | `/bookings/me`           | ✓    | List the current user's bookings                                       |
| PATCH  | `/bookings/:id/cancel`   | ✓    | Cancel a booking; refunds the fare and releases the seats              |
| GET    | `/users/me`              | ✓    | Current user (incl. balance)                                           |
| POST   | `/users/me/top-up`       | ✓    | Add funds to the wallet (`amount`, 1–10000)                            |

## Data model

- **users** — `id`, `email`, `name`, `passwordHash`, `balance`, `createdAt`
- **flights** — `id`, `origin`, `destination`, `departureTime`, `durationMinutes`, `price`, `availableSeats`, `cabin`
- **bookings** — `id`, `userId`, `flightId`, `returnFlightId`, `passengers`, `bookingTime`, `status`, `pricePaid`

## Scripts

Both `backend/` and `frontend/` expose the same quality scripts:

```bash
npm run lint          # ESLint (zero warnings)
npm run typecheck     # tsc --noEmit
npm run format:check  # Prettier
npm test              # Vitest (run once)
npm run test:watch    # Vitest (watch mode)
npm run test:cov      # Vitest with coverage
npm run build         # production build
```

## Testing

Both apps are tested with [Vitest](https://vitest.dev/).

```bash
cd backend && npm test     # backend unit tests
cd frontend && npm test    # frontend unit tests
```

**Backend** (`backend/src/**/*.spec.ts`) — unit tests for the service layer and
mappers. The Drizzle database is mocked, so no running PostgreSQL is required:

- `auth.service` — registration (password hashing, email normalization,
  duplicate-email conflict), login (valid / unknown email / wrong password), and
  changing a password (current-password check, same-password guard, re-hashing).
- `bookings.service` — fare + 12% tax calculation, balance checks, seat
  availability, one-way and round-trip booking, validation errors, and
  cancellation (refund, seat release on both legs, already-cancelled guard).
- `users.service` — fetching a profile and topping up the wallet.
- `flights.service` — search result mapping and WHERE-clause building.
- `flight.mapper` / `user.mapper` — row-to-DTO conversion.

**Frontend** (`frontend/src/lib/**/*.test.ts`) — unit tests for the shared
client helpers:

- `format` — duration formatting and ISO date math.
- `api` — `apiGet` / `apiPost` / `apiPatch` request building, auth headers,
  server-error parsing, and `AuthExpiredError` on `401` (with a mocked `fetch`).

## CI

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs Prettier, ESLint, TypeScript, **tests**, and a build for the backend and frontend on every push and pull request to `main`.
