CREATE TABLE IF NOT EXISTS public.partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  short TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Sponsor',
  logo TEXT,
  color TEXT NOT NULL DEFAULT 'bg-blue-600',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_display_order ON public.partners(display_order);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partners" ON public.partners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage partners" ON public.partners
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO public.partners (name, short, description, type, logo, color, display_order) VALUES
  ('Autommensor Automation Pvt Ltd', 'Autommensor', 'Industrial automation & control systems', 'Sponsor', 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Logo%20for%20Automensor.png', 'bg-blue-600', 1),
  ('Dozert AI', 'Dozert', 'AI-powered technology solutions', 'Sponsor', 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Dozer%20ai.png', 'bg-violet-600', 2),
  ('Himanshu Construction', 'Himanshu', 'Civil construction & infrastructure', 'Sponsor', 'https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/Himanshu.png', 'bg-amber-600', 3)
ON CONFLICT DO NOTHING;
