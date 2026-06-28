-- ============================================
-- Table: student_projects
-- Student-uploaded project showcase
-- Currently empty
-- ============================================

CREATE TABLE IF NOT EXISTS public.student_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view approved projects" ON public.student_projects FOR SELECT USING (is_approved = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own projects" ON public.student_projects FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_projects_user ON public.student_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_course ON public.student_projects(course_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_approved ON public.student_projects(is_approved) WHERE is_approved = true;
