import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const BUCKET = 'skillplaceacademy'
const BASE = 'images'

const ALLOWED_FOLDERS = new Set(['courses', 'mentors', 'partners', 'programs', 'testimonials', 'employees', 'common'])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'common'

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: `Invalid folder: ${folder}` }, { status: 400 })
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })

    const path = `${BASE}/${folder}`

    const { data, error } = await adminSupabase.storage
      .from(BUCKET)
      .list(path, { sortBy: { column: 'created_at', order: 'desc' } })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const images = (data || [])
      .filter((f) => f.name !== '.gitkeep' && f.metadata?.mimetype?.startsWith('image/'))
      .map((f) => ({
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}/${f.name}`,
        created_at: f.created_at,
        size: f.metadata?.size,
      }))

    return NextResponse.json({ images })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list images'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
