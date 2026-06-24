# Admin Panel: Course Content Management

## Goal
Build a comprehensive admin panel where admins can upload and manage all course content:
- Videos (YouTube URLs or direct upload)
- Notes (PDF upload)
- Tests/Quizzes (MCQ, True/False, Short Answer)
- Modules & Lessons management
- Employee permissions for content upload

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text

## Database Tables Required

### 1. `modules` table
```sql
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE INDEX idx_modules_course ON public.modules(course_id);
```

### 2. `lessons` table
```sql
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'quiz', 'text')),
  video_url TEXT,
  video_duration INTEGER,
  pdf_url TEXT,
  text_content TEXT,
  duration_minutes INTEGER,
  is_downloadable BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE INDEX idx_lessons_module ON public.lessons(module_id);
```

### 3. `tests` table
```sql
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  passing_score INTEGER DEFAULT 60,
  max_attempts INTEGER DEFAULT 3,
  time_limit_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active tests" ON public.tests FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage tests" ON public.tests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE INDEX idx_tests_course ON public.tests(course_id);
CREATE INDEX idx_tests_lesson ON public.tests(lesson_id);
```

### 4. `test_questions` table
```sql
CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view test questions" ON public.test_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage test questions" ON public.test_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'employee'))
);
CREATE INDEX idx_test_questions_test ON public.test_questions(test_id);
```

### 5. `employee_permissions` table
```sql
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  can_upload_videos BOOLEAN DEFAULT false,
  can_upload_pdfs BOOLEAN DEFAULT false,
  can_create_quizzes BOOLEAN DEFAULT false,
  can_edit_content BOOLEAN DEFAULT false,
  can_delete_content BOOLEAN DEFAULT false,
  can_manage_modules BOOLEAN DEFAULT false,
  can_view_analytics BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON public.employee_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Employees can view own permissions" ON public.employee_permissions FOR SELECT USING (employee_id = auth.uid());
```

## New Pages to Create

### 1. `src/app/admin-place/content/page.tsx` — Course Content Manager

Main content management page with:
- Course selector dropdown
- Tab navigation: Modules | Lessons | Tests | Employee Permissions
- Overview stats: total modules, lessons, tests, completion rate

### 2. `src/app/admin-place/content/[courseId]/page.tsx` — Course Content Editor

Full editor for a specific course:
- Left sidebar: modules list with lessons
- Main area: content based on selected item
- Add/Edit/Delete modules
- Add/Edit/Delete lessons within modules
- Upload video URLs, PDFs, create text content
- Create/Edit quizzes with questions

### 3. `src/app/admin-place/content/[courseId]/[moduleId]/lessons/[lessonId]/page.tsx` — Lesson Editor

Detailed lesson editor:
- Title, description
- Content type selector (video/pdf/quiz/text)
- Video URL input with preview
- PDF upload (URL input)
- Text content editor (textarea)
- Settings: free, downloadable, duration

### 4. `src/app/admin-place/content/[courseId]/tests/[testId]/page.tsx` — Test/Quiz Editor

Full quiz editor:
- Test title, description, time limit, passing score, max attempts
- Add questions (MCQ, True/False, Short Answer)
- For MCQ: add options, select correct answer
- For True/False: auto options
- For Short Answer: expected answer text
- Edit/Delete/Reorder questions
- Preview test

### 5. `src/app/admin-place/employees/page.tsx` — Employee Management

Manage employee permissions:
- List all employees with their permissions
- Grant/revoke permissions:
  - Upload Videos
  - Upload PDFs
  - Create Quizzes
  - Edit Content
  - Delete Content
  - Manage Modules
  - View Analytics

## Components to Create

### 1. `src/components/admin/ContentManager.tsx`
Main content management interface with course selector and tabs.

### 2. `src/components/admin/ModuleEditor.tsx`
Add/edit/delete modules with drag-and-drop ordering.

### 3. `src/components/admin/LessonEditor.tsx`
Full lesson editor with video URL, PDF upload, text content.

### 4. `src/components/admin/TestEditor.tsx`
Quiz/test editor with question management.

### 5. `src/components/admin/QuestionEditor.tsx`
Single question editor (MCQ/True-False/Short Answer).

### 6. `src/components/admin/EmployeePermissions.tsx`
Employee permission management interface.

### 7. `src/components/admin/Sidebar.tsx`
Content management sidebar with course modules tree.

### 8. `src/components/admin/VideoUploader.tsx`
Video URL input with YouTube/Vimeo preview.

### 9. `src/components/admin/PDFUploader.tsx`
PDF URL input with preview and download.

## Design Requirements
- LIGHT THEME: white bg, blue-600 primary, slate text
- Use existing UI components from `src/components/ui/`
- Responsive design
- Sidebar navigation for content hierarchy
- Modal dialogs for add/edit
- Toast notifications for success/error
- File upload with preview
- Drag-and-drop for ordering

## File Structure
```
src/app/admin-place/
├── content/
│   ├── page.tsx                    (course selector + overview)
│   └── [courseId]/
│       ├── page.tsx                (course content editor)
│       ├── modules/
│       │   └── page.tsx                (add/edit modules)
│       ├── lessons/
│       │   └── [lessonId]/
│       │       └── page.tsx        (lesson editor)
│       └── tests/
│           ├── page.tsx            (tests list)
│           └── [testId]/
│               └── page.tsx        (test editor)
├── employees/
│   └── page.tsx                    (employee permissions)
└── layout.tsx                      (updated sidebar with new links)
```

## Sidebar Updates

Update `src/components/layout/AdminSidebar.tsx` to add:
- Content Management (with sub-items)
- Employee Permissions

## DO NOT
- Do NOT run git push
- Do NOT add new npm dependencies
- Do NOT modify existing working pages
- Do NOT change Supabase client files

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Admin can create/edit/delete modules
- Admin can create/edit/delete lessons with video, PDF, text content
- Admin can create/edit/delete tests with questions
- Admin can grant permissions to employees
- Employee with permissions can upload content
