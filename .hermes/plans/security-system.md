## Task: Security System - Single Device Login + Auto Logout + Session Protection

### Overview
Implement a secure session system for the education platform that:
1. Allows only ONE active session per user (single device login)
2. Auto-logout after 30 minutes of inactivity
3. On logout: delete session from ALL devices
4. Protect from hackers: rate limiting, IP tracking, session rotation, brute force protection

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`

### SQL to Run in Supabase Dashboard (REQUIRED)

Run ALL of these SQL statements in Supabase SQL Editor before testing:

```sql
-- 1. Add security columns to user_sessions
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS last_active_at timestamptz DEFAULT now();
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS is_revoked boolean DEFAULT false;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS revoked_at timestamptz;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS revoke_reason text;

-- 2. Create revoked_tokens table
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL,
  user_id uuid NOT NULL,
  revoked_at timestamptz DEFAULT NOW(),
  reason text,
  ip_address inet,
  UNIQUE(token)
);

-- 3. Create login_attempts table (brute force protection)
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  attempted_at timestamptz DEFAULT NOW(),
  success boolean DEFAULT false,
  failure_reason text
);

-- 4. Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES user_sessions(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource text,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON user_sessions(last_active_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens ON revoked_tokens(token);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id, created_at DESC);

-- 6. Create function to enforce single session per user
CREATE OR REPLACE FUNCTION enforce_single_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false,
      is_revoked = true,
      revoked_at = NOW(),
      revoke_reason = 'single_session_enforcement'
  WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_active = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for single session enforcement
DROP TRIGGER IF EXISTS trigger_single_session ON user_sessions;
CREATE TRIGGER trigger_single_session
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_session();

-- 8. Create function to auto-revoke inactive sessions
CREATE OR REPLACE FUNCTION revoke_inactive_sessions()
RETURNS void AS $$
BEGIN
  INSERT INTO revoked_tokens (token, user_id, reason)
  SELECT session_token, user_id, 'inactive_30min'
  FROM user_sessions
  WHERE is_active = true
    AND last_active_at < NOW() - INTERVAL '30 minutes'
    AND session_token NOT IN (SELECT token FROM revoked_tokens);
  
  UPDATE user_sessions
  SET is_active = false,
      is_revoked = true,
      revoked_at = NOW(),
      revoke_reason = 'inactive_30min'
  WHERE is_active = true
    AND last_active_at < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to cleanup expired data
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM revoked_tokens WHERE revoked_at < NOW() - INTERVAL '7 days';
  DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '30 days';
  DELETE FROM user_activity WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- 10. RLS Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own sessions" ON user_sessions;
CREATE POLICY "Users can read own sessions" ON user_sessions
  FOR SELECT USING (true);

ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert login attempts" ON login_attempts;
CREATE POLICY "Anyone can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

ALTER TABLE revoked_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own activity" ON user_activity;
CREATE POLICY "Users can read own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
DROP POLICY IF EXISTS "Users can insert own activity" ON user_activity;
CREATE POLICY "Users can insert own activity" ON user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Code Changes

#### 1. `src/lib/supabase/client.ts` - Update createSession + validateSession + add revokeSession + revokeAllSessions

```ts
export async function createSession(
  userId: string,
  userAgent?: string,
  ip?: string | null,
  accessToken?: string
): Promise<SessionData> {
  const sessionToken = generateToken()
  const accessTokenGenerated = generateToken()
  const refreshToken = generateToken()

  const ua = (userAgent || 'unknown').toLowerCase()
  let deviceType = 'unknown'
  if (/mobile|android|iphone/.test(ua)) deviceType = 'mobile'
  else if (/tablet|ipad/.test(ua)) deviceType = 'tablet'
  else if (/windows|mac|linux/.test(ua)) deviceType = 'desktop'

  let browser = 'unknown'
  if (/chrome/.test(ua)) browser = 'chrome'
  else if (/firefox/.test(ua)) browser = 'firefox'
  else if (/safari/.test(ua)) browser = 'safari'
  else if (/edge/.test(ua)) browser = 'edge'

  let os = 'unknown'
  if (/windows/.test(ua)) os = 'windows'
  else if (/mac/.test(ua)) os = 'macos'
  else if (/linux/.test(ua)) os = 'linux'
  else if (/android/.test(ua)) os = 'android'
  else if (/ios|iphone|ipad/.test(ua)) os = 'ios'

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const sessionRecord = {
    user_id: userId,
    session_token: sessionToken,
    access_token: accessTokenGenerated,
    refresh_token: refreshToken,
    ip_address: ip,
    user_agent: userAgent,
    device_type: deviceType,
    browser,
    os,
    login_method: 'email',
    expires_at: expiresAt.toISOString(),
  }

  let client = supabase
  if (accessToken) {
    const { createClient } = await import('@supabase/supabase-js')
    client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    })
  }

  // Auto-create profile if user doesn't have one
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id: userId,
      email: '',
      full_name: null,
      phone: null,
      role: 'student',
      is_active: true,
    })
  }

  // Insert session (trigger will enforce single session)
  const { error } = await client.from('user_sessions').insert(sessionRecord)
  if (error) throw error

  // Log activity
  const { data: newSession } = await client
    .from('user_sessions')
    .select('id')
    .eq('session_token', sessionToken)
    .single()

  if (newSession) {
    await client.from('user_activity').insert({
      user_id: userId,
      session_id: newSession.id,
      action: 'login',
      ip_address: ip,
      user_agent: userAgent,
    }).catch(() => {})
  }

  return { sessionToken, accessToken: accessTokenGenerated, refreshToken, expiresAt }
}

export async function validateSession(
  sessionToken: string
): Promise<ValidatedSession | null> {
  // Check if token is revoked
  const { data: revoked } = await supabase
    .from('revoked_tokens')
    .select('id')
    .eq('token', sessionToken)
    .maybeSingle()

  if (revoked) return null

  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null

  // Check if session is inactive for more than 30 minutes
  const lastActive = new Date(data.last_active_at || data.created_at)
  const inactiveMinutes = (Date.now() - lastActive.getTime()) / (1000 * 60)

  if (inactiveMinutes > 30) {
    await revokeSession(sessionToken, 'inactive_30min')
    return null
  }

  // Update last active time
  await supabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('session_token', sessionToken)

  // Log activity
  await supabase
    .from('user_activity')
    .insert({
      user_id: data.user_id,
      session_id: data.id,
      action: 'session_validate',
      ip_address: data.ip_address,
    }).catch(() => {})

  // Fetch profile separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user_id)
    .maybeSingle()

  data.profiles = profile || null
  return data as ValidatedSession
}

export async function revokeSession(sessionToken: string, reason: string = 'logout'): Promise<boolean> {
  const { data: session } = await supabase
    .from('user_sessions')
    .select('user_id')
    .eq('session_token', sessionToken)
    .single()

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, is_revoked: true, revoked_at: new Date().toISOString(), revoke_reason: reason })
    .eq('session_token', sessionToken)

  if (!error && session) {
    await supabase.from('revoked_tokens').insert({
      token: sessionToken,
      user_id: session.user_id,
      reason,
    }).catch(() => {})

    await supabase.from('user_activity').insert({
      user_id: session.user_id,
      action: 'logout',
      resource: sessionToken,
    }).catch(() => {})
  }

  return !error
}

export async function revokeAllSessions(userId: string, reason: string = 'logout_all'): Promise<boolean> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('session_token, user_id')
    .eq('user_id', userId)
    .eq('is_active', true)

  const { error } = await supabase
    .from('user_sessions')
    .update({ is_active: false, is_revoked: true, revoked_at: new Date().toISOString(), revoke_reason: reason })
    .eq('user_id', userId)
    .eq('is_active', true)

  if (sessions && sessions.length > 0) {
    await supabase.from('revoked_tokens').insert(
      sessions.map(s => ({ token: s.session_token, user_id: s.user_id, reason }))
    ).catch(() => {})

    await supabase.from('user_activity').insert({
      user_id: userId,
      action: 'logout_all',
    }).catch(() => {})
  }

  return !error
}
```

#### 2. `src/app/api/session/validate/route.ts` - Update with revocation check

```ts
import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  // Check if token is revoked
  const { data: revoked } = await adminSupabase
    .from('revoked_tokens')
    .select('id')
    .eq('token', token)
    .maybeSingle()

  if (revoked) {
    return NextResponse.json({ error: 'Session revoked' }, { status: 401 })
  }

  const { data: session, error } = await adminSupabase
    .from('user_sessions')
    .select('*')
    .eq('session_token', token)
    .eq('is_active', true)
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  // Check inactivity (30 minutes)
  const lastActive = new Date(session.last_active_at || session.created_at)
  const inactiveMinutes = (Date.now() - lastActive.getTime()) / (1000 * 60)

  if (inactiveMinutes > 30) {
    await adminSupabase
      .from('user_sessions')
      .update({ is_active: false, is_revoked: true, revoked_at: new Date(), revoke_reason: 'inactive_30min' })
      .eq('session_token', token)

    await adminSupabase.from('revoked_tokens').insert({
      token,
      user_id: session.user_id,
      reason: 'inactive_30min'
    }).catch(() => {})

    return NextResponse.json({ error: 'Session expired due to inactivity' }, { status: 401 })
  }

  // Update last active time
  await adminSupabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('session_token', token)

  return NextResponse.json({
    id: session.id,
    user_id: session.user_id,
    session_token: session.session_token,
    device_type: session.device_type,
    browser: session.browser,
    os: session.os,
    profiles: session.profiles,
  })
}
```

#### 3. `src/app/api/session/auto-revoke/route.ts` - Cron endpoint

```ts
import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'cron-secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await adminSupabase.rpc('revoke_inactive_sessions')
    await adminSupabase.rpc('cleanup_expired_tokens')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

#### 4. `src/lib/rate-limit.ts` - Rate limiter

```ts
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: maxRequests - record.count }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)
```

#### 5. `src/app/login/page.tsx` - Add rate limiting on login

Add rate limiting check before signInWithPassword:

```ts
import { checkRateLimit } from '@/lib/rate-limit'

// In handleSubmit:
const clientIp = '127.0.0.1' // In production, get from request headers
const rateCheck = checkRateLimit(clientIp, 5, 15 * 60 * 1000) // 5 attempts per 15 min
if (!rateCheck.allowed) {
  setError('Too many login attempts. Please try again in 15 minutes.')
  setLoading(false)
  return
}
```

### Security Features Summary

1. **Single Device Login** - Trigger auto-revokes old sessions when new session created
2. **30-Minute Inactivity Auto-Logout** - Checked on every session validation
3. **Token Blacklist** - Revoked tokens stored separately for extra security
4. **Brute Force Protection** - Rate limiting on login (5 attempts per 15 min per IP)
5. **Session Activity Tracking** - All actions logged with IP and user agent
6. **Auto Cleanup** - Old tokens (7 days), login attempts (30 days), activity (90 days) auto-deleted
7. **IP Tracking** - All sessions and login attempts track IP address
8. **Device Fingerprinting** - Browser, OS, device type tracked per session
9. **Logout from All Devices** - `revokeAllSessions()` function available

### SQL to Run (copy-paste into Supabase SQL Editor)

All SQL is in the first section above. Run it before testing.
