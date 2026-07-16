import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'

/**
 * Public API for fetching program/course data (no admin auth required).
 * Used by public-facing pages like enrollment, course listing, etc.
 * Only supports READ operations on safe tables.
 */
const PUBLIC_TABLES = new Set([
  'training_programs',
  'courses',
  'branches',
  'program_courses',
  'testimonials',
  'program_fees',
])

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join')

  if (!table || !PUBLIC_TABLES.has(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
  }

  try {
    let selectStr = '*'
    if (join) {
      const parts: string[] = []
      let depth = 0
      let current = ''
      for (const ch of join) {
        if (ch === '(') { depth++; current += ch }
        else if (ch === ')') { depth--; current += ch }
        else if (ch === ',' && depth === 0) {
          if (current.trim()) parts.push(current.trim())
          current = ''
        } else { current += ch }
      }
      if (current.trim()) parts.push(current.trim())
      selectStr = '*' + ',' + parts.map(t => t === '*' ? t : t.includes('(') ? t : `${t}(*)`).join(',')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = adminSupabase.from(table).select(selectStr)

    if (id) {
      query = query.eq('id', id).single()
    } else if (filter && value) {
      query = query.eq(filter, value)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
