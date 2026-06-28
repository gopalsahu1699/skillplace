# OpenCode Brief: SkillPlace Academy Homepage Redesign

## Overview
Redesign the homepage of SkillPlace Academy (Next.js 16 + Tailwind CSS 4) to create a clear value proposition with stronger visual hierarchy. The existing homepage at `src/app/page.tsx` needs a conversion-focused redesign.

## Project Location
`D:\web software developement\skillplaceacademy\skillplace` (use junction `C:\auto_skillplace\skillplace`)

## Design System Reference
Follow the design rules in `UI_UX_RULES.md` (in project root). Key points:
- Use Inter font, primary blue (#2563eb), success green (#22c55e), accent amber (#f59e0b)
- 4px spacing scale, 16px base
- Component-based: Card, Badge, Button from shadcn/ui
- Mobile-first responsive design
- WCAG AA accessibility
- **NO @/components/ui/dialog** — use div-based modals

## Current Files to Modify/Create

### 1. `src/app/page.tsx` — Main Homepage

Rewrite this entire file as a server component. Structure:

**Hero Section (above the fold):**
- Large headline: "Master Engineering Skills. Launch Your Career."
- Subheadline: "Industry-aligned courses in Civil, Mechanical, Electrical & Electronics. 100% Job Assistance."
- Two CTAs: Primary "Explore Programs →" | Secondary "View Courses"
- Trust badges inline: "2000+ Students | 4.8 Rating | 100% Job Support"
- Background: Gradient from primary-700 to primary-900, with subtle pattern overlay
- No video/image required — keep it fast-loading

**Stats Section:**
- 4 stat cards in a row: "2000+ Students", "100% Job Assistance", "10+ Industry Mentors", "25+ Courses"
- Use lucide-react icons
- Numbers large and bold, labels smaller

**Why Choose Us Section:**
- 4 cards in a grid (1 col mobile, 2 col tablet, 4 col desktop)
- Each card: Icon + Title + Description
- Icons: Briefcase (job), Target (curriculum), Wrench (practical), Award (projects)

**Programs Preview Section:**
- Show 3 training programs from the database
- Each card: Name, type badge (online/offline/hybrid), price, key features, "View Program →" link
- Grid: 1 col mobile, 2 col tablet, 3 col desktop
- "View All Programs →" link below

**Courses by Branch Section:**
- Tabs or filter pills: All | Civil | Mechanical | Electrical | Electronics
- Show 6 courses in a grid (2 mobile, 3 desktop)
- Each course card: thumbnail placeholder (colored gradient based on branch), title, price, level badge, "View Course →" link
- Use the `getCourses()` and `getCoursesByBranch()` queries

**Testimonials Section:**
- Show 3 testimonials in a card grid
- Each: star rating, review text, student name + course
- Use `getTestimonials()` query

**CTA Section:**
- Full-width gradient background
- Headline: "Ready to Start Your Career?"
- Subtext: "Join 2000+ students who transformed their careers with SkillPlace"
- Primary CTA: "Enroll Now — It's Free to Start"
- Secondary: "Talk to a Counselor →"

**Footer:** (handled by root layout Footer component)

### 2. `src/components/home/HeroSection.tsx` (NEW)
Create a new hero section component:
- Animated entry (fade-in + slide-up)
- Responsive text sizing
- Trust badges row
- Background pattern (CSS-only, no images)

### 3. `src/components/home/StatsSection.tsx` (NEW)
- Count-up animation on scroll (use IntersectionObserver)
- Icon + number + label layout
- Responsive grid

### 4. `src/components/home/CoursesSection.tsx` (NEW)
- Branch filter tabs
- Course grid from database
- Empty state handling

### 5. `src/components/home/TestimonialsSection.tsx` (NEW)
- Responsive card grid
- Star rating display
- Fallback when no testimonials exist

### 6. `src/components/home/CTASection.tsx` (NEW)
- Gradient background
- Two CTAs

### 7. `src/components/home/WhyChooseUs.tsx` (NEW)
- 4 feature cards grid
- Icons from lucide-react

## Database Queries Available (from @/lib/supabase/queries)

```typescript
import { getCourses, getTestimonials, getTrainingPrograms } from '@/lib/supabase/queries'
// Returns: courses (with branches join), testimonials, trainingPrograms (with branches join)
```

## Important Technical Notes

1. **This is a Next.js 16 App Router project** — use `async` server components for data fetching
2. **TypeScript strict mode** — no `any` types, use proper interfaces
3. **Turbopack JSX key bug** — wrap `.map()` return in `<React.Fragment key={id}>` NOT `<div key={id}>`
4. **Import alias** — use `@/` for src imports
5. **lucide-react** is already installed for icons
6. **shadcn/ui** components available: Button, Badge, Card, Input, Label, etc.
7. **No console.log** in production code
8. **Accessibility** — semantic HTML, alt text, aria-labels where needed

## Verification
After implementation:
```bash
cd C:\auto_skillplace\skillplace && npx tsc --noEmit
```
Must pass with ZERO errors.

## Rules
- Do NOT git push
- Do NOT modify any other files outside the homepage flow
- Use existing shadcn/ui components (Button, Badge, Card)
- Keep all existing functionality (auth, admin, student pages untouched)
- Mobile-first responsive design
- Test TypeScript compilation after all changes
