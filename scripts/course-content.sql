-- Add missing tables for course content
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  video_duration INTEGER,
  pdf_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  passing_score INTEGER DEFAULT 60,
  max_attempts INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  answers JSONB,
  score INTEGER,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.live_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_url TEXT,
  recording_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
-- Modules: Anyone can view, admins can manage
DO $$ BEGIN
  CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage modules" ON public.modules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Lessons: Anyone can view, admins can manage
DO $$ BEGIN
  CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Tests: Anyone can view active tests
DO $$ BEGIN
  CREATE POLICY "Anyone can view active tests" ON public.tests FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage tests" ON public.tests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Test questions: Anyone can view
DO $$ BEGIN
  CREATE POLICY "Anyone can view test questions" ON public.test_questions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage test questions" ON public.test_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Test attempts: Users can manage own, admins can view all
DO $$ BEGIN
  CREATE POLICY "Users can view own test attempts" ON public.test_attempts FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own test attempts" ON public.test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can view all test attempts" ON public.test_attempts FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Lesson progress: Users can manage own
DO $$ BEGIN
  CREATE POLICY "Users can view own lesson progress" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own lesson progress" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own lesson progress" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Live classes: Anyone can view active
DO $$ BEGIN
  CREATE POLICY "Anyone can view active live classes" ON public.live_classes FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Admins can manage live classes" ON public.live_classes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_modules_course ON public.modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_tests_course ON public.tests(course_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_course ON public.live_classes(course_id);

-- Insert sample course content data
INSERT INTO public.modules (course_id, title, order_index)
SELECT id, 'Module 1: Fundamentals', 1 FROM public.courses WHERE slug = 'autocad-civil'
ON CONFLICT DO NOTHING;

INSERT INTO public.modules (course_id, title, order_index)
SELECT id, 'Module 2: Advanced Techniques', 2 FROM public.courses WHERE slug = 'autocad-civil'
ON CONFLICT DO NOTHING;

-- Get the module IDs for lessons
DO $$
DECLARE
  mod1_id UUID;
  mod2_id UUID;
BEGIN
  SELECT id INTO mod1_id FROM public.modules WHERE title = 'Module 1: Fundamentals' LIMIT 1;
  SELECT id INTO mod2_id FROM public.modules WHERE title = 'Module 2: Advanced Techniques' LIMIT 1;

  IF mod1_id IS NOT NULL THEN
    INSERT INTO public.lessons (module_id, title, order_index, is_free)
    VALUES 
      (mod1_id, 'Introduction to AutoCAD Interface', 1, true),
      (mod1_id, 'Basic Drawing Commands', 2, false),
      (mod1_id, 'Layers and Properties', 3, false)
    ON CONFLICT DO NOTHING;
  END IF;

  IF mod2_id IS NOT NULL THEN
    INSERT INTO public.lessons (module_id, title, order_index, is_free)
    VALUES 
      (mod2_id, '3D Modeling Basics', 1, false),
      (mod2_id, 'Rendering and Visualization', 2, false)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
