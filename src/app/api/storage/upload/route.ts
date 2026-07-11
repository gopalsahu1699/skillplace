import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const BUCKET = 'skillplaceacademy'
const BASE = 'images'

const ALLOWED_FOLDERS = new Set(['courses', 'mentors', 'partners', 'programs', 'testimonials', 'employees', 'common'])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'common'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ error: `Invalid folder: ${folder}` }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const path = `${BASE}/${folder}/${filename}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })

    const { error: uploadError } = await adminSupabase.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('[upload] Supabase upload error:', uploadError.message, { bucket: BUCKET, path })
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = adminSupabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl, filename })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
