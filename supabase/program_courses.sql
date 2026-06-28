-- ============================================
-- Table: program_courses
-- Junction: which courses belong to which programs
-- Rows: 32
-- ============================================

CREATE TABLE IF NOT EXISTS public.program_courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  UNIQUE(program_id, course_id)
);

-- RLS
ALTER TABLE public.program_courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view program courses" ON public.program_courses FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage program courses" ON public.program_courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_program_courses_program ON public.program_courses(program_id);
CREATE INDEX IF NOT EXISTS idx_program_courses_course ON public.program_courses(course_id);
