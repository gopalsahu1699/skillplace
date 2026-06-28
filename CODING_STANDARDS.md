# Coding Standards — Skillplace Academy

## General Rules

1. Use TypeScript strict mode (`strict: true` in tsconfig)
2. Use functional components only (no class components)
3. Use hooks for state and side effects
4. No `any` type — use `unknown` if type is truly unknown
5. No `as any` casting
6. No `eslint-disable` comments

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CourseCard.tsx` |
| Hooks | camelCase, `use` prefix | `useAuth.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `UserProfile` |
| API routes | lowercase folders | `api/students/` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| DB tables | snake_case | `user_sessions` |
| .sql files | table name | `profiles.sql` |

## Component Rules

```typescript
// Good: Functional component with typed props
interface CourseCardProps {
  course: Course;
  onEnroll?: (id: string) => void;
}

export default function CourseCard({ course, onEnroll }: CourseCardProps) {
  return <div>{course.title}</div>
}

// Good: Default export for page components (Next.js requirement)
export default function CoursesPage() {
  return <div>Courses</div>
}

// Good: Named export for utility functions
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}
```

## API Route Rules

```typescript
// Route handlers must be named: GET, POST, PUT, DELETE, PATCH
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }

// Always return NextResponse
return NextResponse.json({ data }, { status: 200 })

// Always handle errors
try {
  // logic
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json({ error: message }, { status: 500 })
}
```

## Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react'
import { NextResponse } from 'next/server'

// 2. Third-party
import { z } from 'zod'

// 3. Internal (@/)
import { supabase } from '@/lib/supabase/client'
import { admin-api } from '@/lib/admin-api'

// 4. Relative
import { CourseCard } from './CourseCard'
```

## Tailwind CSS Usage

```typescript
// Use cn() for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "text-blue-500",
  className
)} />

// No @/components/ui/dialog — use div-based modals
// Turbopack strips key prop from Radix Dialog
```

## Supabase Query Rules

```typescript
// Always use .maybeSingle() for safe nullable reads
const { data } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', userId)
  .maybeSingle()

// Always use .select() with explicit columns — never SELECT *
const { data } = await supabase
  .from('courses')
  .select('id, title, slug, price')
  .eq('is_active', true)

// Admin queries bypass RLS via adminSupabase
const { data } = await adminSupabase
  .from('enrollments')
  .select('*, profiles(email), training_programs(name)')
```

## Environment Variables

```typescript
// Client-side (NEXT_PUBLIC_ prefix)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Server-side only (never expose)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Always assert non-null with ! for required env vars
if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
```

## Comments

```typescript
// Good: Explain WHY, not WHAT
// Using service role key because RLS blocks anonymous reads of all profiles
const { data } = await adminSupabase.from('profiles').select('*')

// Bad: Explains what (redundant)
// Create a new supabase client
const client = createClient(url, key)
```

## Git Commit Messages

```
feat: add course enrollment flow
fix: correct payment webhook table reference
docs: update API endpoints documentation
refactor: extract admin API client to shared helper
style: format with prettier
chore: add .env.example
```
