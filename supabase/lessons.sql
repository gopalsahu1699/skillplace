-- ============================================
-- Table: lessons
-- Individual video/content lessons within modules
-- Rows: 1
-- ============================================

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  video_id TEXT,
  r2_source_key TEXT,
  r2_original_filename TEXT,
  stream_status TEXT DEFAULT 'pending',
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists (idempotent migration)
DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_id TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS r2_source_key TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS r2_original_filename TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS stream_status TEXT DEFAULT 'pending';
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- RLS
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add content_type column if not exists
DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video';
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Backfill content_type for existing lessons based on available data
UPDATE public.lessons
SET content_type = CASE
  WHEN video_url IS NOT NULL OR video_id IS NOT NULL OR r2_source_key IS NOT NULL THEN 'video'
  WHEN pdf_url IS NOT NULL THEN 'pdf'
  ELSE 'video'
END
WHERE content_type IS NULL OR content_type = '';

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_duration INTEGER;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS pdf_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS text_content TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

DO $$ BEGIN
  ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Backfill content_type for existing lessons
UPDATE public.lessons SET content_type = 'video' WHERE content_type IS NULL AND (video_url IS NOT NULL OR video_id IS NOT NULL);
UPDATE public.lessons SET content_type = 'text' WHERE content_type IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_video_id ON public.lessons(video_id) WHERE video_id IS NOT NULL;
