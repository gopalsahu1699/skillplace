import { createClient, SupabaseClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '')

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceKey) {
  // Service key missing - admin operations will fail
}

if (!supabaseUrl) {
  // Supabase URL missing - admin operations will fail
}

export const adminSupabase: SupabaseClient = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey)
  : (null as any)
