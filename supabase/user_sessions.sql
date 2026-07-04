-- ============================================
-- Table: user_sessions
-- Track active user sessions with full lifecycle
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser TEXT,
  os TEXT,
  login_method TEXT DEFAULT 'email' CHECK (login_method IN ('email', 'google', 'admin')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  logout_at TIMESTAMPTZ,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT
);

-- RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can manage own sessions" ON public.user_sessions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON public.user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created ON public.user_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at DESC);

-- Revoked tokens blacklist table
CREATE TABLE IF NOT EXISTS public.revoked_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT DEFAULT 'logout',
  revoked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON public.revoked_tokens(token);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user ON public.revoked_tokens(user_id);

ALTER TABLE public.revoked_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role only" ON public.revoked_tokens FOR ALL USING (false);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Trigger: enforce single active session per user
-- When a new session is inserted, deactivate all other sessions for that user
CREATE OR REPLACE FUNCTION public.enforce_single_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_sessions
  SET is_active = false,
      is_revoked = true,
      revoked_at = NOW(),
      revoke_reason = 'single_session_replace',
      logout_at = NOW()
  WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_session ON public.user_sessions;
CREATE TRIGGER trigger_single_session
  AFTER INSERT ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_session();
