# Remove All Hardcoded Data & Connect to Supabase + Admin Panel

## Goal
Remove ALL hardcoded data from the application and connect everything to Supabase. Build a functional admin panel where admins can manage courses, categories, testimonials, and view leads/students.

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS

## Supabase Info
- Client: `src/lib/supabase/client.ts` (anon key)
- Server: `src/lib/supabase/server.ts` — `createAdminSupabaseClient()`
- Admin helper: `src/lib/supabase/admin.ts` — `adminSupabase`
- Tables: categories, courses, testimonials, leads, enrollments, payments, profiles, certificates, notifications, modules, lessons, tests, test_questions, test_attempts, lesson_progress, live_classes, student_projects

## Tasks

### 1. Home Page — `src/app/page.tsx`

Remove ALL hardcoded arrays (stats, programs, departments, whyChooseUs, targetStudents, features). Convert to a server component that fetches from Supabase:

- Stats: Count from actual data (count courses, count testimonials, use static "100%" for job assistance, "10+" for mentors)
- Programs: Hardcode the program features as static content (Online/Offline/Hybrid) — these are marketing content, not database data. Keep them as const arrays.
- Departments: Fetch from Supabase `categories` with related `courses`
- Testimonials: Fetch from Supabase `testimonials` table

Use `adminSupabase` for server-side fetching. Keep the same layout and styling.

### 2. Courses Page — `src/app/courses/page.tsx`

Already connected to Supabase. Remove the unused `categories` variable and the CourseFilter import. Keep it simple: just fetch and display courses with category data.

### 3. Course Detail Page — `src/app/courses/[slug]/page.tsx`

Replace the `placeholderCourse` with a real Supabase fetch:
- Fetch course by slug from Supabase
- Fetch related modules (if any)
- Show course not found state if not found

### 4. Admin Dashboard — `src/app/admin-place/page.tsx`

Replace hardcoded stats and data with real Supabase queries:
- Total Students: count from `profiles` table where role='student'
- Active Courses: count from `courses` table where is_active=true
- Total Revenue: sum from `payments` table where status='completed'
- New Leads: count from `leads` table where status='new'
- Recent Enrollments: fetch from `enrollments` with course and profile data
- Recent Payments: fetch from `payments` with profile data

### 5. Admin Courses Page — `src/app/admin-place/courses/page.tsx`

Replace hardcoded courses array with:
- Fetch courses from Supabase with category data
- Add "Add Course" functionality — open a dialog/form to create a new course
- Add "Edit Course" functionality — open a dialog/form to edit existing course
- Add "Delete Course" functionality — confirm and delete
- Keep the search functionality

### 6. Admin Students Page — `src/app/admin-place/students/page.tsx`

Replace hardcoded data with:
- Fetch students from `profiles` table where role='student'
- Show enrollment count for each student
- Add search functionality

### 7. Admin Leads Page — `src/app/admin-place/leads/page.tsx`

Replace hardcoded data with:
- Fetch leads from `leads` table
- Show status badges (new= blue, contacted=yellow, converted=green, closed=gray)
- Allow status update (mark as contacted, converted, etc.)

### 8. Admin Payments Page — `src/app/admin-place/payments/page.tsx`

Replace hardcoded data with:
- Fetch payments from `payments` table with profile and course data
- Show status badges

### 9. Admin Certificates Page — `src/app/admin-place/certificates/page.tsx`

Replace hardcoded data with:
- Fetch certificates from `certificates` table with profile and course data
- Add "Generate Certificate" functionality

### 10. Student Pages — `src/app/student/*`

Replace all hardcoded data with Supabase fetches:
- `student/dashboard/page.tsx` — Show enrolled courses, progress, certificates
- `student/my-courses/page.tsx` — Fetch enrolled courses with progress
- `student/certificates/page.tsx` — Fetch student certificates
- `student/tests/page.tsx` — Fetch available tests and previous attempts
- `student/profile/page.tsx` — Fetch and allow editing of profile

### 11. Placements Page — `src/app/placements/page.tsx`

Replace hardcoded companies with static content (keep as const — it's marketing data). If there's a placements/companies table in Supabase, fetch from it. Otherwise keep as static.

### 12. Projects Page — `src/app/projects/page.tsx`

Replace hardcoded projects with:
- Fetch from `student_projects` table where is_approved=true
- Or keep as static showcase if no table exists

### 13. Footer — `src/components/layout/Footer.tsx`

Replace hardcoded categories with a Supabase fetch:
- Fetch active categories from `categories` table
- Keep static links (Home, Courses, About, Contact)

### 14. Navbar — `src/components/layout/Navbar.tsx`

Keep nav links as static (they're route links, not dynamic data).

### 15. Stats Section — `src/components/home/StatsSection.tsx`

Replace hardcoded stats with actual data from Supabase:
- Fetch course count, testimonial count
- Use static values for "100% Job Assistance" and "10+ Industry Mentors"

### 16. CourseFilter — `src/components/courses/CourseFilter.tsx`

Replace hardcoded categories array with a Supabase fetch (server component or pass as props).

## New Files to Create

### `src/lib/supabase/queries.ts`
Centralized query functions for reuse:
- `getCategories()` — fetch all active categories
- `getCourses(categoryId?)` — fetch active courses, optionally filtered by category
- `getCourseBySlug(slug)` — fetch single course with category
- `getTestimonials()` — fetch active testimonials
- `getLeads()` — fetch all leads (admin)
- `getStudents()` — fetch all students (admin)
- `getPayments()` — fetch all payments (admin)
- `getCertificates()` — fetch all certificates (admin)
- `getDashboardStats()` — fetch aggregated stats (admin)

## Design Requirements
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use existing UI components from `src/components/ui/`
- Use lucide-react icons
- Responsive design
- For admin pages: use the existing admin layout with sidebar
- Add loading states (skeleton or "Loading..." text)
- Add empty states when no data is found
- Add error handling for failed fetches

## DO NOT
- Do NOT run git push or any git remote commands
- Do NOT add new dependencies
- Do NOT modify the database schema
- Do NOT change the Supabase client files
- Do NOT break the existing auth/login/register flow

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- Run `git log --oneline -3` to confirm no unintended commits
- The admin panel should be fully functional (CRUD for courses, view students/leads/payments)
