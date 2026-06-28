-- ============================================
-- Table: training_programs
-- Bundled program offerings (online/offline/hybrid)
-- Rows: 5
-- ============================================

CREATE TABLE IF NOT EXISTS public.training_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  program_type TEXT CHECK (program_type IN ('online', 'offline', 'hybrid')),
  branch_id UUID REFERENCES public.branches(id),
  price INTEGER NOT NULL DEFAULT 0,
  discount_price INTEGER,
  duration_weeks INTEGER,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active programs" ON public.training_programs FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage programs" ON public.training_programs FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_programs_slug ON public.training_programs(slug);
CREATE INDEX IF NOT EXISTS idx_training_programs_branch ON public.training_programs(branch_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_type ON public.training_programs(program_type);
