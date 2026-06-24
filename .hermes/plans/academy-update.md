# Skillplace Academy — Application Update Brief

## Overview
Update the Skillplace Academy Next.js application to reflect the course plan from "course details.txt". This is a LIGHT THEME application (white bg, blue-600 primary, slate text). Use ONLY Tailwind CSS classes — no inline styles, no CSS-in-JS.

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace` (use this for all operations)
- Types: `src/types/index.ts`
- Components: `src/components/`
- App routes: `src/app/`

## Current Pages
- `src/app/page.tsx` — Home page (Hero, Stats, Courses, Placement, Testimonials)
- `src/app/courses/page.tsx` — Courses listing with placeholder data
- `src/app/about/page.tsx` — About page
- `src/app/placements/page.tsx` — Placements page
- `src/app/contact/page.tsx` — Contact page

## Tasks

### 1. Update Course Data — `src/app/courses/page.tsx`

Replace the `placeholderCourses` array with the actual courses from the plan. Map them to the existing Course interface:

**Civil Courses:**
- AutoCAD Civil → slug: `autocad-civil`, level: beginner
- Quantity Survey → slug: `quantity-survey`, level: intermediate
- Billing & Estimation → slug: `billing-estimation`, level: intermediate
- BOQ Preparation → slug: `boq-preparation`, level: intermediate
- Excel for Engineers → slug: `excel-for-engineers`, level: beginner
- Site Execution Basics → slug: `site-execution-basics`, level: beginner

**Mechanical Courses:**
- AutoCAD Mechanical → slug: `autocad-mechanical`, level: intermediate
- SolidWorks → slug: `solidworks`, level: intermediate
- GD&T → slug: `gdt`, level: intermediate
- Industrial Drawing → slug: `industrial-drawing`, level: intermediate
- Design Basics → slug: `design-basics`, level: beginner
- NC Programming → slug: `nc-programming`, level: advanced

**Electrical Courses:**
- AutoCAD Electrical → slug: `autocad-electrical`, level: intermediate
- Estimation & Costing → slug: `estimation-costing`, level: intermediate
- Panel Designing → slug: `panel-designing`, level: intermediate
- Electrical Basics → slug: `electrical-basics`, level: beginner
- Project Work → slug: `electrical-project-work`, level: advanced

**Electronics Courses:**
- PCB Design Basics → slug: `pcb-design-basics`, level: beginner
- Embedded Systems → slug: `embedded-systems`, level: intermediate
- Industrial Electronics → slug: `industrial-electronics`, level: intermediate
- Microcontroller Basics → slug: `microcontroller-basics`, level: beginner
- Project Work → slug: `electronics-project-work`, level: advanced

Set all courses to `is_active: true`, `is_featured: true` for the first course in each category. Use realistic prices (3000-8000 range) and discount prices (2000-6000 range). Duration: 20-50 hours each.

### 2. Update Course Categories — `src/components/home/CoursesSection.tsx`

Replace the `categories` array with the actual 4 departments:

1. **Civil Engineering** — icon: Building2
   - AutoCAD Civil, Quantity Survey, Billing & Estimation, BOQ Preparation, Excel for Engineers, Site Execution Basics

2. **Mechanical Engineering** — icon: Wrench
   - AutoCAD Mechanical, SolidWorks, GD&T, Industrial Drawing, Design Basics, NC Programming

3. **Electrical Engineering** — icon: Zap
   - AutoCAD Electrical, Estimation & Costing, Panel Designing, Electrical Basics, Project Work

4. **Electronics** — icon: Cpu
   - PCB Design Basics, Embedded Systems, Industrial Electronics, Microcontroller Basics, Project Work

Update the count for each category to match the number of courses listed.

### 3. Create Academy Info Page — `src/app/academy/page.tsx`

Create a NEW page at `/academy` that presents the full academy information from the plan. Structure:

**Hero Section:**
- Title: "skillplace ACADEMY"
- Tagline: "Learn | Practice | Get Placed"
- Main offer: "LEARN TODAY – GET HIRED TOMORROW!"
- Sub-items: Practical Training, Real Projects, Real Careers
- Location: "Bilaspur, Chhattisgarh"

**Target Students Section:**
- Diploma Students
- B.Tech Final Year Students
- Passed Out Students
- Working Professionals

**Courses Section:**
- Display all 4 departments with their courses in a grid/card layout
- Use the same card style as the courses page

**Features Section (with icons):**
- 100% Job Assistance
- Practical Training
- Live Projects
- Industry Mentor Guidance
- Soft Skills Training
- Interview Preparation
- Placement Assistance

**Hybrid Learning Model Section:**
- Online Classes
- Offline Q&A
- Soft Skills Training
- Career Guidance

**Certificates Section:**
- Course Completion Certificate
- Project Completion Certificate (2 Live Projects)
- Industrial Training Certificate (From Company)

**Learn From Industry Experts:**
- 10+ Industry Mentors
- Extra Mentor Sessions

**Programs Section — Three program types in cards/tabs:**

| Online Program | Offline Program | Hybrid Program |
|----------------|-----------------|----------------|
| Course (Online) | 100% Job assistance | Online course access |
| Online doubt sessions | Soft skills training | Training completion certificate |
| Training certificate | Doubt sessions | Industry expert mentorship |
| Project completion certificate | Live offline classes with recorded video | Site visits |
| Real project report study | Site visits | 2 Project completion certificate |
| Resume building | Industry expert mentorship | Job assistance (final-year students) |
| Career guidance with experts | Internship certificate | Access to both online and offline resources |
| Lifetime course recording access | Training completion certificate | + all online benefits |
| Interview preparation | 2 project completion certificates | |
| | Year-gap solution/support | |
| | Real project report study | |
| | Resume building | |
| | Lifetime course recording access | |
| | Interview preparation | |
| | Site visits | |

**Why Choose Us Section:**
- Industry-Focused Curriculum
- Hands-on Practical Training
- Real World Projects
- 100% placement assistance

**Contact Section:**
- Call / WhatsApp: 7987814261, 8085782471
- Location: Bilaspur, Chhattisgarh (Near Your Location)

**Sponsors / Partners:**
- Sponsored By: Autommensor Automation Pvt. Ltd.
- Industry Partner: Construction Company - himanshu construction

### 4. Update Home Page Hero — `src/app/page.tsx`

Add a link to the new `/academy` page in the CTA section. Add a third button: "Learn About Our Academy" linking to `/academy`.

### 5. Update Navbar — `src/components/layout/Navbar.tsx`

Add "Academy" link to the navigation between "Courses" and "About".

## Design Requirements
- LIGHT THEME: white backgrounds, blue-600 primary, slate/gray text
- Use existing UI components from `src/components/ui/` (Button, Card, Badge, etc.)
- Use lucide-react icons
- Responsive design (mobile-first with sm:/md:/lg: breakpoints)
- Keep consistent spacing with existing pages (py-16 for sections, max-w-7xl container)

## DO NOT
- Do NOT run git push or any git remote commands
- Do NOT modify the database schema
- Do NOT add new dependencies
- Do NOT change the existing admin/student dashboards
- Do NOT modify the existing Course type interface

## After Completion
- Run `npx tsc --noEmit` to verify no TypeScript errors
- Run `git log --oneline -3` to confirm no unintended commits
