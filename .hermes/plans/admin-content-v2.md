# Admin Panel: Course Content Management

## Goal
Build a comprehensive admin panel where admins can upload and manage all course content:
- Videos (YouTube URLs)
- Notes (PDF URLs)
- Tests/Quizzes (MCQ, True/False, Short Answer)
- Modules & Lessons management

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text

## Database Tables (ALREADY EXIST)
- modules (id, course_id, title, description, order_index, created_at)
- lessons (id, module_id, title, description, content_type, video_url, pdf_url, text_content, order_index, is_free, created_at)
- tests (id, course_id, lesson_id, title, description, passing_score, max_attempts, time_limit_minutes, is_active, created_at)
- test_questions (id, test_id, question, question_type, options, correct_answer, explanation, points, order_index)
- courses (id, title, slug, description, price, discount_price, duration_hours, level, category_id, is_active)
- categories (id, name, slug)

## Tasks

### 1. Create `src/app/admin-place/content/page.tsx`

Main content management page:
- Fetch all courses from Supabase
- Show course cards with thumbnail, title, category
- Click on course → go to course detail content editor
- Show stats: total modules, lessons, tests per course

### 2. Create `src/app/admin-place/content/[courseId]/page.tsx`

Course content editor page:
- Fetch course details, modules, lessons
- Left sidebar: modules list with expandable lessons
- Main area: shows selected module/lesson details
- Buttons: Add Module, Add Lesson, Edit, Delete
- For each lesson: show content type badge, video URL, PDF URL
- For each test: show questions count, passing score

### 3. Create `src/app/admin-place/content/[courseId]/modules/page.tsx`

Module management:
- List all modules with order
- Add new module (title, description, order)
- Edit existing module
- Delete module (with confirmation)
- Reorder modules (up/down arrows)

### 4. Create `src/app/admin-place/content/[courseId]/lessons/page.tsx`

Lesson management:
- List all lessons in selected module
- Add new lesson form:
  - Title
  - Content type (video/pdf/quiz/text)
  - Video URL (for video type)
  - PDF URL (for pdf type)
  - Text content (for text type)
  - Duration (minutes)
  - Is free (checkbox)
- Edit existing lesson
- Delete lesson (with confirmation)

### 5. Create `src/app/admin-place/content/[courseId]/lessons/[lessonId]/page.tsx`

Individual lesson editor:
- Full form to edit lesson
- Video preview (YouTube embed if URL provided)
- PDF preview (iframe if URL provided)
- Text content editor (textarea)
- Save/Cancel buttons

### 6. Create `src/app/admin-place/content/[courseId]/tests/page.tsx`

Test management:
- List all tests for the course
- Add new test button
- Show test details: title, questions count, passing score, time limit
- Click to edit test questions

### 7. Create `src/app/admin-place/content/[courseId]/tests/[testId]/page.tsx`

Test editor:
- Edit test title, description, passing score, time limit
- List all questions
- Add question form:
  - Question text
  - Question type (MCQ / True-False / Short Answer)
  - For MCQ: add multiple options, select correct answer
  - For True-False: auto True/False options
  - For Short Answer: expected answer text
  - Points
  - Explanation (optional)
- Edit existing question
- Delete question
- Reorder questions

### 8. Update `src/components/layout/AdminSidebar.tsx`

Add new navigation items:
- Content Management (icon: BookOpen) → /admin-place/content
- Keep existing: Dashboard, Employees, Students, Courses, Payments, Leads, Certificates

### 9. Create `src/components/admin/ModuleCard.tsx`

Card component for displaying module info with edit/delete actions.

### 10. Create `src/components/admin/LessonCard.tsx`

Card component for displaying lesson info with type icon and edit/delete actions.

### 11. Create `src/components/admin/TestCard.tsx`

Card component for displaying test info with question count and edit/delete actions.

## Design Requirements
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use existing UI components from `src/components/ui/` (Button, Card, Badge, Input, Textarea, Dialog)
- Responsive design
- Sidebar navigation for content hierarchy
- Modal dialogs for add/edit forms
- Toast/success messages for actions
- Icons from lucide-react

## Data Fetching
- Use `adminSupabase` from `@/lib/supabase/admin` for all data operations (bypasses RLS)
- Server components for data fetching
- Client components for interactive forms

## DO NOT
- Do NOT run git push
- Do NOT try to create database tables (they already exist)
- Do NOT modify Supabase client files
- Do NOT change existing working pages

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Admin can create/edit/delete modules for any course
- Admin can create/edit/delete lessons with video, PDF, text content
- Admin can create/edit/delete tests with questions
- All data is saved to Supabase
