# Fix Build Error: next/headers in Client Components

## Problem
`src/lib/supabase/client.ts` imports `cookies` from `next/headers`, but this file is imported by client components (Footer, Navbar, etc.). The `next/headers` module is only available in Server Components.

## Fix

### Step 1: Update `src/lib/supabase/client.ts`

Remove the `next/headers` import and the `createSupabaseServerClient` function. This file should only export the client-side Supabase client:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

### Step 2: Create `src/lib/supabase/server.ts` (NEW)

Create a SEPARATE file for the server-only client that uses cookies:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Ignore in server components
        }
      },
    },
  })
}
```

### Step 3: Update `src/app/courses/[slug]/learn/page.tsx`

Change import from `@/lib/supabase/client` to `@/lib/supabase/server`:

```diff
-import { createSupabaseServerClient } from '@/lib/supabase/client'
+import { createSupabaseServerClient } from '@/lib/supabase/server'
```

### Step 4: Update `src/app/courses/[slug]/page.tsx`

Change import from `@/lib/supabase/client` to `@/lib/supabase/server`:

```diff
-import { createSupabaseServerClient } from '@/lib/supabase/client'
+import { createSupabaseServerClient } from '@/lib/supabase/server'
```

### Step 5: Delete `src/lib/supabase/middleware.ts` if it exists

This file is no longer needed since `server.ts` handles it.

## DO NOT
- Do NOT run git push
- Do NOT import from `next/headers` in any file that's used by client components
- Do NOT add `next/headers` to `client.ts`

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Run `npm run build` — should succeed
