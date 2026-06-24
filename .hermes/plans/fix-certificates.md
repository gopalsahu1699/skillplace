# Fix: Certificate System — Professional PDF Generation & Student Download

## Problem
1. Certificates page shows "Unknown" — missing join queries
2. No certificate download functionality — just a placeholder button
3. Students can't view/download their own certificates
4. No professional certificate template

## Solution
1. Fix joins in admin API and certificate page
2. Create a professional certificate HTML template
3. Add certificate download API route (generates PDF-like HTML)
4. Add student certificate view page at `/student/certificates`
5. Add certificate download endpoint

## Tasks

### Step 1: Update `src/app/api/admin/route.ts` — Add JOIN support

Update the GET handler to support join parameter:

```ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join')

  try {
    let query: any = adminSupabase.from(table!).select('*')

    // Apply joins
    if (join) {
      query = adminSupabase.from(table!).select(join)
    }

    if (id) {
      query = query.eq('id', id).single()
    } else if (filter && value) {
      query = query.eq(filter, value)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

### Step 2: Create `src/app/api/certificates/[id]/route.ts` — Certificate Download API

This generates a professional HTML certificate that can be printed/saved as PDF:

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Fetch certificate with joined data
  const { data: cert, error } = await supabase
    .from('certificates')
    .select('*, profiles(full_name, email), courses(title, duration_hours)')
    .eq('id', id)
    .single()

  if (error || !cert) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  // Generate professional certificate HTML
  const html = generateCertificateHTML(cert)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="certificate-${cert.certificate_number}.html"`,
    },
  })
}

function generateCertificateHTML(cert: any): string {
  const studentName = cert.profiles?.full_name || 'Student'
  const courseName = cert.courses?.title || 'Course'
  const certNumber = cert.certificate_number
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${certNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate {
      width: 1056px;
      height: 748px;
      background: white;
      position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    .border-outer {
      position: absolute;
      top: 15px; left: 15px; right: 15px; bottom: 15px;
      border: 3px solid #1e40af;
    }
    .border-inner {
      position: absolute;
      top: 25px; left: 25px; right: 25px; bottom: 25px;
      border: 1px solid #1e40af;
    }
    .corner {
      position: absolute;
      width: 60px;
      height: 60px;
      border: 2px solid #1e40af;
    }
    .corner-tl { top: 35px; left: 35px; border-right: none; border-bottom: none; }
    .corner-tr { top: 35px; right: 35px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 35px; left: 35px; border-right: none; border-top: none; }
    .corner-br { bottom: 35px; right: 35px; border-left: none; border-top: none; }
    .content {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      text-align: center;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(30, 64, 175, 0.3);
    }
    .logo span {
      color: white;
      font-size: 32px;
      font-weight: 700;
      font-family: 'Playfair Display', serif;
    }
    .academy-name {
      font-family: 'Playfair Display', serif;
      font-size: 28px;
      font-weight: 700;
      color: #1e40af;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 52px;
      font-weight: 700;
      color: #1e293b;
      margin: 15px 0 10px;
      letter-spacing: 4px;
      text-transform: uppercase;
    }
    .subtitle {
      font-size: 16px;
      color: #64748b;
      font-weight: 300;
      margin-bottom: 30px;
      letter-spacing: 1px;
    }
    .recipient {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 600;
      color: #1e40af;
      margin: 10px 0 20px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 15px;
      min-width: 400px;
    }
    .course-label {
      font-size: 14px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .course-name {
      font-size: 22px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 30px;
    }
    .details {
      display: flex;
      gap: 60px;
      margin-top: 20px;
    }
    .detail-item {
      text-align: center;
    }
    .detail-label {
      font-size: 11px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .detail-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
      font-family: 'Playfair Display', serif;
    }
    .cert-number {
      position: absolute;
      bottom: 45px;
      right: 50px;
      font-size: 11px;
      color: #94a3b8;
      font-family: monospace;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 120px;
      font-family: 'Playfair Display', serif;
      color: rgba(30, 64, 175, 0.03);
      font-weight: 700;
      pointer-events: none;
      white-space: nowrap;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e40af;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
    }
    .print-btn:hover { background: #1e3a8a; }
    @media print {
      body { background: white; }
      .print-btn { display: none; }
      .certificate { box-shadow: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save PDF</button>
  <div class="certificate">
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <div class="watermark">SKILLPLACE</div>
    <div class="content">
      <div class="logo"><span>S</span></div>
      <div class="academy-name">Skillplace Academy</div>
      <div class="title">Certificate</div>
      <div class="subtitle">of Course Completion</div>
      <div class="recipient">${studentName}</div>
      <div class="course-label">has successfully completed the course</div>
      <div class="course-name">${courseName}</div>
      <div class="details">
        <div class="detail-item">
          <div class="detail-label">Certificate No.</div>
          <div class="detail-value">${certNumber}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Date Issued</div>
          <div class="detail-value">${issuedDate}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Duration</div>
          <div class="detail-value">${cert.courses?.duration_hours || 'N/A'} Hours</div>
        </div>
      </div>
    </div>
    <div class="cert-number">${certNumber}</div>
  </div>
</body>
</html>`
}
```

### Step 3: Update `src/app/admin-place/certificates/page.tsx`

Fix the page to use joins and add working download button:

- Change `getRecords('certificates')` to `getRecords('certificates', undefined, undefined, '*,profiles(full_name),courses(title,duration_hours)')`
- Update the download button to open the certificate URL

### Step 4: Create `src/app/student/certificates/page.tsx`

Student certificates view page:

```tsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { Download, Award, ArrowLeft } from 'lucide-react'

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('certificates')
      .select('*, courses(title, duration_hours)')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false })

    setCertificates(data || [])
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">My Certificates</h1>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No certificates yet. Complete a course to earn your first certificate!</p>
            <Link href="/courses">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{cert.certificate_number}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{cert.courses?.title}</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Issued: {new Date(cert.issued_at).toLocaleDateString()}
                </p>
                <a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" /> Download Certificate
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Step 5: Update `src/app/admin-place/certificates/page.tsx`

Fix the existing page to use joins and working download:

```tsx
// In fetchData function, change:
const certsData = await getRecords('certificates')

// To:
const certsData = await getRecords('certificates', undefined, undefined, '*,profiles(full_name),courses(title,duration_hours)')
```

And update the download button:
```tsx
<a href={`/api/certificates/${cert.id}`} target="_blank" rel="noopener noreferrer">
  <Button variant="ghost" size="sm" className="gap-1 hover:bg-blue-50 hover:text-blue-600">
    <Download className="h-4 w-4" /> PDF
  </Button>
</a>
```

### Step 6: Update `src/app/api/admin/route.ts` — Add join support

```ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const table = searchParams.get('table')
  const id = searchParams.get('id')
  const filter = searchParams.get('filter')
  const value = searchParams.get('value')
  const join = searchParams.get('join') // NEW: support for joins

  try {
    let query: any = adminSupabase.from(table!).select('*')

    // Apply joins if specified
    if (join) {
      query = adminSupabase.from(table!).select(join)
    }

    if (id) {
      query = query.eq('id', id).single()
    } else if (filter && value) {
      query = query.eq(filter, value)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
```

## DO NOT
- Do NOT run git push
- Do NOT add new npm dependencies
- Do NOT change Supabase client files

## After Completion
- Run `npx tsc --noEmit` — zero errors from our code
- Admin can view certificates with student name and course title (not "Unknown")
- Admin can download certificate as HTML (printable/saveable as PDF)
- Student can view all their certificates at `/student/certificates`
- Student can download their certificates
- Certificate has professional design with borders, logo, watermark, and all details
