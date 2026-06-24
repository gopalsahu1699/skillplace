# Fix: Auto-Redirect Admin Users to Admin Panel on Login

## Problem
When an admin user logs in at `/login`, they should be automatically redirected to `/admin-place` instead of the home page. Currently, all users go to `/` after login.

## Solution
Update the login page to check the user's role after successful authentication and redirect accordingly:
- Admin users → `/admin-place`
- Employee users → `/admin-place`
- Student users → `/`

## Files to Update

### 1. `src/app/login/page.tsx`

After successful `signInWithPassword`, check the user's role from the `profiles` table:

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

  // Check user role and redirect accordingly
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

### 2. `src/app/admin-login/page.tsx`

This page should also redirect to `/admin-place` after successful admin login (already done, just verify it's there).

### 3. `src/components/courses/EnrollmentButton.tsx`

No changes needed — it already links to `/courses/${courseSlug}/learn`.

## DO NOT
- Do NOT run git push
- Do NOT change the middleware
- Do NOT modify the Supabase client files

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Test: Login as admin@skillplace.com → Should go to `/admin-place`
- Test: Login as student → Should go to `/`
