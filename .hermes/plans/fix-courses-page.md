# Fix Courses Page — Add Filtering & Purchased Courses Section

## Problem
1. Courses page has no filtering by category
2. No section to show purchased/enrolled courses for logged-in students

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS

## Tasks

### 1. Rewrite Courses Page — `src/app/courses/page.tsx`

Create a complete courses page with:
- **Search bar** at the top
- **Category filter buttons** (All, Civil Engineering, Mechanical Engineering, Electrical Engineering, Electronics) — fetched from Supabase
- **Course grid** filtered by selected category and search term
- **"My Purchased Courses" section** — if user is logged in (check Supabase auth), show enrolled courses from `enrollments` table with progress
- Use `'use client'` for the search/filter interactivity, but fetch initial data from Supabase

Implementation:
- Fetch categories and courses from Supabase (server-side, pass as props)
- Use client-side state for search term and selected category
- Filter courses based on search term (match title/description) and selected category
- Add a "My Enrolled Courses" section at the bottom that shows enrolled courses for logged-in users
- Use `supabase.auth.getUser()` to check if user is logged in
- Fetch enrollments with course data for logged-in user

### 2. Update CourseCard — `src/components/courses/CourseCard.tsx`

The card looks good. Just make sure:
- It renders properly with the Supabase data structure (course.categories.name instead of course.category)
- Show category name from the joined `categories` table
- The card uses `course.categories?.name` for the category badge

### 3. Add Loading State — `src/app/courses/loading.tsx`

Create a loading skeleton for the courses page:
- Show skeleton cards in a grid
- Show skeleton filter buttons

### 4. Create Purchased Courses Component — `src/components/courses/PurchasedCourses.tsx`

A client component that:
- Checks if user is logged in via `supabase.auth.getUser()`
- If logged in, fetches enrollments from `enrollments` table with course data
- Shows enrolled courses in a grid/card format with:
  - Course title
  - Progress bar (from `enrollments.progress_percent`)
  - Status badge (active/completed)
  - "Continue Learning" button linking to `/courses/{slug}`
- If not logged in, show a prompt: "Log in to see your purchased courses" with login button

## Design Requirements
- LIGHT THEME
- Filter buttons: horizontal scrollable row, active state has blue-600 bg, inactive has gray-100
- Search input: full-width with search icon
- Grid: 1 col mobile, 2 cols sm, 3 cols lg
- Purchased courses section: separate card style with progress bar
- Consistent with existing design

## DO NOT
- Do NOT run git push
- Do NOT add new dependencies
- Do NOT modify database schema
- Do NOT change Supabase client files

## After Completion
- Run `npx tsc --noEmit`
