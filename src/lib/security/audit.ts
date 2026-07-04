import { adminSupabase } from '@/lib/supabase/admin'

export type AuditAction =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'admin_action'
  | 'password_change'
  | 'video_access'
  | 'course_purchase'
  | 'session_revoked'
  | 'rate_limit_exceeded'
  | 'suspicious_ip'
  | 'privilege_escalation_attempt'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'unauthorized_access_attempt'

export interface AuditEntry {
  userId?: string
  action: AuditAction
  resource?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  success: boolean
  metadata?: Record<string, unknown>
}

export async function logAuditEvent(entry: AuditEntry): Promise<void> {
  try {
    await adminSupabase.from('user_activity').insert({
      user_id: entry.userId || null,
      action: entry.action,
      resource: entry.resource || null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      metadata: entry.metadata || {},
    }).then(() => {}, () => {})

    if (!entry.success) {
      const severity = getFailureSeverity(entry.action)
      if (severity === 'high' || severity === 'critical') {
        await alertSecurityTeam(entry, severity)
      }
    }
  } catch {}
}

function getFailureSeverity(action: AuditAction): 'low' | 'medium' | 'high' | 'critical' {
  switch (action) {
    case 'privilege_escalation_attempt':
    case 'sql_injection_attempt':
      return 'critical'
    case 'xss_attempt':
    case 'unauthorized_access_attempt':
    case 'suspicious_ip':
      return 'high'
    case 'rate_limit_exceeded':
    case 'login_failed':
      return 'medium'
    default:
      return 'low'
  }
}

async function alertSecurityTeam(entry: AuditEntry, severity: string): Promise<void> {
  try {
    await adminSupabase.from('security_alerts').insert({
      action: entry.action,
      severity,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ip_address: entry.ipAddress || null,
      user_id: entry.userId || null,
      status: 'open',
    }).then(() => {}, () => {})
  } catch {}
}

export async function detectSuspiciousActivity(ip: string, userId?: string): Promise<boolean> {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { count: recentCount } = await adminSupabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('success', false)
    .gte('attempted_at', fiveMinAgo)

  const failureCount = recentCount || 0
  if (failureCount > 10) {
    await logAuditEvent({
      userId,
      action: 'suspicious_ip',
      resource: ip,
      details: { failureCount, windowMinutes: 5 },
      ipAddress: ip,
      success: false,
      metadata: { type: 'brute_force_detected' },
    })
    return true
  }

  return false
}

export async function detectPrivilegeEscalation(userId: string, attemptedRole: string): Promise<boolean> {
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile && profile.role !== attemptedRole && attemptedRole === 'admin') {
    await logAuditEvent({
      userId,
      action: 'privilege_escalation_attempt',
      resource: 'role_change',
      details: { currentRole: profile.role, attemptedRole },
      success: false,
    })
    return true
  }

  return false
}
