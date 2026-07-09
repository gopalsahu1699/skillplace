ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS video_source TEXT DEFAULT 'cloudflare' CHECK (video_source IN ('cloudflare', 'youtube', 'url'));
