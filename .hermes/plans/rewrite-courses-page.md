# Rewrite Admin Courses Page — Complete Rebuild

## Task
Delete the current `src/app/admin-place/courses/page.tsx` and rewrite it from scratch. The page must be user-friendly, error-free, and fully functional.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Delete and Rewrite
`src/app/admin-place/courses/page.tsx`

## Requirements

### 1. Data Fetching
- Fetch courses with a join to get branch names: use `getRecords('courses', undefined, undefined, 'branches(name)')`
- Fetch branches for the dropdown: use `getRecords('branches')`
- Use `Promise.all` to fetch both in parallel
- Handle errors gracefully — show an error message if fetch fails, not an infinite spinner
- Sort courses by `created_at` descending (newest first)

### 2. Search
- Search by course title and slug
- Null-safe: `(c.title || '').toLowerCase().includes(search.toLowerCase())`
- Debounce not required but null safety is mandatory

### 3. CRUD Operations
- **Create**: `createRecord('courses', formData)` — show success toast
- **Update**: `updateRecord('courses', id, formData)` — show success toast
- **Delete**: `deleteRecord('courses', id)` — confirm dialog first, show success toast
- All operations should refetch data after success
- All operations must have try-catch with error handling

### 4. Form Fields
- Title (required)
- Slug (required)
- Description (textarea)
- Short Description
- Price (number, required)
- Discount Price (number, optional)
- Duration in hours (number)
- Level (select: beginner/intermediate/advanced)
- Branch (select from fetched branches, first option "Select Branch")
- Active status (toggle switch, default true)

### 5. UI/UX — User Friendly
- Clean card-based layout
- Table with clear columns: Title, Branch, Price, Duration, Status, Actions
- Status shown as colored badge (green=active, gray=inactive)
- Edit and Delete buttons as icon buttons with hover effects
- Add Employee button prominently placed
- Form in a modal/dialog or inline card (collapsible)
- Empty state: friendly message when no courses found
- Loading state: spinner with timeout (5s max, then show error)
- Search bar with icon

### 6. Null Safety — ZERO ERRORS GUARANTEE
- All string operations must use `|| ''` fallback
- All `.toLowerCase()`, `.includes()`, `.sort()` must be null-safe
- All optional fields (`discount_price`, `duration_hours`, `short_description`, `bio`, `department`) must handle null/undefined
- Branch name display: `course.branches?.name || 'N/A'`
- No TypeScript `any` unless absolutely necessary

### 7. Type Safety
- Define a proper `Course` interface matching the database schema
- Use proper TypeScript types throughout
- `npx tsc --noEmit` MUST pass with zero errors

### 8. Imports
```ts
'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, X } from 'lucide-react'
import { getRecords, createRecord, updateRecord, deleteRecord } from '@/lib/admin-api'
import { notify } from '@/lib/notifications'
```

### 9. Code Quality
- No TODO comments
- No console.log statements
- Consistent naming conventions
- Clean component structure
- All functions are async with proper error handling
- No unused imports or variables

## CRITICAL INSTRUCTIONS
1. Write the ENTIRE file from scratch — do not patch the old file
2. Write production-ready code that compiles and runs without errors
3. Run `npx tsc --noEmit` after writing and fix ALL errors
4. No shortcuts, no TODOs, no partial fixes
5. The code must be fully functional: list, search, create, update, delete
6. All data must be null-safe

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- Verify the file has no lint issues
