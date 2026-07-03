-- ============================================
-- Migration: Add granular permission columns
-- Run this against your Supabase database
-- Safe to run on both fresh and existing DBs
-- ============================================

-- Ensure the table exists first
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

-- Add any missing columns (safe for existing tables)
ALTER TABLE public.employee_permissions
ADD COLUMN IF NOT EXISTS can_manage_placements BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_schedule BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_testimonials BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_coupons BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_notifications BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_video_security BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_certificates BOOLEAN DEFAULT false;

-- Migrate existing broad permissions to new granular columns
UPDATE public.employee_permissions
SET
  can_manage_testimonials = true,
  can_manage_coupons = true
WHERE can_manage_courses = true
  AND (can_manage_testimonials = false OR can_manage_coupons = false);

UPDATE public.employee_permissions
SET
  can_manage_schedule = true
WHERE can_manage_programs = true
  AND can_manage_schedule = false;

UPDATE public.employee_permissions
SET
  can_manage_placements = true
WHERE can_manage_enrollments = true
  AND can_manage_placements = false;

UPDATE public.employee_permissions
SET
  can_manage_video_security = true
WHERE can_manage_students = true
  AND can_manage_video_security = false;

UPDATE public.employee_permissions
SET
  can_manage_notifications = true
WHERE can_manage_content = true
  AND can_manage_notifications = false;

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
