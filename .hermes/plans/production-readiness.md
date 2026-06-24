# Production Readiness — Fix All Issues & Build Successfully

## Goal
Make this a production-grade SaaS application. Fix ALL TypeScript errors, ensure the build passes, fix login/register flow, secure Supabase RLS, and ensure every page renders without console errors.

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text

## Current Known Issues
1. TypeScript errors from node_modules type definitions (not our code, but blocks build)
2. Login not working (signInWithPassword succeeds but session not persisting)
3. Middleware.ts has TS errors due to Next.js 16 .mts file inclusion
4. Need production-grade RLS policies (currently too permissive)
5. Build hasn't been verified

## Tasks (Execute in Order)

### Step 1: Fix TypeScript Configuration

The `tsconfig.json` includes `"**/*.mts"` which causes node_modules type errors. Fix this:

1. Update `tsconfig.json` to exclude node_modules from type checking properly
2. Add `"skipLibCheck": true` (already there, keep it)
3. The issue is the `.mts` extension include — change `"**/*.mts"` to only include your own files, or remove it since we don't have `.mts` files outside node_modules
4. Also add `"types": ["node"]` to avoid pulling in all @types

### Step 2: Fix Login Flow

The login page uses `supabase.auth.signInWithPassword()` but the session isn't persisting. Fix:

1. Update `src/lib/supabase/client.ts` to use proper cookie-based auth for Next.js:
   - Add `auth` config with `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: true`
   - Use `globalThis` for storage fallback in SSR

2. Update `src/app/login/page.tsx`:
   - After successful login, use `window.location.href = '/'` instead of `router.push()`
   - This ensures cookies are properly set before navigation

3. Create `src/lib/supabase/middleware.ts` (NOT `.ts` — use `.ts` but rename the file):
   - Actually, rename to `src/middleware.ts` (Next.js convention)
   - Use `createServerClient` from `@supabase/ssr`
   - Refresh session cookies on every request
   - Protect `/admin-place` and `/student` routes

4. Delete the old `src/middleware.ts` if it has errors and recreate it properly

### Step 3: Fix Supabase Client for SSR

Update `src/lib/supabase/client.ts`:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

### Step 4: Create Proper Middleware

Create `src/middleware.ts` (if not exists, or fix existing):

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, ''),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    // Check if user is admin
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
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

### Step 5: Secure Supabase RLS for Production

Current RLS is too permissive (anyone can insert/update). Create a new migration:

1. Create `scripts/rls-production.sql` with proper policies:

```sql
-- Drop existing overly-permissive policies
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can insert enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can update enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Anyone can view payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Anyone can insert certificates" ON public.certificates;
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view projects" ON public.student_projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.student_projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.student_projects;

-- PROFILES: Users can only manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- COURSES: Anyone can read active courses, only admins can manage
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CATEGORIES: Anyone can read active categories
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TESTIMONIALS: Anyone can read active testimonials
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- LEADS: Anyone can submit leads, admins can read/update
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ENROLLMENTS: Users can view/insert own enrollments
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PAYMENTS: Users can view own payments, insert their own
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CERTIFICATES: Users can view own certificates
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NOTIFICATIONS: Users can view/update own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- STUDENT PROJECTS: Anyone can view approved, users manage own
CREATE POLICY "Anyone can view approved projects" ON public.student_projects FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own projects" ON public.student_projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all projects" ON public.student_projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
```

2. Push this migration to Supabase using the push script

### Step 6: Fix Registration to Work with New RLS

With the new RLS policies, the register page needs to:
1. Create auth user via `supabase.auth.signUp()`
2. The profile insert needs to use `auth.uid() = id` — which means the user must be logged in first
3. After signUp, the user IS logged in, so the profile insert should work
4. But we also need to handle the case where email confirmation is required

Update `src/app/register/page.tsx`:
- After signUp, if user is created, insert profile with the user's ID
- If email confirmation is required, show a message telling user to check email
- Handle the case where signUp succeeds but profile insert fails

### Step 7: Verify Build

Run `npm run build` and fix any compilation errors that appear.

## DO NOT
- Do NOT run git push
- Do NOT add new dependencies
- Do NOT change UI design (it's already good)
- Do NOT modify the seed script

## After Completion
- `npx tsc --noEmit` passes with zero errors from our code
- `npm run build` completes successfully
- Login/register flow works end-to-end
- All pages render without console errors
- RLS is production-secure
