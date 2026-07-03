CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  expertise TEXT NOT NULL,
  experience TEXT NOT NULL,
  bio TEXT NOT NULL,
  initials TEXT NOT NULL,
  gradient TEXT NOT NULL,
  image TEXT,
  linkedin_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mentors" ON public.mentors FOR SELECT USING (true);
CREATE POLICY "Admins can manage mentors" ON public.mentors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE INDEX IF NOT EXISTS idx_mentors_display_order ON public.mentors(display_order);
