# Skillplace Academy - MVP Build Brief

## Project Overview
Build "Skillplace Academy" - a coaching class platform where students learn skills, complete projects, take tests, get certificates, attend live classes, and get placement assistance.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Razorpay
- **Video**: HLS streaming with signed URLs
- **Theme**: LIGHT THEME throughout (no dark mode)
- **Notifications**: react-notifications-component
- **Deployment**: Vercel

## CRITICAL RULES
1. Use ONLY Tailwind CSS classes for styling — no inline styles, no CSS-in-JS
2. LIGHT THEME only — use light colors (white, gray-50, gray-100, blue-600, etc.)
3. DO NOT run git push or any git remote commands
4. Use `npx create-next-app@latest` to scaffold the project first
5. Install all dependencies listed below
6. Use Shadcn UI components (init with `npx shadcn-ui@latest init`)
7. All pages must be responsive (mobile-first)

## Step 1: Scaffold Next.js Project

Run from C:\auto_skillplace directory:
```
npx create-next-app@latest skillplace --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

Then move all contents from C:\auto_skillplace\skillplace\ to C:\auto_skillplace\ and delete the empty skillplace subdirectory.
All subsequent work should be in C:\auto_skillplace\

## Step 2: Install Dependencies

```bash
cd C:\auto_skillplace
npm install @supabase/supabase-js @supabase/ssr
npm install razorpay
npm install react-notifications-component
npm install lucide-react
npm install framer-motion
npm install hls.js
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-avatar @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod
```

Initialize Shadcn UI:
```
npx shadcn-ui@latest init
```
Select: Default style, Slate base color, CSS variables NO, rsc yes, tailwind.config.ts yes, components dir @/components/ui, utils dir @/lib/utils, react-server-components yes.

Then add shadcn components:
```
npx shadcn-ui@latest add button card input label tabs dialog dropdown-menu avatar progress badge toast form select textarea separator skeleton avatar
```

## Step 3: Tailwind Config (Light Theme)

Update tailwind.config.ts with light theme colors:
```ts
const config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb", // blue-600
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f1f5f9", // slate-100
          foreground: "#0f172a", // slate-900
        },
        accent: {
          DEFAULT: "#f97316", // orange-500
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#0f172a",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        border: "#e2e8f0",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## Step 4: Global CSS (globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #2563eb;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --accent: #f97316;
  --accent-foreground: #ffffff;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --card: #ffffff;
  --card-foreground: #0f172a;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', system-ui, sans-serif;
}

/* Video security - disable right click */
.video-container {
  -webkit-user-select: none;
  user-select: none;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
```

## Step 5: Supabase Setup

Create src/lib/supabase/client.ts:
```ts
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Create src/lib/supabase/server.ts:
```ts
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const createAdminSupabaseClient = () => createClient(supabaseUrl, supabaseServiceKey)
```

Create src/lib/utils.ts:
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Create .env.local template:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Step 6: Database Schema (Supabase SQL)

Create src/lib/supabase/schema.sql with ALL these tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  duration_hours INTEGER,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration INTEGER,
  pdf_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  progress_percent INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, course_id)
);

-- Lesson progress table
CREATE TABLE public.lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, lesson_id)
);

-- Tests table
CREATE TABLE public.tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  passing_score INTEGER DEFAULT 60,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test questions table
CREATE TABLE public.test_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

-- Test attempts table
CREATE TABLE public.test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  answers JSONB,
  score INTEGER,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  UNIQUE(user_id, course_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table (contact form submissions)
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Live classes table
CREATE TABLE public.live_classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  recording_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student projects table
CREATE TABLE public.student_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_photo TEXT,
  course_name TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - users can read their own data, admins can do everything)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own test attempts" ON public.test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test attempts" ON public.test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage tests" ON public.tests FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage leads" ON public.leads FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage payments" ON public.payments FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view approved projects" ON public.student_projects FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own projects" ON public.student_projects FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for performance
CREATE INDEX idx_courses_category ON public.courses(category_id);
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_modules_course ON public.modules(course_id);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
```

## Step 7: Project File Structure

Create ALL these files:

```
C:\auto_skillplace\
├── src/
│   ├── app/
│   │   ├── layout.tsx              (root layout with navbar + footer)
│   │   ├── page.tsx                (landing page)
│   │   ├── globals.css
│   │   ├── courses/
│   │   │   ├── page.tsx            (courses listing)
│   │   │   └── [slug]/
│   │   │       └── page.tsx        (course detail)
│   │   ├── placements/
│   │   │   └── page.tsx            (placements page)
│   │   ├── projects/
│   │   │   └── page.tsx            (student projects)
│   │   ├── about/
│   │   │   └── page.tsx            (about page)
│   │   ├── contact/
│   │   │   └── page.tsx            (contact page + lead form)
│   │   ├── login/
│   │   │   └── page.tsx            (login page)
│   │   ├── register/
│   │   │   └── page.tsx            (register page)
│   │   ├── student/
│   │   │   ├── layout.tsx          (student dashboard layout with sidebar)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        (student dashboard)
│   │   │   ├── my-courses/
│   │   │   │   └── page.tsx        (my courses)
│   │   │   ├── certificates/
│   │   │   │   └── page.tsx        (certificates)
│   │   │   ├── tests/
│   │   │   │   └── page.tsx        (tests)
│   │   │   └── profile/
│   │   │       └── page.tsx        (profile)
│   │   └── admin/
│   │       ├── layout.tsx          (admin layout with sidebar)
│   │       ├── page.tsx            (admin dashboard)
│   │       ├── students/
│   │       │   └── page.tsx        (student management)
│   │       ├── courses/
│   │       │   └── page.tsx        (course management)
│   │       ├── payments/
│   │       │   └── page.tsx        (payment management)
│   │       ├── leads/
│   │       │   └── page.tsx        (lead management)
│   │       └── certificates/
│   │           └── page.tsx        (certificate management)
│   ├── components/
│   │   ├── ui/                     (shadcn components)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          (main navbar)
│   │   │   ├── Footer.tsx          (main footer)
│   │   │   ├── StudentSidebar.tsx  (student dashboard sidebar)
│   │   │   └── AdminSidebar.tsx    (admin sidebar)
│   │   ├── home/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── CoursesSection.tsx
│   │   │   ├── PlacementSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── StatsSection.tsx
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   └── CourseFilter.tsx
│   │   ├── video/
│   │   │   ├── SecureVideoPlayer.tsx  (HLS player with watermark)
│   │   │   └── VideoWatermark.tsx
│   │   └── shared/
│   │       ├── LoadingSpinner.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── schema.sql
│   │   ├── utils.ts
│   │   ├── auth.ts
│   │   └── razorpay.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useVideoSecurity.ts
│   └── types/
│       └── index.ts
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Step 8: Key Components to Build

### Navbar (src/components/layout/Navbar.tsx)
- Logo "Skillplace Academy"
- Links: Home, Courses, Placements, Projects, About, Contact
- Login/Register buttons on right
- Mobile hamburger menu
- Light theme: white background, shadow-sm, blue-600 for active links
- After login: show user avatar + dropdown (Dashboard, Profile, Logout)

### Footer (src/components/layout/Footer.tsx)
- Logo + tagline
- Quick links: Courses, About, Contact
- Course categories list
- Contact info
- Social media links
- Copyright
- Light theme: slate-50 background, slate-900 text

### Hero Section (src/components/home/HeroSection.tsx)
- Headline: "Become Job Ready Engineer in 90 Days"
- Subheadline about Skillplace Academy
- Two buttons: "Enroll Now" (primary blue), "Free Career Counseling" (outline)
- Background: light gradient (blue-50 to white)
- Stats bar: Students Trained, Interviews Cleared, Projects Completed

### Courses Section (src/components/home/CoursesSection.tsx)
- Show all 6 categories with their courses:
  - Civil Engineering: AutoCAD 2D, AutoCAD 3D, Revit Architecture, Quantity Estimation, BOQ Preparation, Site Execution Basics
  - Mechanical: AutoCAD Mechanical, SolidWorks, GD&T Basics, Production Drawing Reading
  - Electrical: AutoCAD Electrical, LT/HT Systems, Panel Design, Solar Design, PLC Basics
  - Electronics: PLC Programming, HMI, SCADA, Industrial Sensors, VFD, Industrial Networking
  - Soft Skills: Resume Building, Interview Preparation, Communication Skills, LinkedIn Profile, Mock Interviews
- Each category as a card with course count
- Click to filter courses by category

### Placement Section (src/components/home/PlacementSection.tsx)
- Show stats: Students Trained, Interviews Cleared, Projects Completed
- Animated counters
- Company logos placeholder
- CTA: "Get Placement Support"

### Testimonials Section (src/components/home/TestimonialsSection.tsx)
- Student testimonials carousel
- Star ratings
- Student photo, name, course
- Light theme cards with subtle shadow

### Course Card (src/components/courses/CourseCard.tsx)
- Thumbnail image
- Title, short description
- Price (with discount if applicable)
- Level badge (Beginner/Intermediate/Advanced)
- Duration
- "Enroll Now" button
- Light theme: white card, border, hover shadow

### Secure Video Player (src/components/video/SecureVideoPlayer.tsx)
- Uses hls.js for HLS streaming
- Floating watermark with student email (positioned randomly, moves every 10 seconds)
- Disable right-click context menu
- Disable keyboard shortcuts (F12, Ctrl+Shift+I, Ctrl+U)
- Signed URL with 10-minute expiry
- Single device session check

### Student Sidebar (src/components/layout/StudentSidebar.tsx)
- Links: Dashboard, My Courses, Certificates, Tests, Profile
- Icons from lucide-react
- Active state highlighting
- Light theme: white background, blue-600 active state
- NO RBAC - show all items to all users

### Admin Sidebar (src/components/layout/AdminSidebar.tsx)
- Links: Dashboard, Students, Courses, Payments, Leads, Certificates
- Icons from lucide-react
- Light theme

## Step 9: Page Details

### Landing Page (/)
- Navbar + Footer in layout
- HeroSection
- StatsSection (animated counters)
- CoursesSection (all categories)
- PlacementSection
- TestimonialsSection
- CTA section at bottom

### Courses Page (/courses)
- Filter bar by category (sticky)
- CourseCard grid (3 columns desktop, 2 tablet, 1 mobile)
- Search input

### Course Detail (/courses/[slug])
- Course header: title, description, thumbnail, price
- Instructor info placeholder
- Module/lesson accordion
- Enroll button
- Related courses

### Placements Page (/placements)
- Stats section
- Success stories
- Company logos
- CTA

### Projects Page (/projects)
- Grid of student projects
- Filter by course
- Project cards with image, title, student name

### About Page (/about)
- Mission, vision, team
- Why choose Skillplace

### Contact Page (/contact)
- Contact form (name, email, phone, message) -> saves to leads table
- Map placeholder
- Contact info

### Login Page (/login)
- Email/password login via Supabase auth
- Link to register
- Social login buttons (placeholder)

### Register Page (/register)
- Name, email, password, phone
- Supabase auth signup
- Link to login

### Student Dashboard (/student/dashboard)
- Welcome message
- Enrolled courses progress
- Upcoming live classes
- Recent notifications
- Quick stats

### My Courses (/student/my-courses)
- List of enrolled courses with progress bars
- Continue learning button

### Certificates (/student/certificates)
- List of earned certificates
- Download button

### Tests (/student/tests)
- Available tests
- Start test button
- Previous attempts with scores

### Profile (/student/profile)
- Edit profile form
- Change password
- Avatar upload

### Admin Dashboard (/admin)
- Stats: total students, courses, revenue, leads
- Recent enrollments
- Recent payments

### Admin Students (/admin/students)
- Table of students
- Search, filter
- Suspend/activate
- Reset password button

### Admin Courses (/admin/courses)
- Table of courses
- Add/edit/delete
- Upload video/PDF

### Admin Payments (/admin/payments)
- Payment history table
- Filter by status
- Export

### Admin Leads (/admin/leads)
- Leads table
- Status update (new -> contacted -> converted -> closed)
- Contact details

### Admin Certificates (/admin/certificates)
- Issue certificate to student
- List of issued certificates
- Download

## Step 10: Auth Flow

Create src/lib/auth.ts:
```ts
import { supabase } from './supabase/client'

export async function signUp(email: string, password: string, fullName: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone }
    }
  })
  if (error) throw error
  // Create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: fullName,
      phone,
      role: 'student'
    })
  }
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).limit(1)
  if (error) throw error
  return data && data.length > 0 ? data[0] : null
}
```

Create src/hooks/useAuth.ts:
```ts
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

## Step 11: Video Security Implementation

Create src/hooks/useVideoSecurity.ts:
```ts
'use client'
import { useEffect } from 'react'

export function useVideoSecurity() {
  useEffect(() => {
    // Disable right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }
    
    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault()
      }
    }

    // Disable text selection on video
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.closest('.video-container')) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
    }
  }, [])
}
```

Create src/components/video/VideoWatermark.tsx:
```ts
'use client'
import { useState, useEffect } from 'react'

interface VideoWatermarkProps {
  email: string
}

export default function VideoWatermark({ email }: VideoWatermarkProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition({
        x: Math.random() * 60 + 10,
        y: Math.random() * 60 + 10
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="absolute text-white text-sm font-semibold opacity-40 pointer-events-none z-10 select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        transform: 'rotate(-15deg)'
      }}
    >
      {email}
    </div>
  )
}
```

Create src/components/video/SecureVideoPlayer.tsx:
```ts
'use client'
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import VideoWatermark from './VideoWatermark'
import { useVideoSecurity } from '@/hooks/useVideoSecurity'

interface SecureVideoPlayerProps {
  src: string
  userEmail: string
}

export default function SecureVideoPlayer({ src, userEmail }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  useVideoSecurity()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {})
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Video loading failed. Please refresh.')
        }
      })
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => {})
    }
  }, [src])

  return (
    <div className="video-container relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />
      <VideoWatermark email={userEmail} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
          {error}
        </div>
      )}
    </div>
  )
}
```

## Step 12: Razorpay Integration

Create src/lib/razorpay.ts:
```ts
import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createOrder(amount: number, currency: string = 'INR') {
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency,
    receipt: `order_${Date.now()}`,
  })
  return order
}

export function verifyPayment(orderId: string, paymentId: string, signature: string) {
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return expectedSignature === signature
}
```

## Step 13: Types

Create src/types/index.ts:
```ts
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'student' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Course {
  id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  preview_video_url: string | null
  price: number
  discount_price: number | null
  duration_hours: number | null
  level: 'beginner' | 'intermediate' | 'advanced'
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  category?: Category
  modules?: Module[]
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  description: string | null
  video_url: string | null
  video_duration: number | null
  pdf_url: string | null
  order_index: number
  is_free: boolean
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  status: 'active' | 'completed' | 'expired'
  progress_percent: number
  enrolled_at: string
  completed_at: string | null
  course?: Course
}

export interface Test {
  id: string
  course_id: string
  title: string
  description: string | null
  duration_minutes: number | null
  passing_score: number
  max_attempts: number
  is_active: boolean
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_number: string
  issued_at: string
  pdf_url: string | null
  course?: Course
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: string
  is_read: boolean
  metadata: Record<string, any> | null
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  source: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  course_id: string
  amount: number
  currency: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
}

export interface Testimonial {
  id: string
  student_name: string
  student_photo: string | null
  course_name: string | null
  rating: number
  review: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}
```

## Step 14: Root Layout

src/app/layout.tsx:
```tsx
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Skillplace Academy - Become Job Ready Engineer in 90 Days",
  description: "Learn Civil, Mechanical, Electrical, Electronics skills with live classes, projects, and placement assistance.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## Step 15: Student Dashboard Layout

src/app/student/layout.tsx:
```tsx
import StudentSidebar from "@/components/layout/StudentSidebar"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  )
}
```

## Step 16: Admin Layout

src/app/admin/layout.tsx:
```tsx
import AdminSidebar from "@/components/layout/AdminSidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  )
}
```

## IMPORTANT NOTES FOR OPENCODE
1. This is a LIGHT THEME project. All components should use light colors (white, gray-50, gray-100, blue-600, etc.)
2. Use ONLY Tailwind CSS classes — no inline styles
3. Make everything responsive (mobile-first)
4. Use placeholder/placeholder.svg for images where needed
5. Use lucide-react icons throughout
6. All data fetching from Supabase should use .limit(1) + array indexing instead of .maybeSingle()
7. DO NOT git push
8. After all files are created, run `npx tsc --noEmit` and fix any errors
9. Create ALL files listed in the structure above — do not skip any
10. Use proper TypeScript types from src/types/index.ts
