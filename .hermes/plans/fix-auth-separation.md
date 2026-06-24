# Fix Auth: Separate Client & Server Components to Avoid Sign-in Redirect Issues

## Problem
After login, clicking "Continue Learning" redirects to `/courses/autocad-civil/learn`, but the server component can't read the auth session, so it redirects back to `/login`. The root cause is that the Supabase client stores session in localStorage, but the SSR server component reads from cookies — these two storage mechanisms are not in sync.

## Solution Strategy
Create a clean separation:
1. **Server Component** — only fetches course data (public info, no auth needed)
2. **Client Component** — handles ALL auth checks (enrollment, login status) using localStorage-based Supabase client
3. The client component handles the redirect to login if not authenticated

This way, the page loads instantly (server component shows course info), and the client component handles auth state without any cookie/localStorage mismatch.

## Tasks

### Step 1: Rewrite `src/app/courses/[slug]/learn/page.tsx` (Server Component)

This should ONLY fetch course data. NO auth check, NO enrollment check. Just fetch and pass data:

```ts
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import CourseLearnClient from './CourseLearnClient'

export const dynamic = 'force-dynamic'

export default async function CourseLearnServerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Fetch course (public data, no auth needed)
  const { data: course } = await adminSupabase
    .from('courses')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single()

  if (!course) {
    notFound()
  }

  // Fetch modules with lessons (public data)
  const { data: modules } = await adminSupabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  const sortedModules = (modules || []).map(m => ({
    ...m,
    lessons: (m.lessons || []).sort((a: any, b: any) => a.order_index - b.order_index),
  }))

  // Fetch enrollment count (public data)
  const { count: enrollmentCount } = await adminSupabase
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id)

  return <CourseLearnClient course={course} modules={sortedModules} enrollmentCount={enrollmentCount || 0} />
}
```

### Step 2: Rewrite `src/app/courses/[slug]/learn/CourseLearnClient.tsx` (Client Component)

This handles ALL auth, enrollment, progress, notes, quizzes. It uses the localStorage-based Supabase client which works perfectly in the browser:

- Check auth using `supabase.auth.getUser()` (reads from localStorage)
- If not logged in, show a "Sign In to Learn" overlay with login button (don't redirect — show inline)
- Check enrollment using `supabase` client
- If not enrolled and course is paid, show "Enroll Now" overlay
- If enrolled or free course, show the full learning interface
- All progress tracking, notes, quizzes use `supabase` client

Key: Use `useEffect` to check auth on mount, and listen for `onAuthStateChange` so after login redirect, the component re-renders with the user detected.

### Step 3: Update `src/components/courses/EnrollmentButton.tsx`

Make sure it uses `onAuthStateChange` to detect login:

```ts
useEffect(() => {
  checkEnrollment()
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null)
    if (session?.user && !enrolled) {
      // Re-check enrollment after login
      checkEnrollment()
    }
  })

  return () => subscription.unsubscribe()
}, [courseId])
```

### Step 4: Update `src/app/courses/[slug]/page.tsx` (Course Detail Page)

Same approach — server component fetches course data, client component handles enrollment button:

```ts
import { Badge } from '@/components/ui/badge'
import { Clock, BarChart3, Users, Play, BookOpen, Award, CheckCircle, ArrowRight, Star } from 'lucide-react'
import { getCourseBySlug } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import EnrollmentButton from '@/components/courses/EnrollmentButton'

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  const { count: enrollmentCount } = await adminSupabase
    .from('enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course.id)

  return (
    // ... existing JSX with course data ...
    // EnrollmentButton is a client component that handles auth internally
  )
}
```

### Step 5: Create `src/components/courses/AuthOverlay.tsx`

A simple overlay component shown when user is not logged in:

```tsx
'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

export default function AuthOverlay({ courseSlug }: { courseSlug: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
      <div className="text-center p-8">
        <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Sign in to Start Learning</h3>
        <p className="text-slate-500 mb-6">Access videos, notes, quizzes, and track your progress</p>
        <Link href={`/login?redirectedFrom=/courses/${courseSlug}/learn`}>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Sign In</Button>
        </Link>
      </div>
    </div>
  )
}
```

### Step 6: Create `src/components/courses/EnrollmentOverlay.tsx`

Shown when user is logged in but hasn't enrolled:

```tsx
'use client'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

export default function EnrollmentOverlay({ onEnroll }: { onEnroll: () => void }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
      <div className="text-center p-8">
        <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Enroll to Access Course</h3>
        <p className="text-slate-500 mb-6">Get full access to videos, notes, quizzes, and certificates</p>
        <Button size="lg" onClick={onEnroll} className="bg-blue-600 hover:bg-blue-700">
          Enroll Now
        </Button>
      </div>
    </div>
  )
}
```

## Key Architecture Principle

- **Server Components** = Data fetching only (no auth, no user state)
- **Client Components** = All auth, enrollment, progress, interactive features
- **AuthOverlay / EnrollmentOverlay** = Shown inline when auth/enrollment check fails (no redirect)

This eliminates the redirect loop because:
1. Page loads instantly with course content (server component)
2. Client component checks auth in browser (localStorage)
3. If not logged in → shows "Sign In" overlay (no redirect)
4. User clicks Sign In → goes to login page → logs in → redirected back
5. `onAuthStateChange` fires → component re-renders with user detected
6. Overlay disappears, full content shown

## DO NOT
- Do NOT run git push
- Do NOT use `next/headers` in any client component
- Do NOT redirect from client components for auth (show overlay instead)
- Do NOT use `createSupabaseServerClient` in client components

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Test: Login → Go to `/courses/autocad-civil` → Click "Continue Learning" → Should see learning page
- Test: Logout → Go to `/courses/autocad-civil/learn` → Should see "Sign In" overlay (not redirect)
- Test: Login from overlay → Should see full learning page after auth state change
