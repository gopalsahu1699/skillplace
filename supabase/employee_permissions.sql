-- ============================================
-- Table: employee_permissions
-- Granular permissions for non-admin employees
-- Maps employees to admin section access
-- ============================================

CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  can_manage_courses BOOLEAN DEFAULT false,
  can_manage_programs BOOLEAN DEFAULT false,
  can_manage_enrollments BOOLEAN DEFAULT false,
  can_manage_placements BOOLEAN DEFAULT false,
  can_manage_schedule BOOLEAN DEFAULT false,
  can_manage_students BOOLEAN DEFAULT false,
  can_manage_content BOOLEAN DEFAULT false,
  can_manage_payments BOOLEAN DEFAULT false,
  can_manage_leads BOOLEAN DEFAULT false,
  can_manage_employees BOOLEAN DEFAULT false,
  can_manage_testimonials BOOLEAN DEFAULT false,
  can_manage_coupons BOOLEAN DEFAULT false,
  can_manage_notifications BOOLEAN DEFAULT false,
  can_manage_video_security BOOLEAN DEFAULT false,
  can_manage_certificates BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- RLS
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view employee_permissions" ON public.employee_permissions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can manage employee_permissions" ON public.employee_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee_id ON public.employee_permissions(employee_id);
