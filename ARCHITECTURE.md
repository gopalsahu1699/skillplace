# Architecture — Skillplace Academy

## System Overview

```
User (Browser)
    ↓
Next.js 16 (App Router + Turbopack)
    ↓
┌──────────────┬──────────────┬──────────────┐
│  Auth Layer  │  API Routes  │  Components  │
│  (Supabase)  │  (App Router)│  (React 19)  │
└──────┬───────┴──────┬───────┴──────────────┘
       │              │
       ↓              ↓
┌─────────────────────────────────────┐
│           Supabase (PostgreSQL)      │
│  + Auth + Storage + Realtime         │
└─────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────┐
│  External: Razorpay + Cloudflare     │
│  Stream                              │
└─────────────────────────────────────┘
```

## Folder Structure (Current)

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (19 endpoints)
│   ├── admin-place/       # Admin panel pages
│   ├── courses/           # Course catalog + learn
│   ├── programs/          # Training programs
│   ├── student/           # Student dashboard area
│   ├── auth/              # Login, register, callback
│   ├── (public pages)/    # Home, about, contact, etc.
│   └── layout.tsx         # Root layout
├── components/
│   ├── admin/             # Admin-specific components
│   ├── course/            # Course learning components
│   ├── courses/           # Course listing components
│   ├── home/              # Homepage sections
│   ├── layout/            # Navbar, footer, sidebars
│   ├── programs/          # Program-related components
│   ├── shared/            # EmptyState, LoadingSpinner
│   ├── ui/                # Shadcn/UI primitives
│   └── video/             # SecureVideoPlayer, Watermark
├── hooks/                 # useAuth, useVideoSecurity
├── lib/
│   ├── supabase/          # client, server, admin, middleware
│   ├── admin-api.ts       # Admin API client helper
│   ├── razorpay.ts        # Payment utilities
│   ├── cloudflare-stream.ts # Video upload
│   ├── rate-limit.ts      # Login rate limiting
│   ├── auth.ts            # Auth helpers
│   ├── certificate-*.ts   # Certificate generation
│   ├── constants.ts       # App constants
│   └── utils.ts           # Shared utilities
├── middleware.ts           # (empty)
└── types/                 # Shared TypeScript types
```

## Key Patterns

### Auth Flow
1. Client calls `supabase.auth.signInWithPassword()`
2. Server validates via `/api/session/validate`
3. `user_sessions` table tracks active sessions
4. Middleware should refresh cookies (currently empty)

### Admin API Pattern
- Client → `/api/admin?table=X&join=Y&filter=Z&value=V`
- Server uses `adminSupabase` (service role key, bypasses RLS)
- OWL updates `supabase/*.sql` for schema changes
- Admin panel fetches via `lib/admin-api.ts` helper

### Payment Flow
1. POST `/api/payments/create-order` → creates Razorpay order
2. Client opens Razorpay checkout
3. POST `/api/payments/webhook` → verifies signature, updates status
4. Creates enrollment record

### Video Security
- Cloudflare Stream for hosting
- HLS.js for playback with DRM
- Dynamic watermark (student email)
- `controlsList="nodownload"` + right-click prevention
- No signed URL implementation yet

## Database (17 tables)

See `supabase/` folder for individual table schemas.

## Environment Config

- Supabase URL: `https://weebasgxtemffakbvcfa.supabase.co`
- Auth: Supabase Auth (email/password)
- Payments: Razorpay (test mode)
- Video: Cloudflare Stream
- Storage: Supabase Storage
