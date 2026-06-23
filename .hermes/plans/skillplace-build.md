# Skillplace Academy - Build Brief

## Current State
- Next.js 15 project already scaffolded at C:\auto_skillplace
- Dependencies already installed: @supabase/supabase-js, @supabase/ssr, lucide-react, framer-motion, hls.js, class-variance-authority, clsx, tailwind-merge, react-hook-form, @hookform/resolvers, zod, tailwindcss-animate, react-notifications-component
- DO NOT run create-next-app again
- DO NOT git push
- LIGHT THEME only (white bg, blue-600 primary, slate text)
- Use ONLY Tailwind CSS classes — no inline styles

## Step 1: Initialize Shadcn UI

Run these commands:
```
cd C:\auto_skillplace
npx shadcn@latest init -d
```
When prompted, select: Default style, Slate base color, NO CSS variables, yes RSC, tailwind.config.ts, @/components/ui, @/lib/utils, yes react-server-components.

Then add components:
```
npx shadcn@latest add -d button card input label tabs dialog dropdown-menu avatar progress badge toast form select textarea separator skeleton
```

## Step 2: Update tailwind.config.ts

Replace the entire content with:

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "hsl(222.2 84% 4.9%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        primary: {
          DEFAULT: "hsl(221.2 83.2% 53.3%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        accent: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
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
export default config
```

## Step 3: Update src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --card: #ffffff;
  --card-foreground: #0f172a;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, -apple-system, sans-serif;
}

html {
  scroll-behavior: smooth;
}

.video-container {
  -webkit-user-select: none;
  user-select: none;
}
```

## Step 4: Create ALL Library Files

Create src/lib/utils.ts:
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

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
export const createAdminSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
```

Create src/lib/supabase/schema.sql — save the full schema (we'll include it below).

Create src/lib/auth.ts:
```ts
import { supabase } from './supabase/client'

export async function signUp(email: string, password: string, fullName: string, phone: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName, phone } }
  })
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id, email, full_name: fullName, phone, role: 'student'
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

export async function getUserProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).limit(1)
  return data && data.length > 0 ? data[0] : null
}
```

Create src/lib/razorpay.ts:
```ts
export async function createOrder(amount: number, currency: string = 'INR') {
  // Razorpay integration placeholder
  const Razorpay = (await import('razorpay')).default
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt: `order_${Date.now()}`,
  })
  return order
}
```

## Step 5: Create Types

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

## Step 6: Create Hooks

Create src/hooks/useAuth.ts:
```ts
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
```

Create src/hooks/useVideoSecurity.ts:
```ts
'use client'
import { useEffect } from 'react'

export function useVideoSecurity() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) || (e.ctrlKey && e.key === 'u') || (e.ctrlKey && e.key === 's')) {
        e.preventDefault()
      }
    }
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
```

## Step 7: Create Shared Components

Create src/components/layout/Navbar.tsx:
- Light theme: white bg, shadow-sm, blue-600 primary
- Logo "Skillplace Academy" links to /
- Nav links: Home, Courses, Placements, Projects, About, Contact
- Login/Register buttons on right
- Mobile hamburger menu using shadcn Sheet or Dialog
- After login: show user email initial in avatar + dropdown with Dashboard, Profile, Logout
- Use lucide-react icons: Menu, User, LogOut, ChevronDown

Create src/components/layout/Footer.tsx:
- Light theme: slate-50 bg, slate-900 text
- Logo + tagline "Become Job Ready Engineer"
- Quick links column
- Course categories column
- Contact info column
- Social media icons
- Copyright line

Create src/components/layout/StudentSidebar.tsx:
- Fixed left sidebar, white bg, w-64
- Links with icons: Dashboard, My Courses, Certificates, Tests, Profile
- Active state: blue-600 text, blue-50 bg
- NO RBAC — show all items to all users
- Use lucide-react: LayoutDashboard, BookOpen, Award, FileTest, User

Create src/components/layout/AdminSidebar.tsx:
- Fixed left sidebar, white bg, w-64
- Links: Dashboard, Students, Courses, Payments, Leads, Certificates
- Icons: LayoutDashboard, Users, BookOpen, CreditCard, Inbox, Award

## Step 8: Create Home Page Components

Create src/components/home/HeroSection.tsx:
- Light gradient bg (blue-50 to white)
- Headline: "Become Job Ready Engineer in 90 Days"
- Subheadline: "Learn industry-ready skills with live classes, real projects, and placement assistance"
- Two buttons: "Enroll Now" (blue-600 bg), "Free Career Counseling" (outline)
- Use framer-motion for fade-in animation

Create src/components/home/StatsSection.tsx:
- 3 stats with animated counters: Students Trained (500+), Interviews Cleared (300+), Projects Completed (1000+)
- Light bg, white cards with shadow
- Use framer-motion for count-up animation

Create src/components/home/CoursesSection.tsx:
- Section title: "Our Courses"
- 6 category cards in a grid (3 cols desktop, 2 tablet, 1 mobile):
  - Civil Engineering (6 courses)
  - Mechanical (4 courses)
  - Electrical (5 courses)
  - Electronics (6 courses)
  - Soft Skills (5 courses)
- Each card: icon, name, course count, "Explore" link
- Light theme cards with border, hover shadow

Create src/components/home/PlacementSection.tsx:
- Section title: "Placement Success"
- Stats: Students Placed, Partner Companies, Average Salary
- CTA button: "Get Placement Support"
- Light bg

Create src/components/home/TestimonialsSection.tsx:
- Section title: "What Our Students Say"
- 3 testimonial cards in a row
- Each: star rating, review text, student name, course, photo placeholder
- Light theme cards with shadow

## Step 9: Create Course Components

Create src/components/courses/CourseCard.tsx:
- White card, border, rounded-lg, hover shadow
- Thumbnail placeholder (gray-200 bg)
- Title, short description
- Price with discount badge
- Level badge (green=beginner, yellow=intermediate, red=advanced)
- Duration
- "Enroll Now" button

Create src/components/courses/CourseFilter.tsx:
- Horizontal filter pills for categories
- Active: blue-600 bg white text
- Inactive: white bg gray text border

## Step 10: Create Video Components

Create src/components/video/VideoWatermark.tsx:
```tsx
'use client'
import { useState, useEffect } from 'react'

export default function VideoWatermark({ email }: { email: string }) {
  const [pos, setPos] = useState({ x: 20, y: 20 })
  useEffect(() => {
    const i = setInterval(() => setPos({ x: Math.random() * 60 + 10, y: Math.random() * 60 + 10 }), 10000)
    return () => clearInterval(i)
  }, [])
  return (
    <div className="absolute text-white text-sm font-semibold opacity-40 pointer-events-none z-10 select-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, textShadow: '1px 1px 2px rgba(0,0,0,0.8)', transform: 'rotate(-15deg)' }}>
      {email}
    </div>
  )
}
```

Create src/components/video/SecureVideoPlayer.tsx:
```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import VideoWatermark from './VideoWatermark'
import { useVideoSecurity } from '@/hooks/useVideoSecurity'

export default function SecureVideoPlayer({ src, userEmail }: { src: string; userEmail: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  useVideoSecurity()

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}) })
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setError('Video loading failed.') })
      return () => hls.destroy()
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => {})
    }
  }, [src])

  return (
    <div className="video-container relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video ref={videoRef} className="w-full h-full" controls playsInline controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />
      <VideoWatermark email={userEmail} />
      {error && <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">{error}</div>}
    </div>
  )
}
```

## Step 11: Create Shared Components

Create src/components/shared/LoadingSpinner.tsx:
```tsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
```

Create src/components/shared/EmptyState.tsx:
```tsx
export default function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-lg font-medium text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  )
}
```

## Step 12: Update Root Layout

Update src/app/layout.tsx:
```tsx
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export const metadata: Metadata = {
  title: "Skillplace Academy - Become Job Ready Engineer in 90 Days",
  description: "Learn Civil, Mechanical, Electrical, Electronics skills with live classes, projects, and placement assistance.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

## Step 13: Create ALL Pages

### Landing Page (src/app/page.tsx)
Combine: HeroSection, StatsSection, CoursesSection, PlacementSection, TestimonialsSection, CTA section

### Courses Page (src/app/courses/page.tsx)
- CourseFilter at top
- CourseCard grid (3 cols)
- Show placeholder course data (hardcoded for now, no Supabase needed yet)

### Course Detail (src/app/courses/[slug]/page.tsx)
- Course header with title, description, thumbnail placeholder, price
- Module/lesson accordion (placeholder data)
- "Enroll Now" button
- Related courses

### Placements Page (src/app/placements/page.tsx)
- Stats section
- Success stories placeholder
- CTA

### Projects Page (src/app/projects/page.tsx)
- Grid of student project cards (placeholder data)

### About Page (src/app/about/page.tsx)
- Mission, vision, why choose Skillplace

### Contact Page (src/app/contact/page.tsx)
- Contact form: name, email, phone, message (use react-hook-form + zod)
- Contact info card
- Map placeholder

### Login Page (src/app/login/page.tsx)
- Email/password form
- Supabase signIn
- Link to register

### Register Page (src/app/register/page.tsx)
- Name, email, password, phone form
- Supabase signUp
- Link to login

### Student Layout (src/app/student/layout.tsx)
```tsx
import StudentSidebar from "@/components/layout/StudentSidebar"
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  )
}
```

### Student Dashboard (src/app/student/dashboard/page.tsx)
- Welcome message
- Enrolled courses progress (placeholder)
- Upcoming live classes (placeholder)
- Quick stats cards

### My Courses (src/app/student/my-courses/page.tsx)
- List of enrolled courses with progress bars (placeholder)

### Certificates (src/app/student/certificates/page.tsx)
- List of certificates (placeholder)

### Tests (src/app/student/tests/page.tsx)
- Available tests list (placeholder)

### Profile (src/app/student/profile/page.tsx)
- Edit profile form (name, phone, avatar)

### Admin Layout (src/app/admin/layout.tsx)
```tsx
import AdminSidebar from "@/components/layout/AdminSidebar"
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 ml-64">{children}</main>
    </div>
  )
}
```

### Admin Dashboard (src/app/admin/page.tsx)
- Stats cards: total students, courses, revenue, leads
- Recent enrollments table placeholder

### Admin Students (src/app/admin/students/page.tsx)
- Students table with search, suspend/activate buttons (placeholder data)

### Admin Courses (src/app/admin/courses/page.tsx)
- Courses table with add/edit/delete (placeholder data)

### Admin Payments (src/app/admin/payments/page.tsx)
- Payments table (placeholder data)

### Admin Leads (src/admin/leads/page.tsx)
- Leads table with status update (placeholder data)

### Admin Certificates (src/app/admin/certificates/page.tsx)
- Issue certificate form + list (placeholder data)

## Step 14: Create .env.example

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## Step 15: Create Database Schema File

Create src/lib/supabase/schema.sql with ALL these tables:
- profiles (id UUID FK auth.users, email, full_name, phone, avatar_url, role, is_active, created_at, updated_at)
- categories (id UUID PK, name, slug, description, icon, order_index, is_active, created_at)
- courses (id UUID PK, category_id FK, title, slug, description, short_description, thumbnail_url, preview_video_url, price, discount_price, duration_hours, level, is_featured, is_active, created_at, updated_at)
- modules (id UUID PK, course_id FK, title, description, order_index, created_at)
- lessons (id UUID PK, module_id FK, title, description, video_url, video_duration, pdf_url, order_index, is_free, created_at)
- enrollments (id UUID PK, user_id FK, course_id FK, status, progress_percent, enrolled_at, completed_at, UNIQUE(user_id, course_id))
- lesson_progress (id UUID PK, user_id FK, lesson_id FK, is_completed, watched_seconds, completed_at, UNIQUE(user_id, lesson_id))
- tests (id UUID PK, course_id FK, title, description, duration_minutes, passing_score, max_attempts, is_active, created_at)
- test_questions (id UUID PK, test_id FK, question, question_type, options JSONB, correct_answer, points, order_index)
- test_attempts (id UUID PK, user_id FK, test_id FK, answers JSONB, score, passed, started_at, completed_at)
- certificates (id UUID PK, user_id FK, course_id FK, certificate_number UNIQUE, issued_at, pdf_url, UNIQUE(user_id, course_id))
- notifications (id UUID PK, user_id FK, target_user_id FK, title, message, type, is_read, metadata JSONB, created_at)
- leads (id UUID PK, name, email, phone, message, source, status, created_at)
- payments (id UUID PK, user_id FK, course_id FK, amount, currency, razorpay_order_id, razorpay_payment_id, razorpay_signature, status, created_at, updated_at)
- live_classes (id UUID PK, course_id FK, title, description, scheduled_at, duration_minutes, meeting_url, recording_url, is_active, created_at)
- student_projects (id UUID PK, user_id FK, course_id FK, title, description, image_url, project_url, is_approved, created_at)
- testimonials (id UUID PK, student_name, student_photo, course_name, rating, review, is_featured, is_active, created_at)

Include RLS policies for all tables (users can read own data, admins can manage all, anyone can read active courses/categories/testimonials, anyone can insert leads).

## FINAL STEP: After ALL files are created

Run: npx tsc --noEmit
Fix any TypeScript errors.
DO NOT git push.
