import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminSupabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join')

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
      selectStr = parts.map(t => t === '*' ? t : t.includes('(') ? t : `${t}(*)`).join(',')
    }

    let query: any = adminSupabase.from(table!).select(selectStr)

    if (id) {
      query = query.eq('id', id).single()
    } else if (filter && value) {
      query = query.eq(filter, value)
    }

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  try {
    const body = await request.json()
    const { data, error } = await adminSupabase.from(table!).insert(body).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  try {
    const body = await request.json()
    const { data, error } = await adminSupabase.from(table!).update(body).eq('id', id).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  try {
    const { error } = await adminSupabase.from(table!).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
