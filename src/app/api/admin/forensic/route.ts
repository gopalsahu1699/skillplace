import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { analyzeSample, flagSample, sendLeakWarning, revokeStudentAccess } from '@/lib/video-forensic-detection'

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('sb-access-token')?.value
  if (!token) return false
  try {
    const { data: { user }, error } = await adminSupabase.auth.getUser(token)
    if (error || !user) return false
    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'admin') return true
    const { data: emp } = await adminSupabase.from('employees').select('role').eq('email', user.email).maybeSingle()
    return emp?.role === 'admin'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'samples'
  const userId = searchParams.get('userId') || undefined
  const lessonId = searchParams.get('lessonId') || undefined
  const flagged = searchParams.get('flagged')
  const status = searchParams.get('status') || undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  try {
    if (type === 'samples') {
      let query = adminSupabase
        .from('video_forensic_samples')
        .select('*, profiles!inner(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) query = query.eq('user_id', userId)
      if (lessonId) query = query.eq('lesson_id', lessonId)
      if (flagged === 'true') query = query.eq('flagged', true)
      if (flagged === 'false') query = query.eq('flagged', false)

      const { data, error, count } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: data || [], total: count || 0 })
    }

    if (type === 'reports') {
      let query = adminSupabase
        .from('video_leak_reports')
        .select('*, profiles!inner(full_name, email), lessons(title)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (userId) query = query.eq('user_id', userId)
      if (lessonId) query = query.eq('lesson_id', lessonId)
      if (status) query = query.eq('status', status)

      const { data, error, count } = await query
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: data || [], total: count || 0 })
    }

    if (type === 'stats') {
      const [samplesTotal, flaggedCount, openReports, recentSamples] = await Promise.all([
        adminSupabase.from('video_forensic_samples').select('id', { count: 'exact', head: true }),
        adminSupabase.from('video_forensic_samples').select('id', { count: 'exact', head: true }).eq('flagged', true),
        adminSupabase.from('video_leak_reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
        adminSupabase.from('video_forensic_samples').select('id', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
      ])
      return NextResponse.json({
        totalSamples: samplesTotal.count || 0,
        flaggedSamples: flaggedCount.count || 0,
        openReports: openReports.count || 0,
        samplesLast24h: recentSamples.count || 0,
      })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!await verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, sampleId, userId, lessonId, reportId, courseId, severity, durationDays } = body

    switch (action) {
      case 'flag': {
        if (!sampleId || !userId) {
          return NextResponse.json({ error: 'sampleId and userId required' }, { status: 400 })
        }
        await flagSample(sampleId, 'Manually flagged by admin', severity || 'medium')
        return NextResponse.json({ success: true })
      }

      case 'warn': {
        if (!userId || !lessonId || !reportId) {
          return NextResponse.json({ error: 'userId, lessonId, and reportId required' }, { status: 400 })
        }
        const warned = await sendLeakWarning(userId, lessonId, reportId)
        if (!warned) return NextResponse.json({ error: 'Failed to send warning' }, { status: 500 })
        return NextResponse.json({ success: true })
      }

      case 'revoke': {
        if (!userId || !courseId || !reportId) {
          return NextResponse.json({ error: 'userId, courseId, and reportId required' }, { status: 400 })
        }
        const revoked = await revokeStudentAccess(userId, courseId, reportId, durationDays || 30)
        if (!revoked) return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 })
        return NextResponse.json({ success: true })
      }

      case 'resolve': {
        if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 })
        const { error: updateErr } = await adminSupabase
          .from('video_leak_reports')
          .update({ status: 'resolved', resolution_notes: body.notes || null, updated_at: new Date().toISOString() })
          .eq('id', reportId)
        if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
        return NextResponse.json({ success: true })
      }

      case 'dismiss': {
        if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 })
        const { error: updateErr } = await adminSupabase
          .from('video_leak_reports')
          .update({ status: 'dismissed', admin_notes: body.notes || null, updated_at: new Date().toISOString() })
          .eq('id', reportId)
        if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
        return NextResponse.json({ success: true })
      }

      case 'analyze': {
        if (!sampleId) return NextResponse.json({ error: 'sampleId required' }, { status: 400 })
        const { data: sample } = await adminSupabase
          .from('video_forensic_samples')
          .select('*')
          .eq('id', sampleId)
          .single()
        if (!sample) return NextResponse.json({ error: 'Sample not found' }, { status: 404 })
        const result = await analyzeSample(sample.user_id, sample.lesson_id, sample.screen_width, sample.screen_height)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
