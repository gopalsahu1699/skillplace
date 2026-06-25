# Fix Admin Pages Stuck on Loading Spinner

## Issue
All admin-place pages (courses, employees, etc.) are stuck on the loading spinner. The admin layout's `checkAuth()` function never resolves — `supabase.auth.getUser()` returns null or hangs.

## Root Cause Analysis
The admin layout (`src/app/admin-place/layout.tsx`) checks auth via the anon Supabase client:
1. `supabase.auth.getUser()` — returns the authenticated user
2. If user exists, query `profiles` table for role
3. If role is 'admin', set `adminUser`
4. If no user or not admin, show "Admin Access Required" card

The page is stuck on the **loading spinner** (not the lock screen), which means:
- `checkAuth()` is running but never completing, OR
- `getUser()` returns null but `loading` is stuck at true

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## Tasks

### 1. Add timeout to admin layout auth check
In `src/app/admin-place/layout.tsx`, add a timeout (5 seconds) to the auth check. If it takes longer, show "Session check timed out. Please refresh." instead of the infinite spinner.

### 2. Fix the auth flow
The issue is likely that `supabase.auth.getUser()` returns null because:
- The session cookie/localStorage was cleared
- The user needs to log in again

Add better error handling:
- If `getUser()` returns null immediately, show a "Not signed in" message with a link to `/admin-login`
- Don't stay on spinner forever

### 3. Add error state to admin layout
Add an `error` state. If auth check fails or times out, show the error message instead of the spinner.

### 4. Ensure the loading spinner has a timeout
```ts
useEffect(() => {
  const timer = setTimeout(() => {
    if (loading) {
      setError('Session check timed out. Please refresh the page.')
    }
  }, 5000)
  return () => clearTimeout(timer)
}, [loading])
```

### 5. Also check the `detectSessionInUrl` setting
If the login flow uses `detectSessionInUrl: true`, it might be trying to parse the URL fragment on every page load, which can cause delays. This is fine for the login flow but might interfere on admin pages.

## DO NOT
- Do NOT git push
- Do NOT change the auth logic (still require admin role)
- Do NOT expose the service role key
- Do NOT modify the API route

## After Completion
- Run `npx tsc --noEmit` to verify no type errors
- Test: Open `/admin-place` — should show either the content (if logged in) or a clear error message (if not)
