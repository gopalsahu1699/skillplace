import { ImageResponse } from 'next/og'

export const alt = 'Skillplace Academy - Build Skills. Build Career.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #131b2e 0%, #1a2744 50%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-30%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40%',
            left: '-20%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 60px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Skillplace Academy
          </h1>
          <p
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              marginBottom: '24px',
              fontWeight: 500,
            }}
          >
            Build Skills. Build Career.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '24px',
              fontSize: '18px',
              color: '#6366f1',
              fontWeight: 600,
            }}
          >
            <span>Engineering Training</span>
            <span>•</span>
            <span>100% Placement Assistance</span>
            <span>•</span>
            <span>Bilaspur, CG</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
