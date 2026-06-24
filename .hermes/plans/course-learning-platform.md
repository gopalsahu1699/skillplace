# Build Course Learning Platform — Video Player, Notes, Quizzes

## Goal
Create a full course learning experience where students can:
1. Watch chapter-by-chapter videos
2. Read/download chapter notes (PDF)
3. Take quizzes after each chapter
4. Track progress through the course

Admins can:
- Upload videos, notes, and quizzes for each chapter
- Manage course content (add/edit/delete modules, lessons, quizzes)
- Give permission to employees to upload content

## Project Location
- Real path: `D:\web software developement\skillplace\skillplace`
- Junction: `C:\auto_skillplace\skillplace`
- LIGHT THEME: white bg, blue-600 primary, slate text

## Database Schema

### 1. Update `modules` table (already exists, add columns)
```sql
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
```

### 2. Update `lessons` table (already exists, add/modify columns)
```sql
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'quiz', 'text'));
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS text_content TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT true;
```

### 3. Update `tests` table (already exists, add columns)
```sql
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS passing_score INTEGER DEFAULT 60;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
```

### 4. Update `test_questions` table (already exists, add columns)
```sql
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS explanation TEXT;
```

### 5. Create `course_progress` table
```sql
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, lesson_id)
);
```

### 6. Create `user_notes` table (for student personal notes)
```sql
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Enable RLS on new/updated tables
```sql
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Course progress: users manage own, admins view all
DO $$ BEGIN
  CREATE POLICY "Users can manage own progress" ON public.course_progress FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can view all progress" ON public.course_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User notes: users manage own
DO $$ BEGIN
  CREATE POLICY "Users can manage own notes" ON public.user_notes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
```

### 8. Insert sample course content for AutoCAD Civil
```sql
-- Get the course ID
DO $$
DECLARE
  course_uuid UUID;
  module1_uuid UUID;
  module2_uuid UUID;
  lesson1_uuid UUID;
  lesson2_uuid UUID;
  lesson3_uuid UUID;
  test1_uuid UUID;
BEGIN
  SELECT id INTO course_uuid FROM public.courses WHERE slug = 'autocad-civil' LIMIT 1;
  
  IF course_uuid IS NULL THEN
    RETURN;
  END IF;

  -- Create modules if not exist
  INSERT INTO public.modules (course_id, title, description, order_index)
  VALUES 
    (course_uuid, 'Module 1: AutoCAD Fundamentals', 'Learn the basics of AutoCAD interface and essential commands', 1),
    (course_uuid, 'Module 2: Drawing & Annotation', 'Master drawing tools, layers, and annotation techniques', 2),
    (course_uuid, 'Module 3: Advanced Techniques', '3D modeling, rendering, and professional workflows', 3)
  ON CONFLICT DO NOTHING;

  -- Get module IDs
  SELECT id INTO module1_uuid FROM public.modules WHERE course_id = course_uuid AND order_index = 1 LIMIT 1;
  SELECT id INTO module2_uuid FROM public.modules WHERE course_id = course_uuid AND order_index = 2 LIMIT 1;

  -- Create lessons for Module 1
  IF module1_uuid IS NOT NULL THEN
    INSERT INTO public.lessons (module_id, title, content_type, is_free, order_index, duration_minutes)
    VALUES 
      (module1_uuid, 'Introduction to AutoCAD Interface', 'video', true, 1, 15),
      (module1_uuid, 'Basic Drawing Commands', 'video', false, 2, 25),
      (module1_uuid, 'Layers and Properties', 'video', false, 3, 20),
      (module1_uuid, 'Module 1 Notes', 'pdf', false, 4, 0),
      (module1_uuid, 'Module 1 Quiz', 'quiz', false, 5, 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create lessons for Module 2
  IF module2_uuid IS NOT NULL THEN
    INSERT INTO public.lessons (module_id, title, content_type, is_free, order_index, duration_minutes)
    VALUES 
      (module2_uuid, 'Advanced Drawing Tools', 'video', false, 1, 30),
      (module2_uuid, 'Dimensioning & Annotation', 'video', false, 2, 20),
      (module2_uuid, 'Module 2 Notes', 'pdf', false, 3, 0),
      (module2_uuid, 'Module 2 Quiz', 'quiz', false, 4, 0)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get lesson IDs for quizzes
  SELECT id INTO lesson1_uuid FROM public.lessons WHERE module_id = module1_uuid AND order_index = 5 LIMIT 1;
  SELECT id INTO lesson2_uuid FROM public.lessons WHERE module_id = module2_uuid AND order_index = 4 LIMIT 1;

  -- Create quizzes
  IF lesson1_uuid IS NOT NULL THEN
    INSERT INTO public.tests (course_id, lesson_id, title, passing_score, max_attempts, time_limit_minutes)
    VALUES (course_uuid, lesson1_uuid, 'Module 1 Assessment', 60, 3, 15)
    ON CONFLICT DO NOTHING;
  END IF;

  IF lesson2_uuid IS NOT NULL THEN
    INSERT INTO public.tests (course_id, lesson_id, title, passing_score, max_attempts, time_limit_minutes)
    VALUES (course_uuid, lesson2_uuid, 'Module 2 Assessment', 60, 3, 15)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Get test IDs and create questions
  SELECT id INTO test1_uuid FROM public.tests WHERE course_id = course_uuid AND title = 'Module 1 Assessment' LIMIT 1;
  
  IF test1_uuid IS NOT NULL THEN
    INSERT INTO public.test_questions (test_id, question, question_type, options, correct_answer, points, order_index)
    VALUES 
      (test1_uuid, 'What is the default file extension for AutoCAD drawings?', 'mcq', '[".dwg", ".dxf", ".dwf", ".pdf"]', '.dwg', 1, 1),
      (test1_uuid, 'Which command is used to create a line?', 'mcq', '["LINE", "CIRCLE", "RECTANGLE", "ARC"]', 'LINE', 1, 2),
      (test1_uuid, 'What does LAYER command do?', 'mcq', '["Creates lines", "Manages object properties", "Draws layers", "Deletes objects"]', 'Manages object properties', 1, 3),
      (test1_uuid, 'AutoCAD is a 2D drafting software only.', 'true_false', '["True", "False"]', 'False', 1, 4),
      (test1_uuid, 'Which shortcut is used to save a drawing?', 'mcq', '["Ctrl+S", "Ctrl+C", "Ctrl+V", "Ctrl+Z"]', 'Ctrl+S', 1, 5)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

## New Pages to Create

### 1. `src/app/courses/[slug]/learn/page.tsx` — Course Learning Page

This is the main learning interface. It shows:
- Left sidebar: list of modules and lessons (collapsible)
- Main content area: video player / PDF viewer / quiz / text based on lesson type
- Progress bar at top
- "Mark Complete" button
- Navigation: Previous / Next lesson

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Course    AutoCAD Civil    Progress: 33%  │
├────────────┬────────────────────────────────────────┤
│ 📹 Module 1 │  📹 Introduction to AutoCAD Interface  │
│  ├ Lesson 1 │  ┌──────────────────────────────────┐  │
│  ├ Lesson 2 │  │     Video Player / PDF / Quiz    │  │
│  ├ Lesson 3 │  │                                  │  │
│  ├ 📄 Notes  │  │                                  │  │
│  └ 📝 Quiz   │  └──────────────────────────────────┘  │
│ 📹 Module 2 │                                        │
│  ├ Lesson 1 │  📝 Notes Section                      │
│  ├ Lesson 2 │  ┌──────────────────────────────────┐  │
│  ├ 📄 Notes  │  │  Student Notes (editable)        │  │
│  └ 📝 Quiz   │  └──────────────────────────────────┘  │
│ 📹 Module 3 │                                        │
│             │  [← Previous] [Mark Complete] [Next →]│
└────────────┴────────────────────────────────────────┘
```

### 2. `src/app/admin-place/content/page.tsx` — Course Content Management

Admin/employee can:
- Select a course to manage content
- Add/Edit/Delete modules
- Add/Edit/Delete lessons within each module
- Upload video URLs (YouTube/Vimeo/self-hosted)
- Upload PDF notes
- Create/Edit quizzes with questions
- Set permissions (which employees can edit which course)

### 3. `src/components/course/VideoPlayer.tsx` — Video Player Component

- Supports YouTube, Vimeo, and direct video URLs
- Responsive 16:9 aspect ratio
- Play/pause controls
- Progress tracking (remembers where user left off)

### 4. `src/components/course/PDFViewer.tsx` — PDF Viewer Component

- Embeds PDF in iframe
- Download button
- Fullscreen option

### 5. `src/components/course/QuizPlayer.tsx` — Quiz Component

- Shows questions one at a time or all at once
- Multiple choice, true/false, short answer
- Timer (if time limit set)
- Submit button with confirmation
- Shows results after submission
- Shows correct answers with explanations

### 6. `src/components/course/LessonSidebar.tsx` — Sidebar Navigation

- Collapsible module sections
- Shows lesson type icons (video/pdf/quiz)
- Shows completion status (green checkmark)
- Current lesson highlighted
- Free badge for free lessons

### 7. `src/components/course/StudentNotes.tsx` — Notes Component

- Text area for personal notes
- Auto-saves to database
- Per-lesson notes

## Design Requirements
- LIGHT THEME: white bg, blue-600 primary, slate text
- Mobile responsive (sidebar becomes bottom drawer on mobile)
- Video player: 16:9 aspect ratio, rounded corners
- PDF viewer: full width, 80vh height
- Quiz: card-based, clean layout
- Progress indicators throughout
- Smooth transitions between lessons

## DO NOT
- Do NOT run git push
- Do NOT add new npm dependencies (use native HTML5 video, iframe for PDF)
- Do NOT modify existing working pages
- Do NOT change Supabase client files

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Push the SQL migration to Supabase
- Test: Go to `/courses/autocad-civil/learn` — should see full learning interface
- Test: Go to `/admin-place/content` — should see content management
