import {
  CERTIFICATE_THEMES,
  type CertificateType,
  type CertificateTheme,
} from '@/lib/certificate-types'

interface CertificateData {
  studentName: string
  courseName: string
  certNumber: string
  issuedDate: string
  duration: string
  typeId: CertificateType
  themeId: CertificateTheme
  organizationName: string
  customMessage: string
}

function getTypeContent(typeId: CertificateType, organizationName: string, customMessage: string) {
  switch (typeId) {
    case 'course_completion':
      return {
        title: 'Certificate of Course Completion',
        subtitle: 'of Course Completion',
        descriptionText: 'has successfully completed the course',
      }
    case 'internship':
      return {
        title: 'Certificate of Internship',
        subtitle: 'of Internship',
        descriptionText: `has successfully completed internship at ${organizationName || 'the organization'}`,
      }
    case 'training':
      return {
        title: 'Certificate of Training',
        subtitle: 'of Training',
        descriptionText: `has successfully completed the training program${organizationName ? ` at ${organizationName}` : ''}`,
      }
    case 'experience':
      return {
        title: 'Certificate of Experience',
        subtitle: 'of Experience',
        descriptionText: `has gained work experience as ${organizationName || 'a professional'} at the organization`,
      }
    case 'achievement':
      return {
        title: 'Certificate of Achievement',
        subtitle: 'of Achievement',
        descriptionText: customMessage || 'is recognized for outstanding achievement',
      }
    case 'participation':
      return {
        title: 'Certificate of Participation',
        subtitle: 'of Participation',
        descriptionText: 'has actively participated in the program',
      }
    case 'excellence':
      return {
        title: 'Certificate of Excellence',
        subtitle: 'of Excellence',
        descriptionText: customMessage || 'has demonstrated exceptional excellence',
      }
    case 'other':
      return {
        title: 'Certificate',
        subtitle: '',
        descriptionText: customMessage || 'is hereby awarded this certificate',
      }
  }
}

function commonHead(certNumber: string, theme: ReturnType<typeof getTheme>) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate - ${certNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 landscape; margin: 0; }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { font-size: 16px; }
    body {
      font-family: '${theme.bodyFont}', sans-serif;
      background: #e2e8f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2vw;
    }
    .certificate {
      width: min(90vw, 1056px);
      aspect-ratio: 1056 / 748;
      background: ${theme.bg};
      position: relative;
      box-shadow: 0 2.5vw 8vw rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .print-btn {
      position: fixed; top: 20px; right: 20px;
      background: ${theme.primary}; color: white; border: none;
      padding: 12px 28px; border-radius: 8px;
      font-size: 14px; font-weight: 500; cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
      z-index: 100;
    }
    .print-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script>
    async function downloadPDF() {
      const btn = document.querySelector('.print-btn');
      const originalText = btn.textContent;
      btn.textContent = 'Generating...';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      try {
        const certificate = document.querySelector('.certificate');
        const canvas = await html2canvas(certificate, { scale: 2, useCORS: true, logging: false });
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 10, 10, 277, 190);
        pdf.save('certificate-${certNumber}.pdf');
      } catch (err) {
        alert('Failed to generate PDF. Please try again.');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }
  </script>
</head>`
}

function getTheme(id: string) {
  return CERTIFICATE_THEMES.find((t) => t.id === id) ?? CERTIFICATE_THEMES[0]
}

function generateClassicTemplate(data: CertificateData): string {
  const theme = getTheme(data.themeId)
  const content = getTypeContent(data.typeId, data.organizationName, data.customMessage)
  const showCourse = data.typeId === 'course_completion' && data.courseName
  const showOrganization = ['internship', 'training', 'experience'].includes(data.typeId) && data.organizationName
  const showCustomMessage = ['achievement', 'excellence', 'other'].includes(data.typeId) && data.customMessage
  const showDuration = data.typeId === 'course_completion' && data.duration && data.duration !== 'N/A'

  return `${commonHead(data.certNumber, theme)}
<body>
  <button class="print-btn" onclick="downloadPDF()">Download PDF</button>
  <div class="certificate">
    <div style="position:absolute;inset:1.1%;border:0.28vw solid ${theme.borderOuter};"></div>
    <div style="position:absolute;inset:2.1%;border:0.09vw solid ${theme.borderInner};"></div>
    <div style="position:absolute;width:4.7%;aspect-ratio:1;border:0.19vw solid ${theme.borderOuter};top:2.9%;left:2.9%;border-right:none;border-bottom:none;"></div>
    <div style="position:absolute;width:4.7%;aspect-ratio:1;border:0.19vw solid ${theme.borderOuter};top:2.9%;right:2.9%;border-left:none;border-bottom:none;"></div>
    <div style="position:absolute;width:4.7%;aspect-ratio:1;border:0.19vw solid ${theme.borderOuter};bottom:2.9%;left:2.9%;border-right:none;border-top:none;"></div>
    <div style="position:absolute;width:4.7%;aspect-ratio:1;border:0.19vw solid ${theme.borderOuter};bottom:2.9%;right:2.9%;border-left:none;border-top:none;"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:clamp(50px,9.5vw,100px);font-family:'Playfair Display',serif;color:rgba(0,0,0,0.03);font-weight:700;pointer-events:none;white-space:nowrap;user-select:none;">SKILLPLACE</div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5% 6%;text-align:center;">
      <img src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg" alt="Skillplace Academy" style="width:auto;height:clamp(30px,5vw,55px);margin-bottom:1.4%;" />
      <div style="font-family:'Playfair Display',serif;font-size:clamp(14px,2.3vw,24px);font-weight:700;color:${theme.primary};letter-spacing:0.38vw;text-transform:uppercase;margin-bottom:0.3%;">Skillplace Academy</div>
      <div style="font-size:clamp(8px,1.04vw,11px);color:#64748b;letter-spacing:0.28vw;text-transform:uppercase;margin-bottom:2%;">Learn | Practice | Get Placed</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(24px,4.5vw,48px);font-weight:700;color:${theme.textColor};margin:1% 0 0.8%;letter-spacing:0.47vw;text-transform:uppercase;">${content.title}</div>
      <div style="font-size:clamp(10px,1.32vw,14px);color:#64748b;font-weight:300;margin-bottom:2.4%;letter-spacing:0.19vw;">${content.subtitle}</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(20px,3.8vw,40px);font-weight:600;color:${theme.primary};margin:0.8% 0 1.7%;border-bottom:0.19vw solid #e2e8f0;padding-bottom:1.1%;min-width:36%;">${data.studentName}</div>
      <div style="font-size:clamp(8px,1.14vw,12px);color:#64748b;text-transform:uppercase;letter-spacing:0.19vw;margin-bottom:0.6%;">${content.descriptionText}</div>
      ${showCourse ? `<div style="font-size:clamp(13px,1.9vw,20px);font-weight:600;color:${theme.textColor};margin-bottom:2.4%;">${data.courseName}</div>` : ''}
      ${showOrganization ? `<div style="font-size:clamp(11px,1.5vw,16px);font-weight:500;color:${theme.primary};margin-bottom:2%;">${data.organizationName}</div>` : ''}
      ${showCustomMessage ? `<div style="font-size:clamp(10px,1.32vw,14px);color:#64748b;font-style:italic;margin-bottom:2.4%;max-width:70%;">${data.customMessage}</div>` : ''}
      <div style="display:flex;gap:clamp(20px,4.7vw,50px);margin-top:1.4%;">
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.95vw,10px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.09vw;margin-bottom:0.4%;">Certificate No.</div>
          <div style="font-size:clamp(9px,1.23vw,13px);font-weight:600;color:${theme.textColor};font-family:'Playfair Display',serif;">${data.certNumber}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.95vw,10px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.09vw;margin-bottom:0.4%;">Date Issued</div>
          <div style="font-size:clamp(9px,1.23vw,13px);font-weight:600;color:${theme.textColor};font-family:'Playfair Display',serif;">${data.issuedDate}</div>
        </div>
        ${showDuration ? `<div style="text-align:center;">
          <div style="font-size:clamp(7px,0.95vw,10px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.09vw;margin-bottom:0.4%;">Duration</div>
          <div style="font-size:clamp(9px,1.23vw,13px);font-weight:600;color:${theme.textColor};font-family:'Playfair Display',serif;">${data.duration} Hours</div>
        </div>` : ''}
      </div>
    </div>
    <div style="position:absolute;bottom:3.6%;right:4.3%;font-size:clamp(7px,0.95vw,10px);color:#94a3b8;font-family:monospace;letter-spacing:0.09vw;">${data.certNumber}</div>
  </div>
</body>
</html>`
}

function generateModernTemplate(data: CertificateData): string {
  const theme = getTheme(data.themeId)
  const content = getTypeContent(data.typeId, data.organizationName, data.customMessage)
  const showCourse = data.typeId === 'course_completion' && data.courseName
  const showOrganization = ['internship', 'training', 'experience'].includes(data.typeId) && data.organizationName
  const showCustomMessage = ['achievement', 'excellence', 'other'].includes(data.typeId) && data.customMessage
  const showDuration = data.typeId === 'course_completion' && data.duration && data.duration !== 'N/A'

  return `${commonHead(data.certNumber, theme)}
<body>
  <button class="print-btn" onclick="downloadPDF()">Download PDF</button>
  <div class="certificate">
    <div style="position:absolute;top:0;left:0;width:8px;height:100%;background:linear-gradient(180deg,${theme.primary},${theme.secondary});"></div>
    <div style="position:absolute;inset:0;border:1px solid ${theme.borderOuter};border-left:none;"></div>
    <div style="position:absolute;top:0;right:0;width:3px;height:100%;background:${theme.accent};"></div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;padding:6% 6% 6% 10%;text-align:left;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:3%;">
        <img src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg" alt="Skillplace Academy" style="width:auto;height:clamp(28px,3.5vw,48px);border-radius:6px;" />
        <div>
          <div style="font-family:'Inter',sans-serif;font-size:clamp(12px,1.8vw,18px);font-weight:700;color:${theme.primary};text-transform:uppercase;letter-spacing:0.1vw;">Skillplace Academy</div>
          <div style="font-size:clamp(7px,0.9vw,10px);color:#94a3b8;letter-spacing:0.15vw;text-transform:uppercase;">Learn | Practice | Get Placed</div>
        </div>
      </div>
      <div style="font-family:'Inter',sans-serif;font-size:clamp(28px,5vw,52px);font-weight:800;color:${theme.textColor};letter-spacing:-0.02em;line-height:1.1;margin-bottom:0.5%;">${content.title}</div>
      <div style="width:80px;height:4px;background:${theme.accent};margin:1.5% 0;border-radius:2px;"></div>
      <div style="font-size:clamp(10px,1.3vw,14px);color:#64748b;margin-bottom:3%;">${content.descriptionText}</div>
      <div style="font-family:'Inter',sans-serif;font-size:clamp(24px,4vw,42px);font-weight:700;color:${theme.primary};margin-bottom:3%;">${data.studentName}</div>
      ${showCourse ? `<div style="font-size:clamp(12px,1.6vw,16px);color:${theme.textColor};font-weight:500;margin-bottom:1%;">Course: ${data.courseName}</div>` : ''}
      ${showOrganization ? `<div style="font-size:clamp(12px,1.6vw,16px);color:${theme.textColor};font-weight:500;margin-bottom:1%;">Organization: ${data.organizationName}</div>` : ''}
      ${showCustomMessage ? `<div style="font-size:clamp(10px,1.3vw,14px);color:#64748b;font-style:italic;margin-bottom:2%;max-width:60%;">${data.customMessage}</div>` : ''}
      <div style="margin-top:auto;display:flex;gap:clamp(30px,6vw,60px);align-items:flex-end;">
        <div>
          <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.1vw;margin-bottom:4px;">Certificate No.</div>
          <div style="font-size:clamp(10px,1.3vw,14px);font-weight:600;color:${theme.textColor};font-family:'Inter',sans-serif;">${data.certNumber}</div>
        </div>
        <div>
          <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.1vw;margin-bottom:4px;">Date Issued</div>
          <div style="font-size:clamp(10px,1.3vw,14px);font-weight:600;color:${theme.textColor};font-family:'Inter',sans-serif;">${data.issuedDate}</div>
        </div>
        ${showDuration ? `<div>
          <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.1vw;margin-bottom:4px;">Duration</div>
          <div style="font-size:clamp(10px,1.3vw,14px);font-weight:600;color:${theme.textColor};font-family:'Inter',sans-serif;">${data.duration} Hours</div>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
}

function generateAcademicTemplate(data: CertificateData): string {
  const theme = getTheme(data.themeId)
  const content = getTypeContent(data.typeId, data.organizationName, data.customMessage)
  const showCourse = data.typeId === 'course_completion' && data.courseName
  const showOrganization = ['internship', 'training', 'experience'].includes(data.typeId) && data.organizationName
  const showCustomMessage = ['achievement', 'excellence', 'other'].includes(data.typeId) && data.customMessage

  return `${commonHead(data.certNumber, theme)}
<body>
  <button class="print-btn" onclick="downloadPDF()">Download PDF</button>
  <div class="certificate">
    <div style="position:absolute;inset:1.5%;border:3px solid ${theme.borderOuter};"></div>
    <div style="position:absolute;inset:2.5%;border:1px solid ${theme.borderInner};"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:clamp(45px,8.5vw,90px);font-family:'Playfair Display',serif;color:rgba(0,0,0,0.025);font-weight:700;pointer-events:none;white-space:nowrap;user-select:none;">SKILLPLACE</div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4% 6%;text-align:center;">
      <img src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg" alt="Skillplace Academy" style="width:auto;height:clamp(32px,5vw,60px);margin-bottom:1%;" />
      <div style="font-family:'Playfair Display',serif;font-size:clamp(13px,2vw,20px);font-weight:700;color:${theme.primary};letter-spacing:0.3vw;text-transform:uppercase;margin-bottom:0.2%;">Skillplace Academy</div>
      <div style="font-size:clamp(7px,0.9vw,10px);color:#94a3b8;letter-spacing:0.2vw;text-transform:uppercase;margin-bottom:2.5%;">Department of Education</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(22px,4vw,44px);font-weight:700;color:${theme.textColor};margin:0.5% 0;letter-spacing:0.3vw;text-transform:uppercase;">${content.title}</div>
      <div style="width:120px;height:2px;background:linear-gradient(90deg,transparent,${theme.accent},transparent);margin:1.5% 0;"></div>
      <div style="font-size:clamp(9px,1.2vw,12px);color:#64748b;margin-bottom:2%;">This is to certify that</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(22px,3.8vw,40px);font-weight:600;color:${theme.primary};margin:0.5% 0 1.5%;border-bottom:2px solid ${theme.accent};padding-bottom:1%;min-width:40%;">${data.studentName}</div>
      <div style="font-size:clamp(9px,1.2vw,12px);color:#64748b;margin-bottom:0.5%;">${content.descriptionText}</div>
      ${showCourse ? `<div style="font-size:clamp(13px,1.8vw,18px);font-weight:600;color:${theme.textColor};margin-bottom:1.5%;">${data.courseName}</div>` : ''}
      ${showOrganization ? `<div style="font-size:clamp(11px,1.4vw,15px);color:${theme.primary};font-weight:500;margin-bottom:1.5%;">${data.organizationName}</div>` : ''}
      ${showCustomMessage ? `<div style="font-size:clamp(9px,1.2vw,12px);color:#64748b;font-style:italic;margin-bottom:2%;max-width:65%;">${data.customMessage}</div>` : ''}
      <div style="display:flex;gap:clamp(40px,8vw,80px);margin-top:auto;padding-top:2%;">
        <div style="text-align:center;">
          <div style="width:100px;border-top:1px solid #94a3b8;padding-top:6px;">
            <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.08vw;">Dean Signature</div>
          </div>
        </div>
        <div style="text-align:center;">
          <div style="width:50px;height:50px;border:2px solid ${theme.primary};border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;">
            <span style="font-size:clamp(8px,1vw,11px);font-weight:700;color:${theme.primary};font-family:'Playfair Display',serif;">SEAL</span>
          </div>
          <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;">Institutional Seal</div>
        </div>
        <div style="text-align:center;">
          <div style="width:100px;border-top:1px solid #94a3b8;padding-top:6px;">
            <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.08vw;">Date: ${data.issuedDate}</div>
          </div>
        </div>
      </div>
    </div>
    <div style="position:absolute;bottom:3%;right:4%;font-size:clamp(7px,0.85vw,9px);color:#94a3b8;font-family:monospace;">${data.certNumber}</div>
  </div>
</body>
</html>`
}

function generateCorporateTemplate(data: CertificateData): string {
  const theme = getTheme(data.themeId)
  const content = getTypeContent(data.typeId, data.organizationName, data.customMessage)
  const showCourse = data.typeId === 'course_completion' && data.courseName
  const showOrganization = ['internship', 'training', 'experience'].includes(data.typeId) && data.organizationName
  const showCustomMessage = ['achievement', 'excellence', 'other'].includes(data.typeId) && data.customMessage
  const showDuration = data.typeId === 'course_completion' && data.duration && data.duration !== 'N/A'

  return `${commonHead(data.certNumber, theme)}
<body>
  <button class="print-btn" onclick="downloadPDF()">Download PDF</button>
  <div class="certificate">
    <div style="position:absolute;top:0;left:0;right:0;height:70px;background:linear-gradient(90deg,${theme.primary},${theme.secondary});display:flex;align-items:center;padding:0 6%;">
      <img src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg" alt="Skillplace Academy" style="width:auto;height:clamp(24px,3vw,40px);margin-right:14px;border-radius:4px;" />
      <div style="font-family:'Inter',sans-serif;font-size:clamp(11px,1.6vw,16px);font-weight:700;color:white;text-transform:uppercase;letter-spacing:0.15vw;">Skillplace Academy</div>
      <div style="margin-left:auto;font-size:clamp(7px,0.85vw,9px);color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.1vw;">Verification of Completion</div>
    </div>
    <div style="position:absolute;top:70px;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4% 8%;text-align:center;">
      <div style="font-size:clamp(8px,1vw,11px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.25vw;margin-bottom:1.5%;">Official Document</div>
      <div style="font-family:'Inter',sans-serif;font-size:clamp(26px,4.5vw,48px);font-weight:800;color:${theme.textColor};letter-spacing:-0.01em;margin-bottom:0.5%;">${content.title}</div>
      <div style="width:60px;height:3px;background:${theme.accent};margin:1.5% 0;border-radius:2px;"></div>
      <div style="font-size:clamp(10px,1.3vw,14px);color:#64748b;margin-bottom:3%;">${content.descriptionText}</div>
      <div style="font-family:'Inter',sans-serif;font-size:clamp(22px,3.6vw,38px);font-weight:700;color:${theme.primary};margin-bottom:3%;">${data.studentName}</div>
      ${showCourse ? `<div style="font-size:clamp(11px,1.4vw,14px);color:${theme.textColor};margin-bottom:1%;">Course: <strong>${data.courseName}</strong></div>` : ''}
      ${showOrganization ? `<div style="font-size:clamp(11px,1.4vw,14px);color:${theme.textColor};margin-bottom:1%;">Organization: <strong>${data.organizationName}</strong></div>` : ''}
      ${showCustomMessage ? `<div style="font-size:clamp(10px,1.2vw,13px);color:#64748b;font-style:italic;margin-bottom:2%;max-width:60%;">${data.customMessage}</div>` : ''}
      <div style="margin-top:auto;display:flex;justify-content:space-between;width:100%;padding:2% 4%;border-top:1px solid #e2e8f0;">
        <div style="text-align:left;">
          <div style="font-size:clamp(7px,0.8vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.08vw;">Certificate No.</div>
          <div style="font-size:clamp(9px,1.15vw,12px);font-weight:600;color:${theme.textColor};font-family:'Inter',sans-serif;">${data.certNumber}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.8vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.08vw;">Date Issued</div>
          <div style="font-size:clamp(9px,1.15vw,12px);font-weight:600;color:${theme.textColor};font-family:'Inter',sans-serif;">${data.issuedDate}</div>
        </div>
        ${showDuration ? `<div style="text-align:right;">
          <div style="font-size:clamp(7px,0.8vw,9px);color:#94a3b8;text-transform:uppercase;letter-spacing:0.08vw;">Duration</div>
          <div style="font-size:clamp(9px,1.15vw,12px);font-weight:600;color:${theme.textColor};font-family:'Inter',sans-serif;">${data.duration} Hours</div>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
}

function generateCreativeTemplate(data: CertificateData): string {
  const theme = getTheme(data.themeId)
  const content = getTypeContent(data.typeId, data.organizationName, data.customMessage)
  const showCourse = data.typeId === 'course_completion' && data.courseName
  const showOrganization = ['internship', 'training', 'experience'].includes(data.typeId) && data.organizationName
  const showCustomMessage = ['achievement', 'excellence', 'other'].includes(data.typeId) && data.customMessage
  const showDuration = data.typeId === 'course_completion' && data.duration && data.duration !== 'N/A'

  return `${commonHead(data.certNumber, theme)}
<body>
  <button class="print-btn" onclick="downloadPDF()">Download PDF</button>
  <div class="certificate">
    <div style="position:absolute;top:0;left:0;width:33%;height:100%;background:linear-gradient(180deg,${theme.primary},${theme.secondary});display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5%;color:white;">
      <img src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg" alt="Skillplace Academy" style="width:auto;height:clamp(40px,6vw,70px);margin-bottom:5%;filter:brightness(0) invert(1);" />
      <div style="font-size:clamp(7px,0.9vw,10px);opacity:0.8;margin-top:6px;letter-spacing:0.15vw;text-transform:uppercase;text-align:center;">Learn | Practice | Get Placed</div>
      <div style="width:40px;height:2px;background:${theme.accent};margin:12px 0;"></div>
      <div style="font-size:clamp(8px,1vw,11px);opacity:0.7;text-align:center;">${data.issuedDate}</div>
    </div>
    <div style="position:absolute;top:0;left:33%;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5% 6%;text-align:center;">
      <div style="font-family:'Playfair Display',serif;font-size:clamp(22px,4vw,42px);font-weight:700;color:${theme.textColor};margin-bottom:0.5%;">${content.title}</div>
      <div style="width:60px;height:3px;background:linear-gradient(90deg,${theme.accent},${theme.secondary});margin:1.5% 0;border-radius:2px;"></div>
      <div style="font-size:clamp(9px,1.2vw,12px);color:#64748b;margin-bottom:2.5%;">${content.descriptionText}</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(20px,3.5vw,36px);font-weight:600;color:${theme.primary};margin-bottom:2.5%;position:relative;">
        ${data.studentName}
        <div style="position:absolute;bottom:-4px;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,${theme.accent},transparent);"></div>
      </div>
      ${showCourse ? `<div style="font-size:clamp(11px,1.4vw,14px);color:${theme.textColor};font-weight:500;margin-bottom:1%;">${data.courseName}</div>` : ''}
      ${showOrganization ? `<div style="font-size:clamp(11px,1.4vw,14px);color:${theme.primary};font-weight:500;margin-bottom:1%;">${data.organizationName}</div>` : ''}
      ${showCustomMessage ? `<div style="font-size:clamp(9px,1.2vw,12px);color:#64748b;font-style:italic;margin-bottom:2%;max-width:60%;">${data.customMessage}</div>` : ''}
      <div style="margin-top:auto;display:flex;gap:clamp(20px,4vw,40px);align-items:flex-end;">
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;">Cert No.</div>
          <div style="font-size:clamp(9px,1.15vw,12px);font-weight:600;color:${theme.textColor};">${data.certNumber}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.85vw,9px);color:#94a3b8;text-transform:uppercase;">Duration</div>
          <div style="font-size:clamp(9px,1.15vw,12px);font-weight:600;color:${theme.textColor};">${showDuration ? `${data.duration} Hours` : 'N/A'}</div>
        </div>
      </div>
    </div>
    <div style="position:absolute;bottom:3%;right:4%;font-size:clamp(7px,0.85vw,9px);color:#94a3b8;font-family:monospace;">${data.certNumber}</div>
  </div>
</body>
</html>`
}

function generateElegantTemplate(data: CertificateData): string {
  const theme = getTheme(data.themeId)
  const content = getTypeContent(data.typeId, data.organizationName, data.customMessage)
  const showCourse = data.typeId === 'course_completion' && data.courseName
  const showOrganization = ['internship', 'training', 'experience'].includes(data.typeId) && data.organizationName
  const showCustomMessage = ['achievement', 'excellence', 'other'].includes(data.typeId) && data.customMessage
  const showDuration = data.typeId === 'course_completion' && data.duration && data.duration !== 'N/A'

  return `${commonHead(data.certNumber, theme)}
<body>
  <button class="print-btn" onclick="downloadPDF()">Download PDF</button>
  <div class="certificate">
    <div style="position:absolute;inset:1.2%;border:0.5px solid ${theme.borderOuter};"></div>
    <div style="position:absolute;inset:1.8%;border:0.5px solid ${theme.borderInner};"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-25deg);font-size:clamp(40px,7vw,80px);font-family:'Playfair Display',serif;color:rgba(0,0,0,0.02);font-weight:400;font-style:italic;pointer-events:none;white-space:nowrap;user-select:none;">DISTINCTION</div>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8% 10%;text-align:center;">
      <img src="https://weebasgxtemffakbvcfa.supabase.co/storage/v1/object/public/skillplaceacademy/images/skillplace_logo.jpg" alt="Skillplace Academy" style="width:auto;height:clamp(20px,3vw,40px);margin-bottom:2%;opacity:0.7;" />
      <div style="font-family:'Playfair Display',serif;font-size:clamp(11px,1.5vw,15px);font-weight:400;color:${theme.primary};letter-spacing:0.4vw;text-transform:uppercase;margin-bottom:0.3%;">Skillplace Academy</div>
      <div style="font-size:clamp(7px,0.8vw,9px);color:#94a3b8;letter-spacing:0.2vw;text-transform:uppercase;margin-bottom:4%;">Learn | Practice | Get Placed</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(24px,4.2vw,44px);font-weight:400;color:${theme.textColor};letter-spacing:0.05em;font-style:italic;margin-bottom:0.5%;">${content.title}</div>
      <div style="width:40px;height:0.5px;background:${theme.accent};margin:2% 0;"></div>
      <div style="font-size:clamp(9px,1.1vw,12px);color:#94a3b8;margin-bottom:3%;letter-spacing:0.1vw;">${content.descriptionText}</div>
      <div style="font-family:'Playfair Display',serif;font-size:clamp(20px,3.5vw,36px);font-weight:400;color:${theme.primary};font-style:italic;margin-bottom:3%;letter-spacing:0.03em;">${data.studentName}</div>
      ${showCourse ? `<div style="font-size:clamp(10px,1.2vw,13px);color:${theme.textColor};font-weight:300;margin-bottom:0.8%;letter-spacing:0.05em;">${data.courseName}</div>` : ''}
      ${showOrganization ? `<div style="font-size:clamp(10px,1.2vw,13px);color:${theme.textColor};font-weight:300;margin-bottom:0.8%;letter-spacing:0.05em;">${data.organizationName}</div>` : ''}
      ${showCustomMessage ? `<div style="font-size:clamp(9px,1.1vw,12px);color:#94a3b8;font-style:italic;margin-bottom:3%;max-width:55%;letter-spacing:0.03em;">${data.customMessage}</div>` : ''}
      <div style="margin-top:auto;display:flex;gap:clamp(50px,10vw,100px);align-items:flex-end;">
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.8vw,9px);color:#cbd5e1;text-transform:uppercase;letter-spacing:0.15vw;">No. ${data.certNumber}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:clamp(7px,0.8vw,9px);color:#cbd5e1;text-transform:uppercase;letter-spacing:0.15vw;">${data.issuedDate}</div>
        </div>
        ${showDuration ? `<div style="text-align:center;">
          <div style="font-size:clamp(7px,0.8vw,9px);color:#cbd5e1;text-transform:uppercase;letter-spacing:0.15vw;">${data.duration} Hours</div>
        </div>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
}

export function generateCertificateHTML(data: CertificateData): string {
  switch (data.themeId) {
    case 'classic':
      return generateClassicTemplate(data)
    case 'modern':
      return generateModernTemplate(data)
    case 'academic':
      return generateAcademicTemplate(data)
    case 'corporate':
      return generateCorporateTemplate(data)
    case 'creative':
      return generateCreativeTemplate(data)
    case 'elegant':
      return generateElegantTemplate(data)
    default:
      return generateClassicTemplate(data)
  }
}
