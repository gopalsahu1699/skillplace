-- ============================================
-- Table: enrollments
-- Student enrollments in programs
-- Rows: 7
-- ============================================

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
  course_id UUID NULL DEFAULT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'expired')),
  notes TEXT,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  program_type TEXT CHECK (program_type IN ('online', 'offline', 'hybrid')),
  CONSTRAINT chk_enrollment_target CHECK (course_id IS NOT NULL OR program_id IS NOT NULL)
);

-- RLS
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON public.enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_branch ON public.enrollments(branch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
