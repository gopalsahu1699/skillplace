import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

interface BulkCertRequest {
  certificates?: {
    user_id: string
    course_id: string | null
    certificate_number: string
    certificate_type: string
    theme: string
    organization_name: string | null
    custom_message: string | null
    issued_at: string
  }[]
  batch_id?: string
  student_ids?: string[]
  certificate_type?: string
  theme?: string
}

function generateCertificateNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear()
  const yearPrefix = `SP-${year}-`
  const yearNumbers = existingNumbers
    .filter((n) => n.startsWith(yearPrefix))
    .map((n) => parseInt(n.replace(yearPrefix, ''), 10))
    .filter((n) => !isNaN(n))
  const sequential = yearNumbers.length > 0 ? Math.max(...yearNumbers) + 1 : 1
  return `${yearPrefix}${sequential.toString().padStart(5, '0')}`
}

export async function POST(request: NextRequest) {
  try {
    const body: BulkCertRequest = await request.json()

    // Mode 1: Direct certificates array (existing behavior)
    if (body.certificates && Array.isArray(body.certificates) && body.certificates.length > 0) {
      const { data: existingCerts } = await supabase
        .from('certificates')
        .select('certificate_number')

      const existingNumbers = (existingCerts || []).map((c) => c.certificate_number as string)

      const certsToInsert = body.certificates.map((cert) => {
        let certNumber = cert.certificate_number
        if (!certNumber || existingNumbers.includes(certNumber)) {
          certNumber = generateCertificateNumber([...existingNumbers, ...body.certificates!.map((c) => c.certificate_number).filter(Boolean)])
          existingNumbers.push(certNumber)
        }
        return {
          user_id: cert.user_id,
          course_id: cert.course_id || null,
          certificate_number: certNumber,
          certificate_type: cert.certificate_type,
          theme: cert.theme,
          organization_name: cert.organization_name || null,
          custom_message: cert.custom_message || null,
          issued_at: cert.issued_at ? new Date(cert.issued_at).toISOString() : new Date().toISOString(),
        }
      })

      const { data, error } = await supabase
        .from('certificates')
        .insert(certsToInsert)
        .select()

      if (error) {
        return NextResponse.json({ error: 'Failed to create certificates' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        count: data?.length || 0,
        certificates: data,
      })
    }

    // Mode 2: batch_id provided — fetch all students in that batch
    if (body.batch_id) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('batch_id', body.batch_id)

      if (profilesError || !profiles || profiles.length === 0) {
        return NextResponse.json({ error: 'No students found in this batch' }, { status: 400 })
      }

      const studentIds = profiles.map((p) => p.id)

      // Get batch info for course_id
      const { data: batch } = await supabase
        .from('batches')
        .select('course_id')
        .eq('id', body.batch_id)
        .single()

      // Fetch existing certificate numbers
      const { data: existingCerts } = await supabase
        .from('certificates')
        .select('certificate_number')

      const existingNumbers = (existingCerts || []).map((c) => c.certificate_number as string)

      const certsToInsert = studentIds.map((userId) => {
        const certNumber = generateCertificateNumber(existingNumbers)
        existingNumbers.push(certNumber)
        return {
          user_id: userId,
          course_id: batch?.course_id || null,
          certificate_number: certNumber,
          certificate_type: body.certificate_type || 'course_completion',
          theme: body.theme || 'classic',
          organization_name: null,
          custom_message: null,
          issued_at: new Date().toISOString(),
        }
      })

      const { data, error } = await supabase
        .from('certificates')
        .insert(certsToInsert)
        .select()

      if (error) {
        return NextResponse.json({ error: 'Failed to create certificates' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        count: data?.length || 0,
        certificates: data,
      })
    }

    // Mode 3: student_ids provided — issue to specific students
    if (body.student_ids && Array.isArray(body.student_ids) && body.student_ids.length > 0) {
      // Fetch existing certificate numbers
      const { data: existingCerts } = await supabase
        .from('certificates')
        .select('certificate_number')

      const existingNumbers = (existingCerts || []).map((c) => c.certificate_number as string)

      // Fetch batch info for each student to get course_id
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, batch_id')
        .in('id', body.student_ids)

      const batchIds = [...new Set((profiles || []).map((p) => p.batch_id).filter(Boolean))]
      const batchMap = new Map<string, string | null>()

      if (batchIds.length > 0) {
        const { data: batches } = await supabase
          .from('batches')
          .select('id, course_id')
          .in('id', batchIds as string[])

        batches?.forEach((b) => {
          batchMap.set(b.id, b.course_id)
        })
      }

      const certsToInsert = body.student_ids.map((userId) => {
        const certNumber = generateCertificateNumber(existingNumbers)
        existingNumbers.push(certNumber)

        const profile = profiles?.find((p) => p.id === userId)
        const courseId = profile?.batch_id ? batchMap.get(profile.batch_id) || null : null

        return {
          user_id: userId,
          course_id: courseId,
          certificate_number: certNumber,
          certificate_type: body.certificate_type || 'course_completion',
          theme: body.theme || 'classic',
          organization_name: null,
          custom_message: null,
          issued_at: new Date().toISOString(),
        }
      })

      const { data, error } = await supabase
        .from('certificates')
        .insert(certsToInsert)
        .select()

      if (error) {
        return NextResponse.json({ error: 'Failed to create certificates' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        count: data?.length || 0,
        certificates: data,
      })
    }

    return NextResponse.json({ error: 'No certificates, batch_id, or student_ids provided' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
