## Task: Implement Supabase Session System (store/fetch sessions in `user_sessions` table)

### Overview
Currently the app uses Supabase Auth with its default session storage (localStorage/cookies managed by the SDK). You need to implement a custom session system that stores sessions in the `user_sessions` Supabase table and fetches/validates sessions from Supabase throughout the application.

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Real path: `D:\web software developement\skillplaceacademy\skillplace`

### Database Schema (user_sessions table — already created)
```sql
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  refresh_token text,
  access_token text,
  ip_address inet,
  user_agent text,
  device_type text CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser text,
  os text,
  login_method text DEFAULT 'email' CHECK (login_method IN ('email', 'google', 'github', 'admin')),
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT NOW(),
  last_active_at timestamptz DEFAULT NOW(),
  logout_at timestamptz
)
```

### Files to Modify

#### 1. `src/lib/supabase/client.ts` — Add session management functions

Add these functions to the existing client file:

```ts
// Session management — store and validate sessions in Supabase

function generateToken(): string {
  // Use crypto.randomUUID() — built into Node.js 19+ and all modern browsers
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function createSession(userId: string, userAgent?: string, ip?: string | null) {
  // Generate tokens
  const sessionToken = generateToken()
  const accessToken = generateToken()
  const refreshToken = generateToken()
  
  // Parse user agent info
  const ua = (userAgent || 'unknown').toLowerCase()
  let deviceType = 'unknown'
  if (/mobile|android|iphone/.test(ua)) deviceType = 'mobile'
  else if (/tablet|ipad/.test(ua)) deviceType = 'tablet'
  else if (/windows|mac|linux/.test(ua)) deviceType = 'desktop'
  
  // Detect browser
  let browser = 'unknown'
  if (/chrome/.test(ua)) browser = 'chrome'
  else if (/firefox/.test(ua)) browser = 'firefox'
  else if (/safari/.test(ua)) browser = 'safari'
  else if (/edge/.test(ua)) browser = 'edge'
  
  // Detect OS
  let os = 'unknown'
  if (/windows/.test(ua)) os = 'windows'
  else if (/mac/.test(ua)) os = 'macos'
  else if (/linux/.test(ua)) os = 'linux'
  else if (/android/.test(ua)) os = 'android'
  else if (/ios|iphone|ipad/.test(ua)) os = 'ios'

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const { data, error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    session_token: sessionToken,
    access_token: accessToken,
    refresh_token: refreshToken,
    ip_address: ip,
    user_agent: userAgent,
    device_type: deviceType,
    browser,
    os,
    login_method: 'email',
    expires_at: expiresAt.toISOString(),
  }).select('session_token').single()

  if (error) throw error
  return { sessionToken, accessToken, refreshToken, expiresAt }
}

export async function validateSession(sessionToken: string) {
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*,profiles(*)')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !data) return null
  return data
}

export async function updateSessionActivity(sessionToken: string) {
  const { error } = await supabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('session_token', sessionToken)
  return !error
}

export async function destroySession(sessionToken: string) {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, logout_at: new Date().toISOString() })
    .eq('session_token', sessionToken)
  return !error
}

export async function destroyAllUserSessions(userId: string) {
  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, logout_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_active', true)
  return !error
}
```

#### 2. `src/lib/auth.ts` — Integrate session creation into sign-in/sign-up

Modify the existing auth functions to also create a session record in Supabase after successful authentication:

- In `signUp()`: After creating the profile, call `createSession(data.user.id)`
- In `signIn()`: After successful `signInWithPassword`, call `createSession(data.user.id)` and store the session token in a cookie named `sp_session`
- In `signOut()`: Also destroy the session record by `sp_session` cookie, then call `supabase.auth.signOut()`
- Add a new `getCurrentSession()` function that reads the `sp_session` cookie and validates it against Supabase

```ts
import { createSession, validateSession, destroySession } from './supabase/client'
import { cookies } from 'next/headers'

// After signIn success:
const session = await createSession(data.user.id)
// Set cookie (httpOnly, secure, sameSite)
// document.cookie = `sp_session=${session.sessionToken}; path=/; max-age=604800; secure; samesite=lax`

// getCurrentSession function (for server-side):
export async function getCurrentSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sp_session')?.value
  if (!sessionToken) return null
  return await validateSession(sessionToken)
}
```

#### 3. `src/hooks/useAuth.ts` — Update to use Supabase-backed sessions

The hook should:
- On mount, check for `sp_session` cookie
- If cookie exists, validate it against Supabase `user_sessions` table
- If invalid, clear the cookie
- Still listen to `onAuthStateChange` for Supabase auth events
- On sign out, destroy the session in Supabase AND clear the cookie

#### 4. `src/app/admin-login/page.tsx` — Store session in Supabase after login

After successful admin login (line 52), call `createSession(data.user.id)` and set the `sp_session` cookie.

#### 5. `src/app/admin-place/layout.tsx` — Validate session from Supabase

In the `checkAuth()` function, after getting the user from `supabase.auth.getUser()`:
- Read the `sp_session` cookie
- Validate it against Supabase `user_sessions` table
- If session is invalid or expired, redirect to login

### Key Implementation Details

1. **Cookie name**: `sp_session`
2. **Cookie options**: `path=/`, `max-age=604800` (7 days), `secure`, `samesite=lax`
3. **Session expiry**: 7 days (match Supabase token expiry)
4. **The `profiles` join**: When validating session, use `.select('*,profiles(*)')` to get user profile data in one query
5. **Client vs Server**: 
   - Client components: read cookie via `document.cookie`
   - Server components/API routes: read cookie via `cookies()` from `next/headers`
6. **Device detection**: Simple regex-based parsing of the User-Agent string (no external library needed)
7. **IP address**: Use `x-forwarded-for` header (may be null in dev)

### DO NOT
- Do NOT remove or break the existing Supabase Auth system (signIn, signUp, signOut still work)
- Do NOT change the `user_sessions` table schema
- Do NOT use `window` object in server-side code
- Do NOT add new npm packages (use built-in `crypto.randomUUID()` or simple UUID generation)
- Do NOT break existing auth flows — this is additive
- Do NOT modify `src/lib/supabase/admin.ts` or `src/lib/supabase/server.ts`
- Do NOT git push

### After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify the build compiles: `npm run build` (optional but recommended)
3. Do NOT git push
