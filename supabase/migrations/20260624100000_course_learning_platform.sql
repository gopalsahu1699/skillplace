-- Course Learning Platform Migration
-- Adds video player, notes, quizzes, and progress tracking

-- 1. Update modules table
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Update lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'pdf', 'quiz', 'text'));
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS text_content TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT true;

-- 3. Update tests table
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL;
ALTER TABLE public.tests ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER;

-- 4. Update test_questions table
ALTER TABLE public.test_questions ADD COLUMN IF NOT EXISTS explanation TEXT;

-- 5. Create course_progress table
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, lesson_id)
);

-- 6. Create user_notes table
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS on new tables
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Course progress policies
DO $$ BEGIN
  CREATE POLICY "Users can manage own progress" ON public.course_progress FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all progress" ON public.course_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User notes policies
DO $$ BEGIN
  CREATE POLICY "Users can manage own notes" ON public.user_notes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 8. Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_course_progress_user ON public.course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_course ON public.course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_course_progress_lesson ON public.course_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_lesson ON public.user_notes(lesson_id);
