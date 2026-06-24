import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '')
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, serviceKey)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: cert, error } = await supabase
    .from('certificates')
    .select('*, profiles(full_name, email), courses(title, duration_hours)')
    .eq('id', id)
    .single()

  if (error || !cert) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  }

  const html = generateCertificateHTML(cert)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
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
  const duration = cert.courses?.duration_hours || 'N/A'

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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .border-outer {
      position: absolute;
      top: 12px; left: 12px; right: 12px; bottom: 12px;
      border: 3px solid #1e40af;
    }
    .border-inner {
      position: absolute;
      top: 22px; left: 22px; right: 22px; bottom: 22px;
      border: 1px solid #bfdbfe;
    }
    .corner { position: absolute; width: 50px; height: 50px; border: 2px solid #1e40af; }
    .corner-tl { top: 30px; left: 30px; border-right: none; border-bottom: none; }
    .corner-tr { top: 30px; right: 30px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 30px; left: 30px; border-right: none; border-top: none; }
    .corner-br { bottom: 30px; right: 30px; border-left: none; border-top: none; }
    .content {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 50px 60px; text-align: center;
    }
    .logo {
      width: 70px; height: 70px;
      background: linear-gradient(135deg, #1e40af, #3b82f6);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 15px;
      box-shadow: 0 4px 20px rgba(30, 64, 175, 0.3);
    }
    .logo span { color: white; font-size: 28px; font-weight: 700; font-family: 'Playfair Display', serif; }
    .academy {
      font-family: 'Playfair Display', serif;
      font-size: 24px; font-weight: 700; color: #1e40af;
      letter-spacing: 4px; text-transform: uppercase; margin-bottom: 3px;
    }
    .tagline { font-size: 11px; color: #64748b; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 48px; font-weight: 700; color: #1e293b;
      margin: 10px 0 8px; letter-spacing: 5px; text-transform: uppercase;
    }
    .subtitle { font-size: 14px; color: #64748b; font-weight: 300; margin-bottom: 25px; letter-spacing: 2px; }
    .recipient {
      font-family: 'Playfair Display', serif;
      font-size: 40px; font-weight: 600; color: #1e40af;
      margin: 8px 0 18px;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
      min-width: 380px;
    }
    .course-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
    .course-name { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 25px; }
    .details { display: flex; gap: 50px; margin-top: 15px; }
    .detail-item { text-align: center; }
    .detail-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .detail-value { font-size: 13px; font-weight: 600; color: #1e293b; font-family: 'Playfair Display', serif; }
    .cert-number {
      position: absolute; bottom: 38px; right: 45px;
      font-size: 10px; color: #94a3b8; font-family: monospace; letter-spacing: 1px;
    }
    .watermark {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 100px; font-family: 'Playfair Display', serif;
      color: rgba(30, 64, 175, 0.03); font-weight: 700;
      pointer-events: none; white-space: nowrap; user-select: none;
    }
    .print-btn {
      position: fixed; top: 20px; right: 20px;
      background: #1e40af; color: white; border: none;
      padding: 12px 28px; border-radius: 8px;
      font-size: 14px; font-weight: 500; cursor: pointer;
      box-shadow: 0 4px 15px rgba(30, 64, 175, 0.3);
      transition: all 0.2s;
    }
    .print-btn:hover { background: #1e3a8a; transform: translateY(-1px); }
    @media print {
      body { background: white; }
      .print-btn { display: none; }
      .certificate { box-shadow: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
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
      <div class="academy">Skillplace Academy</div>
      <div class="tagline">Learn | Practice | Get Placed</div>
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
          <div class="detail-value">${duration} Hours</div>
        </div>
      </div>
    </div>
    <div class="cert-number">${certNumber}</div>
  </div>
</body>
</html>`
}
