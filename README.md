# Evindo House — Real Estate Platform

A full-featured real estate platform for property rental, purchase, and housing-related services. Built for the Vietnamese market with bilingual support (English / Tiếng Việt) and dual-currency transactions (USD / VND), compliant with Vietnam's Housing Law 2023, Land Law 2024, and Real Estate Business Law 2023.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components, Server Actions) |
| Language | TypeScript 5 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Auth | Auth.js v5 (Credentials — JWT strategy) |
| UI | shadcn/ui + Tailwind CSS v4 + Radix UI |
| Storage | Cloudflare R2 (S3-compatible, presigned uploads) |
| Validation | Zod v4 |
| Charts | Recharts |
| Toasts | Sonner |

---

## Project Structure

```
housing-agent/
├── app/
│   ├── (auth)/                   # Login, Register pages + auth actions/service
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── accounts/             # Account management (Admin) + profile (self-service)
│   │   │   └── services/         # account.service.ts — DB queries
│   │   ├── branch/               # Branch management
│   │   │   └── services/         # branch.service.ts — DB queries
│   │   ├── properties/           # Property listings
│   │   │   └── services/         # property.service.ts — DB queries
│   │   └── admin/mainpage/       # Dashboard overview
│   ├── api/upload/               # Presigned URL endpoint for R2 uploads
│   └── db/
│       ├── schema/               # Drizzle schema (one file per table)
│       └── scripts/              # migrate, push, seed, test-connection
├── components/
│   ├── dashboard/                # Sidebar, nav, page-specific components
│   └── ui/                       # shadcn/ui primitives
└── lib/
    ├── auth.ts                   # NextAuth + credentials provider
    ├── auth.config.ts            # Edge-compatible auth config (JWT callbacks)
    ├── auth-guard.ts             # requireAuth / requireRoles helpers
    ├── crypto.ts                 # bcryptjs hash / verify
    └── r2.ts                     # Cloudflare R2 client
```

---

## Architecture

### Server Actions over REST API

All data mutations and queries use **Next.js Server Actions** — no separate API routes (except the R2 presigned URL endpoint). Benefits:

- End-to-end TypeScript — function signatures propagate to client
- No fetch boilerplate or manual error handling at the network layer
- `revalidatePath` for cache invalidation after mutations
- Progressive enhancement — forms work without JavaScript

### Service Layer Pattern

```
actions.ts              ← "use server" — auth guard, Zod validation, revalidatePath
services/*.service.ts   ← Pure DB queries via Drizzle ORM (no auth, no Next.js deps)
```

Every module (branch, property, accounts) follows this split.

### Action Error Convention

Server Actions never throw to the client. All errors are caught and returned as:

```ts
{ success: false, error: string }
// or
{ success: true }
```

`toActionError()` maps `UnauthorizedError`, `ForbiddenError`, and `ZodError` to readable strings.

### Auth Guard Pattern

```ts
// In pages — redirect on Unauthorized, rethrow Forbidden to error.tsx
try {
  await requireRoles(["ADMINISTRATOR"]);
} catch (err) {
  if (err instanceof UnauthorizedError) redirect("/login");
  if (err instanceof ForbiddenError) throw err;
  throw err;
}
```

### Sidebar RSC Pattern

`AppSidebar` is a **server component** that fetches the authenticated user from the DB, then renders `AppSidebarClient` (client component) with only serializable string props. Icon components live entirely in the client shell to avoid the "Functions cannot be passed to Client Components" RSC error.

---

## User Roles

| Role | Description |
|---|---|
| `ADMINISTRATOR` | Full platform access — users, branches, all properties, reports |
| `OFFICE_ADMIN` | Branch-scoped — property approval, contracts, payments |
| `PROPERTY_OWNER` | Own listings only — create, edit, view inquiries |
| `SALES` | Client-facing — leads, tours, applications |

---

## Getting Started

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL 16
- A Cloudflare R2 bucket (for file uploads)

### 1. Install dependencies

```bash
bun install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/housing_agent

# Auth.js
AUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=housing-uploads
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Exchange rate default (VND per 1 USD)
DEFAULT_EXCHANGE_RATE_USD_VND=25000
```

### 3. Set up the database

```bash
# Push schema to database (development)
bun run db:push

# Seed initial data (admin user, sample branches)
bun run db:seed
```

### 4. Run the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Scripts

| Command | Description |
|---|---|
| `bun run db:push` | Push schema changes directly to DB (dev only) |
| `bun run db:generate` | Generate SQL migration files |
| `bun run db:migrate` | Apply migration files to DB |
| `bun run db:studio` | Open Drizzle Studio (visual DB browser) |
| `bun run db:seed` | Seed initial data |
| `bun run db:check` | Test database connection |

---

## Database Schema

| Table | Description |
|---|---|
| `users` | Platform accounts with role + branch assignment |
| `branches` | Office branches with assigned admin |
| `properties` | Listings with bilingual fields, dual pricing, status flow |
| `rental_agreements` | Lease contracts linked to properties |
| `rental_payments` | Monthly payment tracking |
| `purchase_agreements` | Sales contracts with payment method |
| `installment_plans` | Installment plan linked to purchase |
| `installment_milestones` | Per-milestone payment tracking |
| `leads` | Sales leads managed by Sales role |
| `tour_schedules` | Property viewing appointments |
| `commissions` | Sales commissions per transaction |
| `maintenance_requests` | Repair/maintenance requests on properties |
| `exchange_rates` | USD ↔ VND exchange rate history |
| `activity_logs` | Audit log of user actions |

---

## Features Built

- **Authentication** — login, register, JWT session, role-based access
- **Branch Management** — CRUD, activate/deactivate, assign Office Admin
- **Property Listings** — bilingual (EN/VI), dual-currency (USD/VND), status flow, image upload to R2
- **Account Management** — user CRUD (Admin), activate/deactivate, self-service profile
- **Dashboard** — stats overview, charts, sidebar with live user data

## Roadmap

- [ ] Rental agreements + payment tracking
- [ ] Purchase agreements + deposit compliance (LREB 2023)
- [ ] Installment plans with milestone tracking
- [ ] Leads & tour scheduling
- [ ] Commission reporting
- [ ] Multi-currency display + `next-intl` EN/VI routing
- [ ] Docker + production deployment

---

## Legal Compliance

Designed to comply with:

- **Housing Law 2023** (No. 27/2023/QH15)
- **Real Estate Business Law 2023** (No. 29/2023/QH15) — effective Jan 1, 2025
- **Land Law 2024** (No. 31/2024/QH15)

Key constraints enforced in the system:

- Deposit cap: max **5%** of contract price
- First installment cap: max **30%** of contract value (incl. deposit)
- Lease-purchase pre-handover cap: max **50%**
- Final **5%** deferred until ownership certificate (Pink Book) is issued
- All legal transactions processed in **VND**
