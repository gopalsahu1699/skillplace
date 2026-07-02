CREATE TABLE IF NOT EXISTS public.video_playback_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  action TEXT NOT NULL DEFAULT 'stream',
  watch_duration_seconds INTEGER DEFAULT 0,
  bytes_served BIGINT DEFAULT 0,
  range_requested TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.video_playback_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role only" ON public.video_playback_log
    FOR ALL USING (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE INDEX IF NOT EXISTS idx_video_playback_log_user ON public.video_playback_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_lesson ON public.video_playback_log(lesson_id);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_action ON public.video_playback_log(action);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_created ON public.video_playback_log(created_at);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_ip ON public.video_playback_log(ip_address);
