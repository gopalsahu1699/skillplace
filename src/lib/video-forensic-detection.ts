import { adminSupabase } from '@/lib/supabase/admin'

export interface LeakDetectionResult {
  flagged: boolean
  reason?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
}

const FLAG_THRESHOLDS = {
  MAX_SAMPLES_PER_MINUTE: 4,
  MAX_SAMPLES_PER_HOUR: 60,
  MIN_SAMPLE_INTERVAL_SECONDS: 5,
  SUSPICIOUS_SCREEN_SIZE_RATIO: 0.15,
  CONSECUTIVE_RAPID_SAMPLES: 3,
}

export async function analyzeSample(
  userId: string,
  lessonId: string,
  screenWidth: number,
  screenHeight: number,
): Promise<LeakDetectionResult> {
  const now = new Date()
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000)

  const { data: recentSamples } = await adminSupabase
    .from('video_forensic_samples')
    .select('id, created_at, screen_width, screen_height')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .gte('created_at', fiveMinAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(20)

  if (!recentSamples || recentSamples.length === 0) {
    return { flagged: false, confidence: 0 }
  }

  const reasons: string[] = []

  if (recentSamples.length > FLAG_THRESHOLDS.MAX_SAMPLES_PER_MINUTE) {
    const oneMinAgo = new Date(now.getTime() - 60 * 1000)
    const samplesLastMin = recentSamples.filter(
      s => new Date(s.created_at).getTime() > oneMinAgo.getTime()
    ).length
    if (samplesLastMin > FLAG_THRESHOLDS.MAX_SAMPLES_PER_MINUTE) {
      reasons.push(`rapid sampling: ${samplesLastMin} samples in 1 minute`)
    }
  }

  if (recentSamples.length >= 2) {
    let rapidCount = 0
    for (let i = 0; i < recentSamples.length - 1; i++) {
      const diff = new Date(recentSamples[i].created_at).getTime() -
        new Date(recentSamples[i + 1].created_at).getTime()
      if (diff < FLAG_THRESHOLDS.MIN_SAMPLE_INTERVAL_SECONDS * 1000) {
        rapidCount++
      }
    }
    if (rapidCount >= FLAG_THRESHOLDS.CONSECUTIVE_RAPID_SAMPLES) {
      reasons.push(`rapid consecutive samples: ${rapidCount} intervals < 5s`)
    }
  }

  if (screenWidth && screenHeight) {
    const screenRatio = screenWidth / screenHeight
    if (
      (screenRatio > 2.5 && screenWidth >= 1920) ||
      (screenRatio < 1.2 && screenWidth >= 1080)
    ) {
      reasons.push(`unusual screen aspect ratio: ${screenRatio.toFixed(2)}`)
    }
  }

  if (recentSamples.length > FLAG_THRESHOLDS.MAX_SAMPLES_PER_HOUR) {
    reasons.push('excessive total samples in detection window')
  }

  if (reasons.length === 0) {
    return { flagged: false, confidence: 0 }
  }

  const confidence = Math.min(reasons.length * 0.3 + 0.2, 0.95)
  const severity: 'low' | 'medium' | 'high' | 'critical' =
    confidence >= 0.8 ? 'critical' :
    confidence >= 0.6 ? 'high' :
    confidence >= 0.4 ? 'medium' : 'low'

  return {
    flagged: true,
    reason: reasons.join('; '),
    severity,
    confidence,
  }
}

export async function flagSample(
  sampleId: string,
  reason: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
): Promise<void> {
  const { data: sample, error: fetchErr } = await adminSupabase
    .from('video_forensic_samples')
    .select('id, user_id, lesson_id')
    .eq('id', sampleId)
    .single()

  if (fetchErr || !sample) return

  await adminSupabase
    .from('video_forensic_samples')
    .update({
      flagged: true,
      flag_reason: reason,
      flagged_at: new Date().toISOString(),
    })
    .eq('id', sampleId)

  const { data: lesson } = await adminSupabase
    .from('lessons')
    .select('id, module_id')
    .eq('id', sample.lesson_id)
    .single()

  let courseId: string | undefined
  if (lesson?.module_id) {
    const { data: mod } = await adminSupabase
      .from('modules')
      .select('course_id')
      .eq('id', lesson.module_id)
      .single()
    courseId = mod?.course_id
  }

  await adminSupabase.from('video_leak_reports').insert({
    user_id: sample.user_id,
    lesson_id: sample.lesson_id,
    course_id: courseId || null,
    sample_id: sample.id,
    status: 'open',
    severity,
    detected_by: 'system',
    metadata: { detection_reason: reason, auto_flagged: true },
  })
}

export async function sendLeakWarning(
  userId: string,
  lessonId: string,
  reportId: string,
): Promise<boolean> {
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .single()
  if (!profile) return false

  const { data: lesson } = await adminSupabase
    .from('lessons')
    .select('title')
    .eq('id', lessonId)
    .single()

  const lessonTitle = lesson?.title || 'Unknown Lesson'

  const { error: notifErr } = await adminSupabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Video Content Policy Warning',
      message: `Our system has detected potential unauthorized recording or sharing of video content from "${lessonTitle}". This is a violation of our terms of service. Repeated violations may result in account suspension or legal action. If you believe this is an error, please contact support.`,
      type: 'warning',
      metadata: {
        lesson_id: lessonId,
        leak_report_id: reportId,
        category: 'video_leak_warning',
      },
    })

  if (notifErr) return false

  await adminSupabase
    .from('video_leak_reports')
    .update({ warning_sent_at: new Date().toISOString() })
    .eq('id', reportId)

  await adminSupabase
    .from('video_forensic_samples')
    .update({ warning_sent_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .is('warning_sent_at', null)

  return true
}

export async function revokeStudentAccess(
  userId: string,
  courseId: string,
  reportId: string,
  durationDays: number = 30,
): Promise<boolean> {
  const now = new Date().toISOString()

  const { error: ceErr } = await adminSupabase
    .from('course_enrollments')
    .update({ status: 'expired' })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'active')

  const { error: eErr } = await adminSupabase
    .from('enrollments')
    .update({ status: 'expired' })
    .eq('user_id', userId)

  if (ceErr && eErr) return false

  await adminSupabase
    .from('video_leak_reports')
    .update({
      access_revoked_at: now,
      revoke_duration_days: durationDays,
    })
    .eq('id', reportId)

  await adminSupabase
    .from('video_forensic_samples')
    .update({ access_revoked_at: now })
    .eq('user_id', userId)
    .eq('lesson_id', courseId)
    .is('access_revoked_at', null)

  await adminSupabase.from('notifications').insert({
    user_id: userId,
    title: 'Course Access Restricted',
    message: `Due to a violation of our video content policy, your access to the course has been temporarily restricted for ${durationDays} days. Please contact support if you have any questions.`,
    type: 'warning',
    metadata: {
      leak_report_id: reportId,
      category: 'access_revoked',
      revoke_duration_days: durationDays,
    },
  })

  return true
}
