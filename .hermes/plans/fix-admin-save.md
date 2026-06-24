# Fix: Admin Panel Data Not Saving to Supabase

## Problem
All admin panel pages (content, employees, certificates, etc.) have forms with Save buttons, but clicking them doesn't actually save data to Supabase. The forms are UI-only with no backend integration.

## Root Cause
The admin pages were created as static UI components without connecting them to Supabase for CRUD operations. They need:
1. State management for form fields
2. Supabase INSERT/UPDATE/DELETE operations on form submit
3. Success/error feedback (toast notifications)
4. Data refresh after save

## Tasks

### Step 1: Create `src/lib/supabase/admin-api.ts`

Centralized API functions for all admin operations:

```ts
import { adminSupabase } from './admin'

// Modules
export async function createModule(courseId: string, data: { title: string; description?: string; order_index: number }) {
  return adminSupabase.from('modules').insert({ course_id: courseId, ...data }).select().single()
}

export async function updateModule(moduleId: string, data: { title?: string; description?: string; order_index?: number }) {
  return adminSupabase.from('modules').update({ ...data, updated_at: new Date().toISOString() }).eq('id', moduleId).select().single()
}

export async function deleteModule(moduleId: string) {
  return adminSupabase.from('modules').delete().eq('id', moduleId)
}

// Lessons
export async function createLesson(moduleId: string, data: { title: string; content_type: string; video_url?: string; pdf_url?: string; text_content?: string; is_free?: boolean; order_index: number }) {
  return adminSupabase.from('lessons').insert({ module_id: moduleId, ...data }).select().single()
}

export async function updateLesson(lessonId: string, data: any) {
  return adminSupabase.from('lessons').update({ ...data, updated_at: new Date().toISOString() }).eq('id', lessonId).select().single()
}

export async function deleteLesson(lessonId: string) {
  return adminSupabase.from('lessons').delete().eq('id', lessonId)
}

// Tests
export async function createTest(courseId: string, data: { title: string; description?: string; passing_score?: number; max_attempts?: number; time_limit_minutes?: number; lesson_id?: string }) {
  return adminSupabase.from('tests').insert({ course_id: courseId, ...data }).select().single()
}

export async function updateTest(testId: string, data: any) {
  return adminSupabase.from('tests').update({ ...data, updated_at: new Date().toISOString() }).eq('id', testId).select().single()
}

export async function deleteTest(testId: string) {
  return adminSupabase.from('tests').delete().eq('id', testId)
}

// Test Questions
export async function createQuestion(testId: string, data: { question: string; question_type: string; options?: string[]; correct_answer: string; explanation?: string; points?: number; order_index: number }) {
  return adminSupabase.from('test_questions').insert({ test_id: testId, ...data }).select().single()
}

export async function updateQuestion(questionId: string, data: any) {
  return adminSupabase.from('test_questions').update(data).eq('id', questionId).select().single()
}

export async function deleteQuestion(questionId: string) {
  return adminSupabase.from('test_questions').delete().eq('id', questionId)
}

// Courses
export async function createCourse(data: any) {
  return adminSupabase.from('courses').insert(data).select().single()
}

export async function updateCourse(courseId: string, data: any) {
  return adminSupabase.from('courses').update({ ...data, updated_at: new Date().toISOString() }).eq('id', courseId).select().single()
}

export async function deleteCourse(courseId: string) {
  return adminSupabase.from('courses').delete().eq('id', courseId)
}

// Profiles/Students
export async function updateProfile(userId: string, data: any) {
  return adminSupabase.from('profiles').update(data).eq('id', userId).select().single()
}

export async function deleteProfile(userId: string) {
  return adminSupabase.from('profiles').delete().eq('id', userId)
}

// Leads
export async function updateLead(leadId: string, data: any) {
  return adminSupabase.from('leads').update(data).eq('id', leadId).select().single()
}

export async function deleteLead(leadId: string) {
  return adminSupabase.from('leads').delete().eq('id', leadId)
}

// Payments
export async function updatePayment(paymentId: string, data: any) {
  return adminSupabase.from('payments').update(data).eq('id', paymentId).select().single()
}

// Certificates
export async function createCertificate(data: { user_id: string; course_id: string; certificate_number: string }) {
  return adminSupabase.from('certificates').insert(data).select().single()
}

export async function deleteCertificate(certId: string) {
  return adminSupabase.from('certificates').delete().eq('id', certId)
}
```

### Step 2: Create `src/components/admin/Toast.tsx`

Simple toast notification component for success/error feedback:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  return { toast, showToast, clearToast: () => setToast(null) }
}
```

### Step 3: Fix `src/app/admin-place/courses/page.tsx`

Connect the Save buttons to Supabase:
- Fetch courses from Supabase on page load
- Add Course form → INSERT into courses table
- Edit Course form → UPDATE courses table
- Delete Course → DELETE from courses table
- Show toast on success/error
- Refresh data after save

### Step 4: Fix `src/app/admin-place/students/page.tsx`

Connect the Save buttons:
- Fetch profiles with role='student' from Supabase
- Add Student form → INSERT auth user + profile
- Edit Student form → UPDATE profile
- Delete Student → DELETE profile
- Show toast on success/error

### Step 5: Fix `src/app/admin-place/leads/page.tsx`

Connect the Save buttons:
- Fetch all leads from Supabase
- Edit Lead form → UPDATE leads table (status, notes)
- Delete Lead → DELETE from leads table
- Show toast on success/error

### Step 6: Fix `src/app/admin-place/payments/page.tsx`

Connect the Save buttons:
- Fetch all payments with profile and course data
- Edit Payment form → UPDATE payments table (status, amount)
- Delete Payment → DELETE from payments table
- Show toast on success/error

### Step 7: Fix `src/app/admin-place/certificates/page.tsx`

Connect the Save buttons:
- Fetch certificates with profile and course data
- Issue Certificate form → INSERT into certificates table
- Delete Certificate → DELETE from certificates table
- Generate certificate number automatically
- Show toast on success/error

### Step 8: Fix `src/app/admin-place/content/page.tsx`

Connect content management:
- Fetch courses for course selector
- Load modules/lessons/tests when course selected
- Add/Edit/Delete modules → Supabase CRUD
- Add/Edit/Delete lessons → Supabase CRUD
- Add/Edit/Delete tests → Supabase CRUD
- Add/Edit/Delete questions → Supabase CRUD
- Show toast on success/error
- Refresh data after each operation

### Step 9: Fix `src/app/admin-place/employees/page.tsx`

Connect employee management:
- Fetch profiles with role='employee' or 'admin'
- Add Employee form → INSERT auth user + profile with role
- Edit Employee form → UPDATE profile
- Delete Employee → DELETE profile
- Show toast on success/error

## Critical Pattern for All Pages

Every form submission handler should follow this pattern:

```ts
async function handleSave() {
  setLoading(true)
  setError('')

  try {
    if (editingId) {
      // Update existing
      const { error } = await adminSupabase
        .from('table_name')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', editingId)
      
      if (error) throw error
      showToast('Updated successfully!', 'success')
    } else {
      // Create new
      const { error } = await adminSupabase
        .from('table_name')
        .insert(formData)
      
      if (error) throw error
      showToast('Created successfully!', 'success')
    }

    // Reset form and refresh data
    resetForm()
    fetchData()
  } catch (err: any) {
    setError(err.message || 'Failed to save')
    showToast(err.message || 'Failed to save', 'error')
  } finally {
    setLoading(false)
  }
}
```

## DO NOT
- Do NOT run git push
- Do NOT add new dependencies
- Do NOT change Supabase client files
- Do NOT modify database schema

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Test: Create a course → Saves to Supabase ✓
- Test: Edit a student → Saves to Supabase ✓
- Test: Delete a lead → Removes from Supabase ✓
- Test: Add a module → Saves to Supabase ✓
- Test: Add a lesson with video URL → Saves to Supabase ✓
- Test: Create a test with questions → Saves to Supabase ✓
- Test: Issue a certificate → Saves to Supabase ✓
