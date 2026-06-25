## Task: Remove /admin-login page — consolidate login into /login

### Overview
The `/login` page already handles both student and admin login (it checks role and redirects admins to `/admin-place`). The `/admin-login` page is a duplicate that should be removed.

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Real path: `D:\web software developement\skillplaceacademy\skillplace`

### Steps

1. **Delete the `/admin-login` page**:
   - Delete the file: `src/app/admin-login/page.tsx`
   - Remove the directory if empty after deletion

2. **Update `/login` page** (`src/app/login/page.tsx`):
   - The page already handles admin login correctly (lines 52-56)
   - No functional changes needed
   - Just verify the redirect logic still works: admin/employee → `/admin-place`, student → `/`

3. **Check for any links pointing to `/admin-login`**:
   - Search for `admin-login` across the codebase (excluding node_modules, .next)
   - Update any references to point to `/login` instead

4. **Check if there's a separate admin login API route or middleware** that references `admin-login`:
   - Search for `admin-login` in API routes, middleware, etc.

### DO NOT
- Do NOT modify the `/login` page's core auth logic
- Do NOT remove the admin-place layout or its auth check
- Do NOT break the redirect from login → admin-place for admin users
- Do NOT git push

### After Completion
1. Run `npx tsc --noEmit` and fix ALL type errors
2. Verify build: `npm run build` (optional)
3. Do NOT git push
