# Critical Infrastructure Fixes — Task Plan for OpenCode

## Context
Skillplace Academy Next.js 16 project at `D:\web software developement\skillplaceacademy\skillplace`
(Junction: `C:\auto_skillplace\skillplace`)

Multiple files reference database tables/columns that DON'T EXIST, causing crashes.

## Task 1: Fix payments/create-order — `purchases` → `payments`

**File:** `src/app/api/payments/create-order/route.ts`

**Line 74:** Change `adminSupabase.from('purchases')` → `adminSupabase.from('payments')`
**Line 74-81:** Add `program_id: null` to the insert (new column in payments table)
**Line 36:** Change `.eq('course_id', courseId)` → keep as-is (course enrollment path)

Current insert:
```typescript
await adminSupabase.from('purchases').insert({
  user_id: userId,
  course_id: courseId,
  amount,
  currency: 'INR',
  razorpay_order_id: order.id,
  status: 'pending',
})
```

Change to:
```typescript
await adminSupabase.from('payments').insert({
  user_id: userId,
  course_id: courseId,
  program_id: null,
  amount,
  currency: 'INR',
  razorpay_order_id: order.id,
  status: 'pending',
})
```

---

## Task 2: Fix payments/verify — `purchases` → `payments`

**File:** `src/app/api/payments/verify/route.ts`

**Line 40:** Change `.from('purchases')` → `.from('payments')`
**Line 51:** Change `.from('purchases')` → `.from('payments')`
**Line 66-67:** The enrollment insert uses `course_id` — this is for individual course purchase flow, which is OK. But the enrollment table uses `program_id` not `course_id`. Change the enrollment insert to NOT include `course_id` and instead keep `program_id: null` for course-only purchases.

Current enrollment insert (line 72-80):
```typescript
const { data: newEnrollment, error: enrollError } = await adminSupabase
  .from('enrollments')
  .insert({
    user_id: paymentRecord.user_id,
    course_id: paymentRecord.course_id,
    status: 'active',
  })
```

Change to:
```typescript
const { data: newEnrollment, error: enrollError } = await adminSupabase
  .from('enrollments')
  .insert({
    user_id: paymentRecord.user_id,
    program_id: paymentRecord.program_id,
    branch_id: null,
    status: 'active',
    program_type: 'online',
  })
```

Also fix the existing enrollment check (line 62-68):
```typescript
// Change from:
.eq('user_id', paymentRecord.user_id)
.eq('course_id', paymentRecord.course_id)

// To:
.eq('user_id', paymentRecord.user_id)
.eq('program_id', paymentRecord.program_id)
```

And line 89 course slug lookup — only if course_id exists:
```typescript
const { data: course } = paymentRecord.course_id
  ? await adminSupabase.from('courses').select('slug').eq('id', paymentRecord.course_id).single()
  : { data: null }

const redirectUrl = course?.slug 
  ? `/courses/${course.slug}/learn` 
  : `/programs`
```

---

## Task 3: Fix payments/webhook — `purchases` → `payments`

**File:** `src/app/api/payments/webhook/route.ts`

**Line 23:** Change `.from('purchases')` → `.from('payments')`
**Line 31:** Change `.from('purchases')` → `.from('payments')`
**Lines 40-54:** Fix enrollment insert to use `program_id` instead of `course_id`:

Current:
```typescript
const { data: existingEnrollment } = await adminSupabase
  .from('enrollments')
  .select('id')
  .eq('user_id', paymentRecord.user_id)
  .eq('course_id', paymentRecord.course_id)
  .limit(1)
  .maybeSingle()

if (!existingEnrollment) {
  await adminSupabase.from('enrollments').insert({
    user_id: paymentRecord.user_id,
    course_id: paymentRecord.course_id,
    status: 'active',
  })
}
```

Change to:
```typescript
const { data: existingEnrollment } = await adminSupabase
  .from('enrollments')
  .select('id')
  .eq('user_id', paymentRecord.user_id)
  .eq('program_id', paymentRecord.program_id)
  .limit(1)
  .maybeSingle()

if (!existingEnrollment) {
  await adminSupabase.from('enrollments').insert({
    user_id: paymentRecord.user_id,
    program_id: paymentRecord.program_id,
    branch_id: null,
    status: 'active',
    program_type: 'online',
  })
}
```

---

## Task 4: Fix api/auth/login — remove `user_activity` insert

**File:** `src/app/api/auth/login/route.ts`

**Lines 41-46:** The `user_activity` table does NOT exist in the database. Remove this entire block:

```typescript
    await adminSupabase.from('user_activity').insert({
      user_id: data.user.id,
      action: 'login',
      ip_address: ip,
      user_agent: userAgent,
    }).then(() => {}, () => {})
```

Delete these 6 lines entirely.

---

## Task 5: Fix client.ts — remove hardcoded URL and key

**File:** `src/lib/supabase/client.ts`

**Lines 3-4:** Remove hardcoded URL and key fallback.

Current:
```typescript
const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbG...qD48'
```

Change to:
```typescript
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '')

if (!supabaseUrl || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Task 6: Fix admin.ts — proper error instead of null as any

**File:** `src/lib/supabase/admin.ts`

Current (lines 16-18):
```typescript
export const adminSupabase: SupabaseClient = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey)
  : (null as any)
```

Change to:
```typescript
export const adminSupabase: SupabaseClient = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey)
  : createClient('https://placeholder.supabase.co', 'placeholder', { auth: { autoRefreshToken: false, persistSession: false } })
```

This prevents silent null crashes. Client won't work until env vars are set, but won't crash with "cannot read properties of null".

---

## Verification
After all changes:
1. `npx tsc --noEmit` must pass with 0 errors
2. `npm run build` must pass

## NO ERRORS ALLOWED
