import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params

  try {
    const { data: batch, error: batchError } = await adminSupabase
      .from('batches')
      .select('*')
      .eq('id', batchId)
      .single()

    if (batchError) return NextResponse.json({ error: batchError.message }, { status: 400 })

    const { data: students, error: studentsError } = await adminSupabase
      .from('profiles')
      .select('id, full_name, email, phone, is_active, created_at, batch_id, program_type, enrollments(id, status, courses(title))')
      .eq('batch_id', batchId)
      .order('full_name')

    if (studentsError) return NextResponse.json({ error: studentsError.message }, { status: 400 })

    const { count: certCount } = await adminSupabase
      .from('certificates')
      .select('id', { count: 'exact', head: true })
      .in('user_id', (students || []).map((s: { id: string }) => s.id))

    return NextResponse.json({ data: { batch, students: students || [], certificate_count: certCount || 0 } })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
