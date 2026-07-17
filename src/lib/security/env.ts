const REQUIRED_SERVER_ENV_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDFLARE_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'CLOUDFLARE_API_TOKEN',
  'VIDEO_SECRET',
  'CRON_SECRET',
  'CSRF_SECRET',
] as const

const REQUIRED_PUBLIC_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SITE_URL',
] as const

export function validateEnvironment(): string[] {
  const missing: string[] = []

  for (const key of REQUIRED_SERVER_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  for (const key of REQUIRED_PUBLIC_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  return missing
}

export function validateNextPublicEnv(): void {
  const NEXT_PUBLIC_PREFIX = 'NEXT_PUBLIC_'

  for (const key of Object.keys(process.env)) {
    if (key.startsWith(NEXT_PUBLIC_PREFIX)) {
      const serverKey = key.slice(NEXT_PUBLIC_PREFIX.length)
      const serverOnlyVars = [
        'SUPABASE_SERVICE_ROLE_KEY',
        'VIDEO_SECRET',
        'CRON_SECRET',
        'CSRF_SECRET',
        'CLOUDFLARE_API_TOKEN',
        'R2_SECRET_ACCESS_KEY',
        'R2_ACCESS_KEY_ID',
      ]
      if (serverOnlyVars.includes(serverKey)) {
        if (process.env.NODE_ENV === 'production') {
          console.error(`SECURITY ALERT: Server-only secret ${key} should not be prefixed with NEXT_PUBLIC_`)
        }
      }
    }
  }
}

export function getSecureCookieOptions(maxAge: number = 86400) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
