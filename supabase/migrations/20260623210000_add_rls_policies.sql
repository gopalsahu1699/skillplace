-- RLS Policies for new tables

-- Profiles: anyone can read, anyone can insert (for registration), anyone can update (for profile editing)
DO $$ BEGIN
  CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Enrollments: anyone can read, anyone can insert
DO $$ BEGIN
  CREATE POLICY "Anyone can view enrollments" ON public.enrollments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can update enrollments" ON public.enrollments FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Payments: anyone can read, anyone can insert
DO $$ BEGIN
  CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Certificates: anyone can read, anyone can insert
DO $$ BEGIN
  CREATE POLICY "Anyone can view certificates" ON public.certificates FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert certificates" ON public.certificates FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Notifications: anyone can read, anyone can insert
DO $$ BEGIN
  CREATE POLICY "Anyone can view notifications" ON public.notifications FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Student projects: anyone can read approved, anyone can insert
DO $$ BEGIN
  CREATE POLICY "Anyone can view projects" ON public.student_projects FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert projects" ON public.student_projects FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can update projects" ON public.student_projects FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
