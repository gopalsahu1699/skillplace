# Rewrite ALL Content Management Pages — Complete Rebuild

## Task
Rewrite ALL files in the content management system to match the database schema exactly. Delete old files and write new ones from scratch.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## Database Schema (MUST FOLLOW EXACTLY — NO EXTRA FIELDS)

### modules table:
```sql
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NULL,
  order_index integer NULL DEFAULT 0,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now()
);
```

### lessons table:
```sql
CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NULL,
  video_url text NULL,
  duration_minutes integer NULL DEFAULT 0,
  order_index integer NULL DEFAULT 0,
  is_free boolean NULL DEFAULT false,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now()
);
```
**IMPORTANT: lessons does NOT have content_type, pdf_url, text_content, or is_downloadable**

### tests table:
```sql
CREATE TABLE tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NULL,
  passing_score integer NULL DEFAULT 70,
  time_limit_minutes integer NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now()
);
```
**IMPORTANT: tests does NOT have max_attempts**

### test_questions table:
```sql
CREATE TABLE test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NULL,
  correct_answer integer NULL,
  order_index integer NULL DEFAULT 0,
  created_at timestamptz NULL DEFAULT now()
);
```
**IMPORTANT: test_questions does NOT have question_type, points, explanation**

### test_attempts table:
```sql
CREATE TABLE test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  test_id uuid NULL,
  answers jsonb NULL,
  score integer NULL,
  passed boolean NULL DEFAULT false,
  started_at timestamptz NULL DEFAULT now(),
  completed_at timestamptz NULL
);
```

## Files to Rewrite (8 files)

### 1. `src/app/admin-place/content/page.tsx` (Content Landing Page)
- List all courses with module/lesson/test counts
- Fetch courses with joins: `*,modules(*),modules.lessons(*),tests(*)`
- Show course cards with stats
- Link to course detail page

### 2. `src/app/admin-place/content/[courseId]/page.tsx` (Course Overview)
- Show course stats (modules count, lessons count, tests count)
- List modules with lesson counts
- Link to modules/lessons/tests sub-pages
- Fetch: `getRecord('courses', courseId, '*,modules(*,lessons(*)),tests(*)')`

### 3. `src/app/admin-place/content/[courseId]/modules/page.tsx` (Modules CRUD)
- List modules with reorder (up/down)
- Create/Edit/Delete modules
- Fetch: `getRecords('modules', 'course_id', courseId, 'lessons(*)')`
- Form: Title, Description

### 4. `src/app/admin-place/content/[courseId]/lessons/page.tsx` (Lessons List)
- Module selector (sidebar or tabs)
- List lessons per selected module
- Create/Edit/Delete lessons
- Fetch: `getRecords('lessons', 'module_id', selectedModuleId)`
- Form: Title, Content (textarea), Video URL, Duration, Is Free (toggle)
- NO content_type, pdf_url, text_content, is_downloadable

### 5. `src/app/admin-place/content/[courseId]/lessons/[lessonId]/page.tsx` (Lesson Editor)
- Edit single lesson
- Form: Title, Content (textarea), Video URL, Duration, Is Free (toggle), Is Active (toggle)
- Fetch: `getRecord('lessons', lessonId)`
- NO content_type, pdf_url, text_content, is_downloadable

### 6. `src/app/admin-place/content/[courseId]/tests/page.tsx` (Tests List)
- List tests with question count
- Create/Edit/Delete tests
- Fetch: `getRecords('tests', 'course_id', courseId)`
- Form: Title, Description, Passing Score, Time Limit
- NO max_attempts

### 7. `src/app/admin-place/content/[courseId]/tests/[testId]/page.tsx` (Test Editor)
- Edit test settings
- Manage questions (add/remove/edit)
- Form: Title, Description, Passing Score, Time Limit, Is Active
- Question form: Question text, Options (comma-separated → text[]), Correct Answer (index)
- NO max_attempts, question_type, points, explanation

### 8. `src/app/admin-place/content/[courseId]/[moduleId]/lessons/[lessonId]/page.tsx`
- Same as #5 but accessed via module nested route
- Redirect to #5 or reuse same logic

## Shared Requirements

### Data Fetching
- Use `getRecord` for single records with joins
- Use `getRecords` with filter for lists
- Join syntax: `'*,modules(*,lessons(*)),tests(*)'` (with `*,` prefix)
- Handle errors with try-catch and error state
- Loading spinner with 5s timeout

### Null Safety — ZERO ERRORS
- All strings: `(value || '')`
- All arrays: `(array || [])`
- All numbers: `(value || 0)`
- All `.toLowerCase()`: `(str || '').toLowerCase()`
- All `.sort()`: null-safe comparison
- All optional chaining for nested objects

### Type Safety
- Define interfaces matching the schema exactly
- No `any` types
- `npx tsc --noEmit` MUST pass

### Code Quality
- No TODO, FIXME, HACK comments
- No console.log
- No unused imports
- Clean, consistent code
- All async ops have try-catch
- Do NOT use ModuleCard/LessonCard/TestCard components — inline all JSX

### UI
- Clean card layouts
- Dialog for create/edit/delete confirmations
- Back navigation links
- Empty states with friendly messages
- Toggle switches for boolean fields (is_free, is_active)
- Badge for active/inactive status

## CRITICAL INSTRUCTIONS
1. Write ALL files from scratch — do not patch existing files
2. Field names MUST match the database schema — NO extra fields
3. Write production-ready code that compiles and runs without errors
4. Run `npx tsc --noEmit` after writing and fix ALL errors
5. No shortcuts, no TODOs, no partial fixes, no console.log
6. The code must be fully functional: list, create, update, delete for all entities
7. All data must be null-safe

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- Verify all files have no lint issues
