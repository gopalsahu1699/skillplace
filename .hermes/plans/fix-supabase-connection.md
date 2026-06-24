# Fix Supabase Connection Errors

## Problem
Two errors in the application:
1. Server components: `Error fetching course: {}`, `Error fetching categories: {}` — Supabase REST API returns empty error
2. Login page: `TypeError: Failed to fetch` — Auth request can't reach Supabase

## Root Cause
The Supabase client may not properly read env vars in Next.js 16 server components during development. Also, the URL format might be wrong.

## Fix Steps

### Step 1: Fix `src/lib/supabase/client.ts`

Hardcode the correct values directly to eliminate env var issues:

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

### Step 2: Fix `src/lib/supabase/admin.ts`

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const adminSupabase: SupabaseClient = createClient(supabaseUrl, serviceKey)
```

Remove the `server.ts` file — it's no longer needed since adminSupabase is now inline.

### Step 3: Fix `src/lib/supabase/queries.ts`

No changes needed if adminSupabase is properly configured.

### Step 4: Fix `src/lib/supabase/middleware.ts` (create if not exists)

For Next.js 16, we need a proper SSR client. Create this file:

```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    'https://weebasgxtemffakbvcfa.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
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
    }
  )
}
```

### Step 5: Fix `src/middleware.ts`

Update to use the hardcoded URL:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    'https://weebasgxtemffakbvcfa.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin-place')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirectedFrom=' + request.nextUrl.pathname, request.url))
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || (profile.role !== 'admin' && profile.role !== 'employee')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect student routes
  if (request.nextUrl.pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirectedFrom=' + request.nextUrl.pathname, request.url))
    }
  }

  // Redirect logged-in users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

## DO NOT
- Do NOT run git push
- Do NOT change anything else
- Do NOT add dependencies

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- All Supabase fetches should work
- Login should work
