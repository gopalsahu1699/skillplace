-- ============================================
-- Enterprise-Grade Row Level Security Policies
-- SkillPlace Academy
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_playback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_forensic_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_leak_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_disciplines ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_employee()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM employees
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_employee()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin() OR is_employee();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES
-- ============================================

DROP POLICY IF EXISTS "users_view_own_profile" ON profiles;
CREATE POLICY "users_view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "admins_view_all_profiles" ON profiles;
CREATE POLICY "admins_view_all_profiles" ON profiles
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "employees_view_profiles" ON profiles;
CREATE POLICY "employees_view_profiles" ON profiles
  FOR SELECT USING (is_employee());

DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admins_manage_profiles" ON profiles;
CREATE POLICY "admins_manage_profiles" ON profiles
  FOR ALL USING (is_admin());

-- ============================================
-- EMPLOYEES
-- ============================================

DROP POLICY IF EXISTS "admins_manage_employees" ON employees;
CREATE POLICY "admins_manage_employees" ON employees
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "employees_view_own" ON employees;
CREATE POLICY "employees_view_own" ON employees
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================
-- EMPLOYEE PERMISSIONS
-- ============================================

DROP POLICY IF EXISTS "admins_manage_permissions" ON employee_permissions;
CREATE POLICY "admins_manage_permissions" ON employee_permissions
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "employees_view_own_permissions" ON employee_permissions;
CREATE POLICY "employees_view_own_permissions" ON employee_permissions
  FOR SELECT USING (employee_id IN (
    SELECT id FROM employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

-- ============================================
-- COURSES (Public read for active courses)
-- ============================================

DROP POLICY IF EXISTS "public_view_active_courses" ON courses;
CREATE POLICY "public_view_active_courses" ON courses
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_courses" ON courses;
CREATE POLICY "admins_manage_courses" ON courses
  FOR ALL USING (is_admin());

-- ============================================
-- LESSONS
-- ============================================

DROP POLICY IF EXISTS "public_view_free_or_active_lessons" ON lessons;
CREATE POLICY "public_view_free_or_active_lessons" ON lessons
  FOR SELECT USING (
    is_active = true AND (is_free = true OR is_admin())
  );

DROP POLICY IF EXISTS "enrolled_users_view_lessons" ON lessons;
CREATE POLICY "enrolled_users_view_lessons" ON lessons
  FOR SELECT USING (
    is_active = true AND EXISTS (
      SELECT 1 FROM modules m
      JOIN course_enrollments ce ON ce.course_id = m.course_id
      WHERE m.id = module_id AND ce.user_id = auth.uid() AND ce.status IN ('active', 'completed')
      UNION
      SELECT 1 FROM modules m
      JOIN program_courses pc ON pc.course_id = m.course_id
      JOIN enrollments e ON e.program_id = pc.program_id
      WHERE m.id = module_id AND e.user_id = auth.uid() AND e.status IN ('active', 'completed')
    )
  );

DROP POLICY IF EXISTS "admins_manage_lessons" ON lessons;
CREATE POLICY "admins_manage_lessons" ON lessons
  FOR ALL USING (is_admin());

-- ============================================
-- MODULES
-- ============================================

DROP POLICY IF EXISTS "public_view_modules" ON modules;
CREATE POLICY "public_view_modules" ON modules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admins_manage_modules" ON modules;
CREATE POLICY "admins_manage_modules" ON modules
  FOR ALL USING (is_admin());

-- ============================================
-- ENROLLMENTS
-- ============================================

DROP POLICY IF EXISTS "users_view_own_enrollments" ON enrollments;
CREATE POLICY "users_view_own_enrollments" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_enrollments" ON enrollments;
CREATE POLICY "admins_manage_enrollments" ON enrollments
  FOR ALL USING (is_admin());

-- ============================================
-- COURSE ENROLLMENTS
-- ============================================

DROP POLICY IF EXISTS "users_view_own_course_enrollments" ON course_enrollments;
CREATE POLICY "users_view_own_course_enrollments" ON course_enrollments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_course_enrollments" ON course_enrollments;
CREATE POLICY "admins_manage_course_enrollments" ON course_enrollments
  FOR ALL USING (is_admin());

-- ============================================
-- COURSE PROGRESS
-- ============================================

DROP POLICY IF EXISTS "users_manage_own_progress" ON course_progress;
CREATE POLICY "users_manage_own_progress" ON course_progress
  FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_view_all_progress" ON course_progress;
CREATE POLICY "admins_view_all_progress" ON course_progress
  FOR SELECT USING (is_admin());

-- ============================================
-- PAYMENTS
-- ============================================

DROP POLICY IF EXISTS "users_view_own_payments" ON payments;
CREATE POLICY "users_view_own_payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_payments" ON payments;
CREATE POLICY "admins_manage_payments" ON payments
  FOR ALL USING (is_admin());

-- ============================================
-- CERTIFICATES
-- ============================================

DROP POLICY IF EXISTS "users_view_own_certificates" ON certificates;
CREATE POLICY "users_view_own_certificates" ON certificates
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_certificates" ON certificates;
CREATE POLICY "admins_manage_certificates" ON certificates
  FOR ALL USING (is_admin());

-- ============================================
-- NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "users_view_own_notifications" ON notifications;
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_notifications" ON notifications;
CREATE POLICY "admins_manage_notifications" ON notifications
  FOR ALL USING (is_admin());

-- ============================================
-- USER SESSIONS
-- ============================================

DROP POLICY IF EXISTS "users_view_own_sessions" ON user_sessions;
CREATE POLICY "users_view_own_sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_view_all_sessions" ON user_sessions;
CREATE POLICY "admins_view_all_sessions" ON user_sessions
  FOR SELECT USING (is_admin());

-- ============================================
-- REVOKED TOKENS (No direct user access)
-- ============================================

DROP POLICY IF EXISTS "service_role_only" ON revoked_tokens;
CREATE POLICY "service_role_only" ON revoked_tokens
  FOR ALL USING (false);

-- ============================================
-- LOGIN ATTEMPTS (No direct user access)
-- ============================================

DROP POLICY IF EXISTS "no_user_access" ON login_attempts;
CREATE POLICY "no_user_access" ON login_attempts
  FOR ALL USING (false);

-- ============================================
-- VIDEO PLAYBACK LOG (No direct user access)
-- ============================================

DROP POLICY IF EXISTS "service_role_only_video_log" ON video_playback_log;
CREATE POLICY "service_role_only_video_log" ON video_playback_log
  FOR ALL USING (false);

-- ============================================
-- VIDEO FORENSIC SAMPLES (No direct user access)
-- ============================================

DROP POLICY IF EXISTS "service_role_only_forensic" ON video_forensic_samples;
CREATE POLICY "service_role_only_forensic" ON video_forensic_samples
  FOR ALL USING (false);

-- ============================================
-- VIDEO LEAK REPORTS (No direct user access)
-- ============================================

DROP POLICY IF EXISTS "service_role_only_leak" ON video_leak_reports;
CREATE POLICY "service_role_only_leak" ON video_leak_reports
  FOR ALL USING (false);

-- ============================================
-- USER ACTIVITY (No direct user access)
-- ============================================

DROP POLICY IF EXISTS "service_role_only_activity" ON user_activity;
CREATE POLICY "service_role_only_activity" ON user_activity
  FOR ALL USING (false);

-- ============================================
-- BATCHES
-- ============================================

DROP POLICY IF EXISTS "admins_manage_batches" ON batches;
CREATE POLICY "admins_manage_batches" ON batches
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "employees_view_batches" ON batches;
CREATE POLICY "employees_view_batches" ON batches
  FOR SELECT USING (is_employee());

-- ============================================
-- COUPONS
-- ============================================

DROP POLICY IF EXISTS "public_validate_coupons" ON coupons;
CREATE POLICY "public_validate_coupons" ON coupons
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_coupons" ON coupons;
CREATE POLICY "admins_manage_coupons" ON coupons
  FOR ALL USING (is_admin());

-- ============================================
-- TESTIMONIALS
-- ============================================

DROP POLICY IF EXISTS "public_view_active_testimonials" ON testimonials;
CREATE POLICY "public_view_active_testimonials" ON testimonials
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_testimonials" ON testimonials;
CREATE POLICY "admins_manage_testimonials" ON testimonials
  FOR ALL USING (is_admin());

-- ============================================
-- LEADS (No public insert without rate limit applies at API level)
-- ============================================

DROP POLICY IF EXISTS "public_insert_leads" ON leads;
CREATE POLICY "public_insert_leads" ON leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admins_manage_leads" ON leads;
CREATE POLICY "admins_manage_leads" ON leads
  FOR ALL USING (is_admin());

-- ============================================
-- TRAINING PROGRAMS
-- ============================================

DROP POLICY IF EXISTS "public_view_active_programs" ON training_programs;
CREATE POLICY "public_view_active_programs" ON training_programs
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_programs" ON training_programs;
CREATE POLICY "admins_manage_programs" ON training_programs
  FOR ALL USING (is_admin());

-- ============================================
-- SECURITY ALERTS (Service role only)
-- ============================================

DROP POLICY IF EXISTS "service_role_only_alerts" ON security_alerts;
CREATE POLICY "service_role_only_alerts" ON security_alerts
  FOR ALL USING (false);

-- ============================================
-- CREATE SECURITY ALERTS TABLE IF NOT EXISTS
-- ============================================

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  action TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  details JSONB,
  ip_address TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON security_alerts(status);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at DESC);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, success, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens(token);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_video_playback_log_user ON video_playback_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity(action, created_at DESC);
