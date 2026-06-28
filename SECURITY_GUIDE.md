# Security Guide — Skillplace Academy

## Authentication

### Client-Side
```typescript
// Use the shared supabase client from lib/supabase/client.ts
import { supabase } from '@/lib/supabase/client'

const { data, error } = await supabase.auth.signInWithPassword({ email, password })
```

### Server-Side
```typescript
// Use adminSupabase for auth operations that bypass RLS
import { adminSupabase } from '@/lib/supabase/admin'

const { data: { user } } = await adminSupabase.auth.getUser(token)
```

### Environment Keys
```typescript
// NEVER import service role key into client code
// GOOD: server.ts uses it, admin.ts exports it
// BAD: client.ts importing from admin.ts

// Supabase URL must NOT include /rest/v1/ suffix for SDK
const url = rawUrl.replace(/\/rest\/v1\/?$/, '')
```

## Authorization

### Admin Check Pattern
```typescript
async function isAdmin(userId: string): Promise<boolean> {
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return true

  // Fallback: check employees table by email
  const { data: { user } } = await adminSupabase.auth.getUser(token || '')
  const { data: employee } = await adminSupabase
    .from('employees')
    .select('role')
    .eq('email', user?.email || '')
    .single()

  return employee?.role === 'admin'
}
```

### Session Validation
```typescript
// src/app/api/session/validate/route.ts
export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ valid: false })

  const { data: session } = await adminSupabase
    .from('user_sessions')
    .select('*, profiles(role, email)')
    .eq('session_token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) return NextResponse.json({ valid: false })
  return NextResponse.json({ valid: true, user: session.profiles })
}
```

## API Security

### Required for ALL API Routes
1. Auth check (except login/register/webhook)
2. Rate limiting (for sensitive endpoints)
3. Input validation (zod)
4. Error handling (try/catch)

### Webhook Security
- Always verify signature before processing
- Log all webhook attempts (success + failure)
- Reject non-POST requests

### Payment Security
- Never trust client-side amount — verify server-side
- Always verify Razorpay signature in webhook
- Use server-side price calculation
- Idempotency: check for duplicate webhook events

## Input Validation

```typescript
import { z } from 'zod'

// Validate ALL user input
const enrollmentSchema = z.object({
  programId: z.string().uuid(),
  couponCode: z.string().min(4).max(20).optional(),
})

// Type inference
type EnrollmentInput = z.infer<typeof enrollmentSchema>
```

## SQL Injection Prevention

```typescript
// NEVER: string interpolation
// BAD: `.query(`SELECT * FROM users WHERE id = '${id}'`)

// ALWAYS: parameterized queries via Supabase
// GOOD: `.from('users').select('*').eq('id', id)`

// For complex queries, use RPC
// GOOD: `.rpc('get_user_courses', { user_id: userId })`
```

## Secure Headers

```typescript
// middleware.ts or next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'" },
]
```

## File Upload Security

```typescript
// Validate file type
const allowedTypes = ['video/mp4', 'video/webm']
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

// Validate file size
const MAX_SIZE = 500 * 1024 * 1024 // 500MB
if (file.size > MAX_SIZE) {
  return NextResponse.json({ error: 'Too large' }, { status: 413 })
}

// Validate file name (no path traversal)
const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
```

## Row Level Security

All tables with user data must have RLS:
```sql
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all
CREATE POLICY "Admins can view all sessions" ON public.user_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

## Video Security

```typescript
// 1. Use Cloudflare Stream for hosting
// 2. HLS.js for DRM playback
// 3. Dynamic watermark with student identity
// 4. Short-lived signed tokens for playback auth
// 5. controlsList="nodownload" + prevent context menu
// 6. No direct video URL exposure in client
```

## Secrets Management

```typescript
// .env.local (never commit)
// NEXT_PUBLIC_SUPABASE_URL=...
// NEXT_PUBLIC_SUPABASE_ANON_KEY=...
// SUPABASE_SERVICE_ROLE_KEY=...
// RAZORPAY_KEY_ID=...
// RAZORPAY_KEY_SECRET=...
// RAZORPAY_WEBHOOK_SECRET=...

// Access (server-side only)
process.env.SUPABASE_SERVICE_ROLE_KEY

// Access (client-safe only)
process.env.NEXT_PUBLIC_SUPABASE_URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// NEVER expose service key in browser bundle
// NEVER log secrets to console or error trackers
```
