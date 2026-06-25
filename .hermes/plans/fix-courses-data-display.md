# Fix Courses Page — Data Not Showing Correctly

## Issue
The rewritten courses page is not showing data correctly. The schema shows the actual column names in the database.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## Database Schema (Actual)
```sql
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text NULL,
  short_description text NULL,
  thumbnail_url text NULL,
  price integer NOT NULL DEFAULT 0,
  discount_price integer NULL,
  duration_hours integer NULL,
  level text NULL DEFAULT 'beginner',
  branch_id uuid NULL,
  is_featured boolean NULL DEFAULT false,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  updated_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE (slug),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL
);
```

Key observations:
- `thumbnail_url` exists (not used in current UI but available)
- `is_featured` exists (could be useful)
- `level` has CHECK constraint: only 'beginner', 'intermediate', 'advanced'
- `branch_id` FK → branches(id)

## File to Modify
`src/app/admin-place/courses/page.tsx`

## Tasks

### 1. Verify data fetching is correct
Read the current file and check:
- Is the join `branches(name)` correct? (courses.branch_id → branches.id)
- Does the `Course` interface match the actual schema above?
- Are all field names in the code matching the DB columns exactly?

### 2. Fix any mismatches
Common issues:
- Field name mismatch (code uses different name than DB column)
- The join might return `branches` as an object — verify it's accessed as `course.branches?.name`
- `created_at` sorting — make sure it's parsing dates correctly

### 3. Add thumbnail display (optional but nice)
If `thumbnail_url` exists, show a small thumbnail in the table

### 4. Add is_featured badge
Show a star/badge for featured courses

### 5. Verify price display
Price is stored as integer (likely in paise, so ₹4999 = 4999 paise = ₹49.99). 
Check if the display should divide by 100 or show as-is.
Current code shows `₹{course.price}` — if price is in rupees (4999 = ₹4999), this is correct.
If price is in paise, use `₹{(course.price / 100).toLocaleString()}`

### 6. Ensure no runtime errors
- All `.sort()` must be null-safe: `(a, b) => (a.created_at || '').localeCompare(b.created_at || '')`
- All `.toLowerCase()` must be null-safe
- All optional chaining for nested objects

### 7. Debug logging (temporary)
Add ONE console.log after data fetch to verify the data shape:
```ts
console.log('Fetched courses:', data)
```
Remove this after testing.

## CRITICAL INSTRUCTIONS
1. Write production-ready code without errors
2. Run `npx tsc --noEmit` after changes and fix ALL errors
3. No shortcuts, no TODOs, no partial fixes
4. The code must display all course data correctly in the table
5. All field names MUST match the database schema exactly

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- The page should show all courses with correct data in the table
