# Fix: Store & Read Auth Session from Supabase (Not Cookies)

## Problem
After login, the middleware can't read the auth session because:
1. Client-side `signInWithPassword` stores session in `localStorage`
2. Middleware `createServerClient` reads from `cookies`
3. These two storage mechanisms are NOT in sync → redirect loop to `/login`

## Solution
Use Supabase's server-side session management. After login, store the session in Supabase (via the REST API), and in the middleware, read the session directly from Supabase using the access token.

## Key Insight
Instead of relying on cookies, we'll:
1. After login: store the access token in a cookie manually
2. In middleware: read the access token from the cookie and pass it to Supabase `getUser()`
3. In client components: continue using `supabase.auth.getUser()` (reads from localStorage)

## Tasks

### Step 1: Update `src/app/login/page.tsx`

After successful login, store the access token in a cookie:

```ts
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError('')
  setLoading(true)

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    setError(authError.message)
    setLoading(false)
    return
  }

  // Store access token in cookie for middleware to read
  if (data.session) {
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
  }

  // Check user role and redirect
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin' || profile?.role === 'employee') {
      window.location.href = '/admin-place'
    } else {
      window.location.href = '/'
    }
  } else {
    window.location.href = '/'
  }
}
```

### Step 2: Update `src/middleware.ts`

Read the access token from the cookie and validate it with Supabase:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = 'https://weebasgxtemffakbvcfa.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Read access token from cookie
  const accessToken = request.cookies.get('sb-access-token')?.value

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // If we have an access token, set the session manually
  let user = null
  if (accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken)
    if (!error && data.user) {
      user = data.user
    }
  }

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

### Step 3: Update `src/app/admin-login/page.tsx`

Same — store token in cookie after login:

```ts
// After successful admin login
if (data.session) {
  document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}
window.location.href = '/admin-place'
```

### Step 4: Update `src/app/logout/route.ts` (create if not exists)

Clear the cookie on logout:

```ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('sb-access-token')
  response.cookies.delete('sb-refresh-token')
  return response
}
```

### Step 5: Update `src/app/admin-place/layout.tsx`

Also read from cookie as fallback:

```ts
useEffect(() => {
  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Try reading from cookie
      const token = document.cookie.split(';').find(c => c.trim().startsWith('sb-access-token='))
      if (!token) {
        setLoading(false)
        return
      }
    }
    // ... rest of auth check
  }
  checkAuth()
}, [])
```

### Step 6: Update `src/app/courses/[slug]/learn/CourseLearnClient.tsx`

No changes needed — it already uses `supabase.auth.getUser()` which reads from localStorage.

## DO NOT
- Do NOT run git push
- Do NOT use `next/headers` in client components
- Do NOT change the Supabase client configuration

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Test: Login as admin → Redirect to `/admin-place` → Page loads correctly
- Test: Login as student → Redirect to `/` → Click "Continue Learning" → Works
- Test: Logout → Clear cookies → Redirect to login when accessing protected routes
