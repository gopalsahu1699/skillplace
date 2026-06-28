# Project Rules — Skillplace Academy

## Core Rules

1. **OWL never writes code** — only analysis, debugging, infra, architecture
2. **ALL coding goes to OpenCode** — strict no-coding-OWL rule
3. **DB changes = per-table .sql files** — no migration.sql, no combined files
4. **Never create combined/migration SQL files** — each table gets its own .sql file in `supabase/`
5. **No @/components/ui/dialog** — use div-based modals (Turbopack key-stripping bug)
6. **Test E2E before reporting** — verify build+sructure before telling user "done"
7. **Frustration protocol: stop repeating errors**

## Supabase URL Handling

- Strip `/rest/v1/` suffix from URL before passing to `createClient()`
- `https://weebasgxtemffakbvcfa.supabase.co` (no suffix) for SDK

## Environment Variables

Required env vars:
```
NEXT_PUBLIC_SUPABASE_URL=https://weebasgxtemffakbvcfa.supabase.co/rest/v1/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_ADMIN_EMAIL=admin@skillplace.com
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
CLOUDFLARE_STREAM_DOMAIN=...
CRON_SECRET=...
NEXT_PUBLIC_CRON_SECRET=...
```

## Test Accounts

| Role | Email | Password | Auth ID |
|------|-------|----------|---------|
| Admin | admin@skillplace.com | admin123 | ee33b38d-da74-4f2f-8794-b2c3f6f82396 |
| Student | john@gmail.com | John@321 | 6204b711-4a5a-4db5-9502-6a0c37043a98 |

## Tech Stack

- Next.js 16 + Turbopack
- React 19
- Supabase (PostgreSQL + Storage + Auth)
- Razorpay (payments)
- Cloudflare Stream (video)
- Tailwind CSS 4 + Shadcn/UI
- Zod (validation)
- HLS.js (secure video)
