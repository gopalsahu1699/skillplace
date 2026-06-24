# Fix: Admin Pages Using Wrong Supabase Client

## Problem
All admin pages import `adminSupabase` from `@/lib/supabase/admin`, but this module fails in client components because `process.env.SUPABASE_SERVICE_ROLE_KEY` is not available in the browser (it's not prefixed with `NEXT_PUBLIC_`).

The error: `supabaseKey is required` — the service role key is empty when the module loads on the client side.

## Solution
1. Create API routes that run on the server (where the service role key IS available)
2. Update all admin pages to call the API instead of using `adminSupabase` directly

## Already Done
- ✅ Created `src/app/api/admin/route.ts` — server-side API that handles GET/POST/PUT/DELETE
- ✅ Created `src/lib/admin-api.ts` — client-side helper functions to call the API

## Tasks

### Step 1: Update ALL admin pages to use `admin-api.ts` helper

For every file under `src/app/admin-place/` (except `layout.tsx`):
- Replace `import { adminSupabase } from '@/lib/supabase/admin'` with `import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'`
- Replace all `adminSupabase.from('table').insert(...)` with `await createRecord('table', ...)`
- Replace all `adminSupabase.from('table').update(...).eq('id', id)` with `await updateRecord('table', id, ...)`
- Replace all `adminSupabase.from('table').delete().eq('id', id)` with `await deleteRecord('table', id)`
- Replace all `adminSupabase.from('table').select(...)` with `await getRecords('table')`
- Replace all `.eq('filter', value)` patterns with appropriate `getRecords` filter parameters
- Replace all `.single()` patterns
- Replace all `.order(...)` patterns (fetch and sort on client side)
- Replace all `{ count: 'exact', head: true }` patterns (fetch and use `.length`)
- Replace all `await adminSupabase.from('table').update({...}).eq('test_id', id)` with `await updateRecord('table', id, {...})` using the correct ID

### Step 2: Handle special cases

For files with complex queries:
- `.eq('course_id', courseId)` → pass as filter: `getRecords('modules', 'course_id', courseId)`
- `.eq('module_id', moduleId)` → pass as filter: `getRecords('lessons', 'module_id', moduleId)`
- `.eq('test_id', testId)` → pass as filter: `getRecords('test_questions', 'test_id', testId)`
- `.select('*, categories(*)')` → just `getRecords('courses')` (fetch all and join on client)
- `.select('*, courses(title, slug)')` → just `getRecords('enrollments')`
- `.select('*, profiles(*), courses(*)')` → just `getRecords('payments')`
- `.order('created_at', { ascending: false })` → sort on client side after fetch
- `.order('order_index', { ascending: true })` → sort on client side after fetch
- `.limit(5)` → slice on client side after fetch
- `count` queries → fetch array and use `.length`

### Step 3: Update the `admin-api.ts` helper to support filters

Update `src/lib/admin-api.ts` to support the filter parameter:

```ts
export async function getRecords(table: string, filter?: string, value?: string) {
  const params = new URLSearchParams({ table })
  if (filter && value) {
    params.set('filter', filter)
    params.set('value', value)
  }
  const res = await fetch(`/api/admin?${params.toString()}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}
```

### Step 4: Update the API route to handle filters

Update `src/app/api/admin/route.ts` to properly handle filter parameters:

```ts
// In GET handler:
if (filter && value) {
  query = query.eq(filter, value)
}
if (!id && !filter) {
  // Return all records
}
```

### Step 5: Handle the admin layout

The admin layout (`src/app/admin-place/layout.tsx`) should keep using the anon client (`@/lib/supabase/client`) for auth checks since it needs to read from localStorage. No changes needed for layout.tsx.

### Step 6: Add error handling and toast notifications

For all admin pages, add try-catch around API calls:
```ts
try {
  await createRecord('table', data)
  // Show success message
} catch (err: any) {
  // Show error message
}
```

## Files to Update (14 files)
All .tsx files under `src/app/admin-place/` except `layout.tsx`

## DO NOT
- Do NOT run git push
- Do NOT modify `src/lib/supabase/admin.ts` or `src/lib/supabase/client.ts`
- Do NOT modify `src/app/api/admin/route.ts` (it's already correct)
- Do NOT change the database schema

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- All admin pages use the API route for CRUD operations
- Service role key stays on the server (not exposed to client)
- Admin can create/edit/delete courses, modules, lessons, tests, students, leads, payments, certificates
