# Supabase Data Upload — Seed Data Script

## Goal
Create a seed script that uploads hardcoded academy data (categories, courses, testimonials) to Supabase using the SERVICE ROLE KEY (bypasses RLS). Then connect the frontend pages to fetch from Supabase instead of using hardcoded placeholder data.

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace` (use for all operations)
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS

## Environment Variables
The `.env.local` file at `C:\auto_skillplace\skillplace\.env.local` contains:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key (for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (for server-side seed script)

## Supabase Client Setup
- Client: `src/lib/supabase/client.ts` — uses anon key
- Server: `src/lib/supabase/server.ts` — has `createAdminSupabaseClient()` using service role key
- Schema: `src/lib/supabase/schema.sql` — full schema with all tables

## Tasks

### 1. Create Seed Script — `scripts/seed-supabase.mjs`

Create a Node.js script that uses the Supabase service role client to insert data. The script should:
- Load env vars from `.env.local` (use `dotenv` or read the file manually)
- Use the service role key (bypasses RLS)
- Clear existing data before inserting (to make it idempotent)
- Insert in the correct order (categories first, then courses, then testimonials)
- Print progress for each step

**Data to insert:**

**Categories (4 rows):**
| name | slug | description | icon | order_index |
|------|------|-------------|------|-------------|
| Civil Engineering | civil-engineering | Civil engineering courses for diploma and B.Tech students | Building2 | 1 |
| Mechanical Engineering | mechanical-engineering | Mechanical engineering courses for diploma and B.Tech students | Wrench | 2 |
| Electrical Engineering | electrical-engineering | Electrical engineering courses for diploma and B.Tech students | Zap | 3 |
| Electronics | electronics | Electronics engineering courses for diploma and B.Tech students | Cpu | 4 |

**Courses (22 rows) — use the exact data from `src/app/courses/page.tsx`:**

Civil (6 courses):
- AutoCAD Civil | autocad-civil | Master AutoCAD for civil engineering drawings and plans. | ₹4,999 | ₹3,999 | 40h | beginner | featured
- Quantity Survey | quantity-survey | Learn quantity surveying for construction projects. | ₹5,499 | ₹4,499 | 35h | intermediate
- Billing & Estimation | billing-estimation | Master billing and estimation in construction. | ₹5,499 | ₹4,499 | 30h | intermediate
- BOQ Preparation | boq-preparation | Learn BOQ preparation for tendering. | ₹4,999 | ₹3,999 | 25h | intermediate
- Excel for Engineers | excel-for-engineers | Excel skills for engineering calculations and reports. | ₹2,999 | ₹1,999 | 20h | beginner
- Site Execution Basics | site-execution-basics | Basics of site execution and management. | ₹5,999 | ₹4,999 | 35h | beginner

Mechanical (6 courses):
- AutoCAD Mechanical | autocad-mechanical | AutoCAD for mechanical engineering drawings. | ₹4,999 | ₹3,999 | 40h | intermediate | featured
- SolidWorks | solidworks | 3D CAD modeling with SolidWorks. | ₹5,999 | ₹4,999 | 35h | intermediate
- GD&T | gdt | Geometric Dimensioning and Tolerancing. | ₹5,499 | ₹4,499 | 30h | intermediate
- Industrial Drawing | industrial-drawing | Reading and creating industrial drawings. | ₹4,999 | ₹3,999 | 30h | intermediate
- Design Basics | design-basics | Fundamentals of mechanical design. | ₹3,999 | ₹2,999 | 25h | beginner
- NC Programming | nc-programming | CNC programming for manufacturing. | ₹6,999 | ₹5,999 | 45h | advanced

Electrical (5 courses):
- AutoCAD Electrical | autocad-electrical | AutoCAD for electrical engineering. | ₹4,999 | ₹3,999 | 35h | intermediate
- Estimation & Costing | estimation-costing | Electrical estimation and costing. | ₹5,499 | ₹4,499 | 30h | intermediate
- Panel Designing | panel-designing | Electrical panel design and wiring. | ₹5,999 | ₹4,999 | 35h | intermediate
- Electrical Basics | electrical-basics | Fundamentals of electrical engineering. | ₹3,999 | ₹2,999 | 25h | beginner
- Project Work | electrical-project-work | Real-world electrical project. | ₹6,999 | ₹5,999 | 45h | advanced

Electronics (5 courses):
- PCB Design Basics | pcb-design-basics | Learn PCB design fundamentals. | ₹4,499 | ₹3,499 | 30h | beginner | featured
- Embedded Systems | embedded-systems | Embedded systems programming. | ₹5,999 | ₹4,999 | 40h | intermediate
- Industrial Electronics | industrial-electronics | Industrial electronics and automation. | ₹5,499 | ₹4,499 | 35h | intermediate
- Microcontroller Basics | microcontroller-basics | Microcontroller programming basics. | ₹4,499 | ₹3,499 | 30h | beginner
- Project Work | electronics-project-work | Real-world electronics project. | ₹6,999 | ₹5,999 | 45h | advanced

**Testimonials (5 rows):**
| student_name | course_name | rating | review | is_featured |
|-------------|-------------|--------|--------|-------------|
| Rahul Verma | SolidWorks | 5 | "Amazing practical training! Got placed in a top mechanical company within 2 months of completing the course." | true |
| Priya Sharma | AutoCAD Civil | 5 | "The hands-on approach and real project experience made all the difference. Now working as a site engineer." | true |
| Amit Patel | PLC Programming | 4 | "Great instructors with industry knowledge. The placement assistance is genuine." | true |
| Sneha Gupta | PCB Design | 5 | "From zero knowledge to designing my own PCBs — all thanks to Skillplace Academy!" | false |
| Vikram Singh | Electrical Basics | 4 | "The hybrid model gave me flexibility while still getting hands-on lab experience. Highly recommend!" | false |

### 2. Update Courses Page — `src/app/courses/page.tsx`

Replace the hardcoded `placeholderCourses` array with a Supabase fetch:
- Convert to a server component (remove `'use client'`)
- Use the admin Supabase client to fetch courses with their categories
- Use `.select('*, categories(*)')` to join category data
- Add loading state (skeleton or simple "Loading..." text)
- Keep the existing search/filter UI
- Keep the CourseCard component as-is

### 3. Update Home Page Courses Section — `src/components/home/CoursesSection.tsx`

Convert to a server component that fetches categories and their courses from Supabase:
- Use admin Supabase client
- Fetch categories with their related courses
- Display in the same card grid layout
- Keep the same icons (Building2, Wrench, Zap, Cpu)

### 4. Add Seed Script to package.json

Add a script entry: `"seed": "node scripts/seed-supabase.mjs"`

### 5. Create a Supabase Admin Client Helper — `src/lib/supabase/admin.ts`

Create a simple helper that exports the admin client for use in server components:
```ts
import { createAdminSupabaseClient } from './server'
export const adminSupabase = createAdminSupabaseClient()
```

## Design Requirements
- Keep the existing light theme styling
- Keep all existing UI components
- The seed script should be self-contained and runnable with `npm run seed`

## DO NOT
- Do NOT run git push or any git remote commands
- Do NOT modify the database schema (it's already correct)
- Do NOT add new dependencies (dotenv is already available or use a simple .env parser)
- Do NOT modify the admin/student dashboards
- Do NOT change the Course type interface
- Do NOT delete any existing data — the seed script should handle conflicts gracefully (use `upsert` or delete+insert)

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- Run `git log --oneline -3` to confirm no unintended commits
- The seed script should be ready to run with `npm run seed`
