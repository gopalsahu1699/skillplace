# Fix Courses Page + Login/Register/Contact + Admin Panel

## Problem
1. Courses page has no filtering by category
2. No section to show purchased/enrolled courses for logged-in students
3. Login page is just a UI shell — no actual authentication
4. Register page is just a UI shell — no actual registration
5. Contact form doesn't save to Supabase

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS

## Supabase Info
- Client: `src/lib/supabase/client.ts` (anon key, singleton)
- Server: `src/lib/supabase/server.ts` — `createAdminSupabaseClient()`
- Admin helper: `src/lib/supabase/admin.ts` — `adminSupabase`
- URL fix applied: strip `/rest/v1/` from URL

## Tasks

### 1. Courses Page — `src/app/courses/page.tsx`

Rewrite with full functionality:

**Server Component (data fetching):**
- Fetch categories from Supabase
- Fetch courses with category data (join)
- Pass as props to client component

**Client Component (interactivity):**
- Search bar with real-time filtering
- Category filter buttons (All + each category from Supabase)
- Show filtered courses grid
- "My Enrolled Courses" section:
  - Use `supabase.auth.getUser()` to check login status
  - If logged in, fetch enrollments with course data
  - Show enrolled courses with progress bar and status
  - If not logged in, show "Log in to see your enrolled courses" prompt

### 2. Login Page — `src/app/login/page.tsx`

Implement real authentication:
- Email/password login using `supabase.auth.signInWithPassword()`
- Google OAuth login using `supabase.auth.signInWithOAuth({ provider: 'google' })`
- GitHub OAuth login using `supabase.auth.signInWithOAuth({ provider: 'github' })`
- Redirect to home page on successful login
- Show error messages for invalid credentials
- Show "Forgot password" link that triggers `supabase.auth.resetPasswordForEmail()`

### 3. Register Page — `src/app/register/page.tsx`

Implement real registration:
- Full name, email, phone, password fields
- Use `supabase.auth.signUp()` with metadata (full_name, phone)
- After signup, create a profile in `profiles` table
- Show success message and redirect to login
- Show error messages for existing email, weak password, etc.

### 4. Contact Page — `src/app/contact/page.tsx`

Implement form submission:
- On submit, insert form data into `leads` table in Supabase
- Show success message after submission
- Show error message on failure

### 5. Course Detail Page — `src/app/courses/[slug]/page.tsx`

Improve the existing page:
- Fetch course with modules and lessons from Supabase
- Show "Enroll Now" button if user is logged in and not enrolled
- Show "Continue Learning" button if user is enrolled
- Show enrollment count for the course

### 6. Admin Courses Page — `src/app/admin-place/courses/page.tsx`

Ensure full CRUD works:
- Add Course: dialog with form (title, category, description, price, discount_price, duration, level)
- Edit Course: same dialog pre-filled with existing data
- Delete Course: confirmation dialog, then delete
- Search/filter functionality

### 7. Admin Layout — `src/app/admin-place/layout.tsx`

Add authentication check:
- Verify user is logged in and has role='admin'
- If not admin, redirect to login page
- Show current admin user info

### 8. Purchased Courses Component — `src/components/courses/PurchasedCourses.tsx`

Client component for showing enrolled courses:
- Check auth status
- Fetch enrollments with course data
- Show progress bars
- Show "Continue Learning" buttons
- Show "Browse Courses" CTA for non-logged-in users

## Design Requirements
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use existing UI components from `src/components/ui/`
- Use lucide-react icons
- Responsive design
- Form validation with error messages
- Loading states for auth operations

## DO NOT
- Do NOT run git push
- Do NOT add new dependencies
- Do NOT modify database schema
- Do NOT change Supabase client files (they're already fixed)

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- Login should work with email/password and OAuth
- Register should create auth user and profile
- Contact form should save to leads table
- Courses page should filter by category and search
- Enrolled courses should show for logged-in users
