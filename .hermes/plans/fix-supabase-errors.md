# Fix Supabase Fetch Errors — Server Component Issue

## Problem
The server components are logging `Error fetching categories: {}` — Supabase requests are failing silently with empty error objects. This means the Supabase client isn't connecting properly at runtime.

## Root Cause Analysis
The `supabase/server.ts` uses hardcoded env var references (`process.env.NEXT_PUBLIC_SUPABASE_URL!`) but the `.env.local` file has `NEXT_PUBLIC_SUPABASE_URL=https://weebasgxtemffakbvcfa.supabase.co/rest/v1/` — the URL already includes `/rest/v1/` which the client adds again, causing connection issues.

Also, the `supabase/server.ts` creates a new client on each call which may not read env vars correctly in Next.js server components.

## Tasks

### 1. Fix `src/lib/supabase/server.ts`

Rewrite to properly read env vars and strip the `/rest/v1/` suffix from URL:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

export function createAdminSupabaseClient(): SupabaseClient {
  if (adminClient) return adminClient

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  // Strip trailing /rest/v1/ if present — the client adds it automatically
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '')

  adminClient = createClient(supabaseUrl, serviceKey)
  return adminClient
}
```

### 2. Fix `src/lib/supabase/client.ts`

Same fix for the anon client — strip the `/rest/v1/` suffix.

### 3. Fix `src/lib/supabase/admin.ts`

Ensure the client is created properly with a singleton pattern.

### 4. Fix `src/lib/supabase/queries.ts`

The queries use `adminSupabase` import which should work now. But also add better logging — when error is empty, log the full error object with `JSON.stringify`.

### 5. Verify `src/app/page.tsx`

Home page server component fetches data. Add try-catch with proper error logging to see the actual Supabase error details.

### 6. Check RLS policies

The categories/courses/testimonials tables need policies that allow service role to read. The service role bypasses RLS by default, but verify the tables don't have restrictive policies that block even service role.

Write a script `scripts/check-rls.mjs` that uses the service role key to test reads:
- SELECT * FROM categories LIMIT 1
- SELECT * FROM courses LIMIT 1
- SELECT * FROM testimonials LIMIT 1
Log results.

## DO NOT
- Do NOT run git push
- Do NOT add new dependencies
- Do NOT change the database schema
- Do NOT modify any UI components — only fix the data fetching layer

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- The dev server should show data loading without `{}` errors
