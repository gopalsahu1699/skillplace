-- ============================================
-- Migration: Fix lessons table for video system
-- Run this in Supabase Dashboard SQL Editor
-- ============================================

-- 1. Add missing columns to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'text';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_id TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS r2_source_key TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS r2_original_filename TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS stream_status TEXT DEFAULT 'pending';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT false;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add content_type constraint (safe - won't fail if some rows don't match)
UPDATE public.lessons SET content_type = 'video' WHERE video_id IS NOT NULL OR r2_source_key IS NOT NULL OR (video_url IS NOT NULL AND video_url != '');
UPDATE public.lessons SET content_type = 'pdf' WHERE pdf_url IS NOT NULL AND (content_type IS NULL OR content_type = 'text');
UPDATE public.lessons SET content_type = 'text' WHERE content_type IS NULL;

-- 3. Update the specific lesson that was failing
UPDATE public.lessons SET content_type = 'video' WHERE id = 'd769d41d-d234-4435-a658-28be1e56468c';

-- 4. Create course_enrollments table if not exists
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(user_id, course_id)
);

-- 5. Create video_playback_log table if not exists
CREATE TABLE IF NOT EXISTS public.video_playback_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  action TEXT NOT NULL CHECK (action IN ('stream', 'token_generate', 'token_refresh', 'access_denied', 'error')),
  watch_duration_seconds INTEGER DEFAULT 0,
  bytes_served BIGINT DEFAULT 0,
  range_requested TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_playback_log_user ON public.video_playback_log(user_id);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_lesson ON public.video_playback_log(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_created ON public.video_playback_log(created_at);

-- 6. Create video_forensic_samples table if not exists
CREATE TABLE IF NOT EXISTS public.video_forensic_samples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  sample_timestamp TIMESTAMPTZ DEFAULT NOW(),
  video_current_time REAL DEFAULT 0,
  screenshot_b64 TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forensic_samples_user ON public.video_forensic_samples(user_id);
CREATE INDEX IF NOT EXISTS idx_forensic_samples_lesson ON public.video_forensic_samples(lesson_id);

-- 7. Add flagged/warning/revoke columns to video_forensic_samples
ALTER TABLE public.video_forensic_samples ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false;
ALTER TABLE public.video_forensic_samples ADD COLUMN IF NOT EXISTS flag_reason TEXT;
ALTER TABLE public.video_forensic_samples ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE public.video_forensic_samples ADD COLUMN IF NOT EXISTS warning_sent_at TIMESTAMPTZ;
ALTER TABLE public.video_forensic_samples ADD COLUMN IF NOT EXISTS access_revoked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_forensic_samples_flagged ON public.video_forensic_samples(flagged) WHERE flagged = true;

-- 8. Create video_leak_reports table
CREATE TABLE IF NOT EXISTS public.video_leak_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  sample_id UUID REFERENCES public.video_forensic_samples(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  detected_by TEXT DEFAULT 'system' CHECK (detected_by IN ('system', 'admin', 'manual')),
  warning_sent_at TIMESTAMPTZ,
  access_revoked_at TIMESTAMPTZ,
  revoke_duration_days INTEGER DEFAULT 30,
  admin_notes TEXT,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leak_reports_user ON public.video_leak_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_leak_reports_status ON public.video_leak_reports(status);
CREATE INDEX IF NOT EXISTS idx_leak_reports_created ON public.video_leak_reports(created_at);
