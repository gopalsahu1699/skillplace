# Admin Rules — Skillplace Academy

## Admin Access Control

### Role Verification
Admin status requires:
1. `profiles.role === 'admin'` OR
2. `employees.role === 'admin'` (matched by email, not ID)

### Admin Layout Protection
```typescript
// src/app/admin-place/layout.tsx
// Must check admin role before rendering
// Redirect to /login if not authenticated
// Show "Access denied" if not admin
```

## Admin Panel Sections

### Dashboard (`/admin-place`)
- Overview stats (students, enrollments, revenue)
- Recent activity
- Quick actions

### Courses Management (`/admin-place/courses`)
- List all courses
- Create/edit course (title, description, price, branch, level)
- Toggle active/featured status
- Upload thumbnail

### Content Management (`/admin-place/content`)
- View course content tree (modules → lessons)
- Add/edit modules (title, order)
- Add/edit lessons (title, video, content, duration)
- Add/edit tests (title, passing score, time limit)
- Add/edit test questions (MCQ, options, correct answer)

### Programs Management (`/admin-place/programs`)
- List all programs
- Create/edit program (name, description, type, branch, price, features)
- Manage program courses (add/remove/reorder)

### Employees Management (`/admin-place/employees`)
- List all staff
- Add/edit employee (name, email, role, department, bio)
- Toggle active status

### Students Management (`/admin-place/students`)
- List all students
- View student profile + enrollments
- Batch management (create batch, assign students)
- Bulk student import

### Enrollments (`/admin-place/enrollments`)
- View all enrollments
- Filter by status, program, branch
- Mark as completed

### Certificates (`/admin-place/certificates`)
- View issued certificates
- Bulk certificate generation
- Issue certificates for batches or individual students

### Payments (`/admin-place/payments`)
- View all payment records
- Filter by status
- Refund management

### Coupons (`/admin-place/coupons`)
- View all coupons
- Create/edit coupon (code, discount, limits, validity)
- Toggle active status

### Leads (`/admin-place/leads`)
- View website inquiries
- Mark as contacted/converted/closed

### Testimonials (`/admin-place/testimonials`)
- View all testimonials
- Approve/reject
- Toggle featured

### Schedule (`/admin-place/schedule`)
- Manage live class schedule
- Create/edit sessions

### Notifications (`/admin-place/notifications`)
- View notification history
- Send notifications

### Placements (`/admin-place/placements`)
- Manage placement records
- Showcase placed students

## Admin API

### `/api/admin` — Universal CRUD Proxy
```
GET  /api/admin?table=programs&join=*,program_courses(courses(title))
GET  /api/admin?table=courses&filter=branch_id&value=xxx
POST /api/admin?table=programs
PUT  /api/admin?table=programs&id=eq.xxx
DELETE /api/admin?table=programs&id=eq.xxx
```

### Allowed Tables
```typescript
const ALLOWED_TABLES = [
  'profiles', 'courses', 'modules', 'lessons', 'enrollments',
  'employees', 'branches', 'coupons', 'training_programs',
  'program_courses', 'certificates', 'leads', 'testimonials',
  'payments', 'user_sessions', 'notifications'
]
```

### Security
- Only admin users can access
- Service role key bypasses RLS
- Table whitelist prevents arbitrary table access
- Input validation on all operations

## Admin Client Helper
```typescript
// src/lib/admin-api.ts
export async function getRecords(table: string, filter?: string, value?: string, join?: string) {
  const params = new URLSearchParams({ table })
  if (filter && value) { params.set('filter', filter); params.set('value', value) }
  if (join) params.set('join', join)
  const res = await fetch(`/api/admin?${params.toString()}`)
  return (await res.json()).data
}
```
