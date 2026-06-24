import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'

// Read service key from env at module load time
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceKey) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not set')
}

export const adminSupabase: SupabaseClient = createClient(supabaseUrl, serviceKey)
