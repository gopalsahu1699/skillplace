# Rewrite Admin Content Pages (Course Detail) — Complete Rebuild

## Task
Rewrite 4 files for the course content management pages. These pages have field mismatches with the database schema and missing CRUD functionality.

## Project Location
`C:\auto_skillplace\skillplace` (junction to `D:\web software developement\skillplaceacademy\skillplace`)

## Database Schema (MUST FOLLOW EXACTLY)

### modules table:
```sql
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  order_index integer NULL DEFAULT 0,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### lessons table:
```sql
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid NULL,
  title text NOT NULL,
  content text NULL,
  video_url text NULL,
  duration_minutes integer NULL DEFAULT 0,
  order_index integer NULL DEFAULT 0,
  is_free boolean NULL DEFAULT false,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);
```

### tests table:
```sql
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NULL,
  title text NOT NULL,
  description text NULL,
  passing_score integer NULL DEFAULT 70,
  time_limit_minutes integer NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### test_questions table:
```sql
CREATE TABLE public.test_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid NULL,
  question text NOT NULL,
  options text[] NULL,
  correct_answer integer NULL,
  order_index integer NULL DEFAULT 0,
  created_at timestamptz NULL DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
```

## Files to Rewrite

### 1. `src/app/admin-place/content/[courseId]/page.tsx` (Course Overview)
**Purpose**: Shows course stats and links to modules/lessons/tests management
**Current issues**: References `course.category`, `course.modules.lessons` (not fetched), `lesson.content_type` (doesn't exist)
**Fix**:
- Fetch course with joins: `*,modules(*),modules.lessons(*),tests(*)`
  - Use: `getRecord('courses', courseId, undefined, '*,modules(*,lessons(*)),tests(*)'`
- Show stats: module count, lesson count, test count
- List modules with lesson counts
- List recent lessons (from modules)
- List tests
- All links to sub-pages work
- Null-safe everywhere

### 2. `src/app/admin-place/content/[courseId]/modules/page.tsx` (Modules Management)
**Purpose**: CRUD for modules within a course
**Current issues**: References `mod.lessons` (not fetched via join), uses `ModuleCard` component
**Fix**:
- Fetch modules with lessons join: `getRecords('modules', 'course_id', courseId, 'lessons(*)')`
- Show module cards with title, description, lesson count
- Create/Edit/Delete with Dialog
- Reorder (up/down) functionality
- Null-safe: `(m.lessons || []).length`

### 3. `src/app/admin-place/content/[courseId]/lessons/[lessonId]/page.tsx` (Lesson Editor)
**Purpose**: Edit lesson details
**Current issues**: References `content_type`, `pdf_url`, `text_content`, `is_downloadable` — NONE of these exist in schema. Only `title`, `content`, `video_url`, `duration_minutes`, `order_index`, `is_free`, `is_active` exist
**Fix**:
- Form fields matching schema: Title, Content (textarea), Video URL, Duration (minutes), Order Index, Is Free (toggle), Is Active (toggle)
- Simple save functionality
- No content_type selector — just a content textarea and optional video_url
- Null-safe: `(data.video_url || '')`, `(data.content || '')`

### 4. `src/app/admin-place/content/[courseId]/tests/[testId]/page.tsx` (Test Editor)
**Purpose**: Edit test details and manage questions
**Current issues**: References `max_attempts`, `question_type`, `points`, `explanation` — only `passing_score`, `time_limit_minutes`, `is_active` exist in schema. Question editor references `question_type`, `points`, `explanation` — only `question`, `options` (text[]), `correct_answer`, `order_index` exist
**Fix**:
- Test form: Title, Description, Passing Score, Time Limit, Is Active
- Questions: Question text, Options (comma-separated input that saves as text[]), Correct Answer (index)
- Simple question management (add/remove/edit)
- No `max_attempts`, `question_type`, `points`, `explanation` fields
- Null-safe: `(testData.passing_score || 70)`, `(testData.time_limit_minutes || 0)`

## Shared Requirements

### Data Fetching Pattern
- Use `getRecord` for single records with joins
- Use `getRecords` with filter for lists: `getRecords('modules', 'course_id', courseId, 'lessons(*)')`
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

### UI
- Clean card layouts
- Dialog for create/edit/delete confirmations
- Back navigation links
- Empty states with friendly messages
- Toggle switches for boolean fields (is_free, is_active)

## CRITICAL INSTRUCTIONS
1. Write ALL 4 files from scratch — do not patch existing files
2. Field names MUST match the database schema exactly
3. Write production-ready code that compiles and runs without errors
4. Run `npx tsc --noEmit` after writing and fix ALL errors
5. No shortcuts, no TODOs, no partial fixes, no console.log
6. The code must be fully functional: list, create, update, delete for all entities

## After Completion
- Run `npx tsc --noEmit` — must pass with zero errors
- Verify all files have no lint issues
