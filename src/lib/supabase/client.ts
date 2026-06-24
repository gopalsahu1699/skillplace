import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://weebasgxtemffakbvcfa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Client-side Supabase client using localStorage (default)
// This works perfectly in the browser for auth
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
