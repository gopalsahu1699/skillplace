import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const BUCKET = 'skillplaceacademy'
const BASE = 'images'

const ALLOWED_FOLDERS = new Set(['courses', 'mentors', 'partners', 'programs', 'testimonials', 'employees', 'common'])

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')
    const filename = searchParams.get('filename')

    if (!folder || !filename) {
      return NextResponse.json({ error: 'folder and filename are required' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: `Invalid folder: ${folder}` }, { status: 400 })
    }

    const path = `${BASE}/${folder}/${filename}`

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })

    const { error } = await adminSupabase.storage
      .from(BUCKET)
      .remove([path])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
