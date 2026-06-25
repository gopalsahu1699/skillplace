# Rewrite Admin Training Programs Page — Complete Rebuild

## Task
Delete the current `src/app/admin-place/programs/page.tsx` and rewrite it from scratch. The page must be user-friendly, error-free, and fully functional.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## File to Delete and Rewrite
`src/app/admin-place/programs/page.tsx`

## Database Schema (MUST FOLLOW EXACTLY)

### training_programs table:
```sql
CREATE TABLE public.training_programs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text NULL,
  short_description text NULL,
  program_type text NOT NULL, -- CHECK: 'online', 'offline', 'hybrid'
  branch_id uuid NULL,
  price integer NOT NULL DEFAULT 0,
  discount_price integer NULL,
  duration_weeks integer NULL,
  features text[] null,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (slug),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);
```

### program_courses table (junction):
```sql
CREATE TABLE public.program_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  program_id uuid NULL,
  course_id uuid NULL,
  order_index integer NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE (program_id, course_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE CASCADE
);
```

## Requirements

### 1. Data Fetching
- Fetch training_programs with join: `getRecords('training_programs', undefined, undefined, '*,branches(name)')`
  - CRITICAL: The join must start with `*,` (comma-separated). Use `'*,branches(name)'` NOT `'branches(name)'`
- Fetch branches: `getRecords('branches')`
- Fetch courses: `getRecords('courses')`
- Fetch program_courses: `getRecords('program_courses')`
- Use `Promise.all` for parallel fetching
- Handle errors gracefully — show error message with retry button if fetch fails
- Sort programs by `created_at` descending (newest first)

### 2. Search
- Search by program name
- Null-safe: `(p.name || '').toLowerCase().includes(search.toLowerCase())`

### 3. CRUD Operations
- **Create**: `createRecord('training_programs', body)` then link courses to program_courses
- **Update**: `updateRecord('training_programs', id, body)` then update program_courses (add/remove)
- **Delete**: `deleteRecord('training_programs', id)` — confirm dialog first
- All operations must refetch data after success
- All operations must have try-catch with error toast

### 4. Form Fields
- Name (required)
- Slug (required)
- Description (textarea)
- Short Description
- Program Type (select: online/offline/hybrid, required)
- Branch (select from fetched branches, first option "Select Branch")
- Price (number, required)
- Discount Price (number, optional)
- Duration in weeks (number)
- Features (comma-separated input, stored as text[] array)
- Active status (toggle switch, default true)
- Course linking (checkboxes to link/unlink courses to program_courses)

### 5. Table Columns
- Name
- Program Type (colored badge: blue=offline, purple=online, amber=hybrid)
- Branch
- Price (₹)
- Duration (weeks)
- Courses count (number of linked courses)
- Status (green=active, gray=inactive)
- Actions (Edit, Delete icon buttons)

### 6. UI/UX — User Friendly
- Clean card-based layout
- Table with clear headers and hover rows
- Status badges with colors
- Add Program button prominently placed
- Form in a collapsible card (not modal)
- Empty state: friendly message when no programs found
- Loading state: spinner with 5s timeout then error message
- Search bar with icon
- Delete confirmation using Dialog component (not browser confirm())

### 7. Null Safety — ZERO ERRORS GUARANTEE
- All string operations: `(value || '')`
- All arrays: `(array || [])`
- All optional fields: null checks before access
- `program.branches?.name || 'N/A'`
- `program.features?.join(', ') || ''`
- `program.duration_weeks ? `${program.duration_weeks}w` : 'N/A'`
- Sort: `(a.created_at || '').localeCompare(b.created_at || '')`
- Filter: `(p.name || '').toLowerCase()`

### 8. Type Safety
- Define proper interfaces matching the database schema
- `TrainingProgram` interface with all fields from schema
- `ProgramCourse` interface for junction table
- No `any` unless absolutely necessary (use `unknown` if needed)
- `npx tsc --noEmit` MUST pass with zero errors

### 9. Code Quality
- No TODO comments
- No console.log statements
- No unused imports or variables
- Consistent naming
- Clean component structure
- All async functions have try-catch

## CRITICAL INSTRUCTIONS
1. Write the ENTIRE file from scratch — do not patch the old file
2. The join MUST be `'*,branches(name)'` — missing `*` causes data loss
3. Write production-ready code that compiles and runs without errors
4. Run `npx tsc --noEmit` after writing and fix ALL errors
5. No shortcuts, no TODOs, no partial fixes, no console.log
6. The code must be fully functional: list, search, create, update, delete, link courses
7. All data must be null-safe

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- Verify the file has no lint issues
