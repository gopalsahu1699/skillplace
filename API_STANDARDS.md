# API Standards — Skillplace Academy

## Route Structure

```
src/app/api/
├── auth/
│   └── login/route.ts          # POST - User login
├── admin/
│   └── route.ts                # GET/POST - Admin CRUD proxy
├── batches/
│   ├── route.ts                # GET list, POST create
│   └── [batchId]/students/route.ts
├── certificates/
│   ├── route.ts                # GET list
│   ├── bulk/route.ts           # POST bulk issue
│   └── [id]/route.ts           # GET single
├── coupons/
│   └── validate/route.ts       # POST validate coupon
├── payments/
│   ├── create-order/route.ts   # POST create Razorpay order
│   ├── verify/route.ts         # POST verify payment
│   └── webhook/route.ts        # POST Razorpay webhook
├── programs/
│   ├── create-order/route.ts   # POST create program order
│   ├── enroll/route.ts        # POST enroll student
│   └── verify-payment/route.ts # POST verify program payment
├── session/
│   ├── validate/route.ts       # GET validate current session
│   └── auto-revoke/route.ts    # POST revoke expired sessions
├── students/
│   └── route.ts                # GET student list
├── video/
│   ├── upload/route.ts         # POST upload video
│   └── [videoId]/route.ts      # GET video info
└── cron/
    └── process-scheduled-notifications/route.ts
```

## Response Format

### Success
```json
{
  "data": [...],
  "success": true
}
```

### Error
```json
{
  "error": "Human-readable message",
  "code": "INVALID_SIGNATURE"
}
```

### List with pagination
```json
{
  "data": [...],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, DELETE) |
| 201 | Created (POST) |
| 400 | Bad request / validation error |
| 401 | Unauthorized |
| 403 | Forbidden (not admin) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 413 | Payload too large |
| 429 | Rate limited |
| 500 | Server error |

## Authentication Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // 1. Verify auth header or cookie
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. For admin routes, verify admin role
  const token = authHeader.replace('Bearer ', '')
  const { data: { user } } = await adminSupabase.auth.getUser(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // 3. Check admin role
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 4. Process request
  // ...
}
```

## Validation Pattern (Zod)

```typescript
import { z } from 'zod'

const createOrderSchema = z.object({
  programId: z.string().uuid(),
  couponCode: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json()
  const result = createOrderSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: result.error.flatten() },
      { status: 400 }
    )
  }

  const { programId, couponCode } = result.data
  // ...
}
```

## Rate Limiting Pattern

```typescript
import { checkRateLimitDB } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  const rateCheck = await checkRateLimitDB(ip, 10, 60 * 1000) // 10 req/min

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfter) } }
    )
  }
  // ...
}
```

## Webhook Verification Pattern

```typescript
import { verifyWebhookSignature } from '@/lib/razorpay'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''

  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(body)
  // Process event...
}
```

## Admin API Proxy Pattern

```typescript
// src/app/api/admin/route.ts
// Client calls: /api/admin?table=programs&join=*,program_courses(courses(title))&filter=branch_id&value=xxx

const ALLOWED_TABLES = [
  'profiles', 'courses', 'modules', 'lessons', 'enrollments',
  'employees', 'branches', 'coupons', 'training_programs',
  'program_courses', 'certificates', 'leads', 'testimonials',
  'payments', 'user_sessions', 'notifications'
]

export async function GET(request: NextRequest) {
  // 1. Auth check (admin only)
  // 2. Parse query params
  // 3. Build query with joins/filters
  // 4. Return data
}
```
