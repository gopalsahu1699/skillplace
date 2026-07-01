import { NextRequest, NextResponse } from 'next/server'
import { configureBucketCors } from '@/lib/cloudflare-r2'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * POST /api/video/r2-cors
 * Configures CORS rules on the R2 bucket for browser-direct uploads.
 * Call once during setup, or whenever you add a new production domain.
 *
 * Body: { origins?: string[] }
 * If no origins provided, uses defaults: localhost:3000, localhost:3001, and NEXT_PUBLIC_SITE_URL.
 *
 * Requires admin authentication.
 */
export async function POST(request: NextRequest) {
  const token = request.cookies.get('sb-access-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: { user }, error: authErr } = await adminSupabase.auth.getUser(token)
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await adminSupabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role !== 'admin') {
      const { data: emp } = await adminSupabase.from('employees').select('role').eq('email', user.email).maybeSingle()
      if (emp?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { origins } = body as { origins?: string[] }

    await configureBucketCors(origins)

    return NextResponse.json({
      success: true,
      message: 'R2 bucket CORS configured successfully',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to configure CORS'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
