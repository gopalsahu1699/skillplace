import { ImageResponse } from 'next/og'

export const alt = 'Skillplace Academy - Build Skills. Build Career.'
export const size = { width: 1200, height: 600 }
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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #131b2e 100%)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 64px',
            textAlign: 'center',
            border: '2px solid rgba(99,102,241,0.3)',
            borderRadius: '24px',
            margin: '32px',
            background: 'rgba(15,23,42,0.8)',
          }}
        >
          <h1
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Skillplace Academy
          </h1>
          <p
            style={{
              fontSize: '30px',
              color: '#6366f1',
              marginBottom: '28px',
              fontWeight: 700,
            }}
          >
            Build Skills. Build Career.
          </p>
          <p
            style={{
              fontSize: '20px',
              color: '#94a3b8',
              fontWeight: 400,
              maxWidth: '700px',
            }}
          >
            India&apos;s leading engineering skill development academy.
            Practical training, expert mentors, 100% placement assistance.
          </p>
        </div>
      </div>
    ),
    { ...size },
  )
}
