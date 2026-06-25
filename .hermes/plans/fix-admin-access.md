## Task: Fix admin access control to support both profiles and employees tables

### Overview
The admin-place layout currently only checks `profiles.role === 'admin'` to grant access. But admin users are stored in the `employees` table with `role = 'admin'`. Need to check both tables.

Also, the layout now requires a valid `sp_session` cookie (from the new session system). If the session cookie doesn't exist, the user should be redirected to `/login` instead of seeing "Admin Access Required".

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- File to modify: `src/app/admin-place/layout.tsx`

### Current State
The `checkAuth()` function:
1. Gets user from `supabase.auth.getUser()`
2. Reads `sp_session` cookie and validates against `user_sessions` table
3. If no session or invalid → shows "Session expired" error
4. Then checks `profiles.role === 'admin'`
5. If not admin → shows "Admin Access Required"

### Required Changes

1. **If no `sp_session` cookie exists and user is authenticated**: Redirect to `/login` (to get a fresh session) instead of showing error. Add this check after reading the session cookie:

```ts
const sessionToken = getSessionCookie()
if (!sessionToken) {
  // User is authenticated but no session record — redirect to login to establish session
  router.push('/login')
  return
}
```

2. **Check employees table if profiles check fails**: After the profiles role check fails, also query the `employees` table:

```ts
// If not found in profiles, check employees table
if (profile?.role !== 'admin') {
  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (employee?.role === 'admin') {
    // Grant admin access — treat as admin
    setAdminUser({ id: user.id, email: user.email || '', full_name: user.user_metadata?.full_name || null, role: 'admin' })
    setLoading(false)
    return
  }
}
```

3. **Update the admin access required check** (the `!adminUser` block at the end): Change the message to redirect to login instead of just showing "sign in" button:

```tsx
if (!adminUser) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
            <Lock className="h-7 w-7 text-blue-600" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Admin Access Required</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            You need admin privileges to access this area
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-slate-500">
            Please sign in with an admin account to continue.
          </p>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
```

(This last part is already correct, just keep it as-is)

### DO NOT
- Do NOT remove the session validation logic
- Do NOT remove the Supabase auth check
- Do NOT change the `employees` table schema
- Do NOT git push

### After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Do NOT git push
