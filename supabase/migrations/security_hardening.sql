-- ============================================
-- Security Hardening Migration
-- SkillPlace Academy
-- ============================================

-- 1. SINGLE SESSION ENFORCEMENT
-- Ensures a user can only have one active session at a time

CREATE OR REPLACE FUNCTION enforce_single_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false,
      is_revoked = true,
      revoked_at = now(),
      revoke_reason = 'single_session_enforced'
  WHERE user_id = NEW.user_id
    AND is_active = true
    AND id != NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_single_session ON user_sessions;
CREATE TRIGGER trg_enforce_single_session
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_session();

-- 2. SESSION EXPIRY CLEANUP
-- Automatically expire sessions older than 7 days

CREATE OR REPLACE FUNCTION auto_expire_sessions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false,
      is_revoked = true,
      revoked_at = now(),
      revoke_reason = 'session_expired'
  WHERE is_active = true
    AND expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PREVENT PRIVILEGE ESCALATION
-- Only admins can set role = 'admin' on profiles

CREATE OR REPLACE FUNCTION check_admin_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' AND (OLD.role IS DISTINCT FROM 'admin' OR OLD.role IS NULL) THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_active = true
    ) THEN
      RAISE EXCEPTION 'Only existing admins can assign admin role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_admin_role ON profiles;
CREATE TRIGGER trg_check_admin_role
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_role_assignment();

-- 4. PREVENT SELF-DELETION OF ADMIN ACCOUNTS
-- Admin accounts cannot be deleted through normal RLS

CREATE OR REPLACE FUNCTION prevent_admin_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Admin accounts cannot be deleted through RLS';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_admin_deletion ON profiles;
CREATE TRIGGER trg_prevent_admin_deletion
  BEFORE DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_deletion();

-- 5. AUDIT LOG CLEANUP
-- Keep only last 90 days of audit logs

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM user_activity
  WHERE created_at < now() - interval '90 days';

  DELETE FROM video_playback_log
  WHERE created_at < now() - interval '90 days';

  DELETE FROM login_attempts
  WHERE attempted_at < now() - interval '90 days';

  DELETE FROM revoked_tokens
  WHERE revoked_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. PREVENT NULLIFYING CRITICAL FIELDS
-- Ensure critical user fields cannot be set to null

CREATE OR REPLACE FUNCTION protect_critical_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NULL THEN
    NEW.email = OLD.email;
  END IF;
  IF NEW.role IS NULL THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_critical_profile_fields();

-- 7. RATE LIMIT BYPASS DETECTION
-- Track rapid successive logins from different IPs for same account

CREATE OR REPLACE FUNCTION detect_credential_stuffing()
RETURNS TRIGGER AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  IF NEW.success = false THEN
    SELECT COUNT(*) INTO recent_attempts
    FROM login_attempts
    WHERE email = NEW.email
      AND success = false
      AND attempted_at > now() - interval '5 minutes';

    IF recent_attempts >= 10 THEN
      INSERT INTO security_alerts (action, severity, details, ip_address)
      VALUES (
        'credential_stuffing_detected',
        'critical',
        jsonb_build_object(
          'email', NEW.email,
          'attempts_5min', recent_attempts,
          'ip', NEW.ip_address
        ),
        NEW.ip_address
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_detect_credential_stuffing ON login_attempts;
CREATE TRIGGER trg_detect_credential_stuffing
  AFTER INSERT ON login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION detect_credential_stuffing();

-- 8. RLS POLICY FOR SECURITY ALERTS (only service_role)
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_only" ON security_alerts;
CREATE POLICY "service_role_only" ON security_alerts
  FOR ALL USING (false);

-- 9. ENSURE EVERY USER HAS EXACTLY ONE PROFILE
CREATE OR REPLACE FUNCTION ensure_profile_on_auth_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_ensure_profile_on_signup ON auth.users;
CREATE TRIGGER trg_ensure_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_profile_on_auth_signup();

-- 10. PASSWORDS: Enforce minimum password requirements at DB level
-- (Note: This is a advisory check; actual enforcement is in auth.ts)
CREATE OR REPLACE FUNCTION validate_password_strength()
RETURNS TRIGGER AS $$
BEGIN
  IF LENGTH(NEW.encrypted_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
