// scripts/create-admin.mjs - Creates admin user in Supabase
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=')
    env[key.trim()] = rest.join('=').trim()
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '')
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceKey)

async function createAdmin() {
  console.log('Creating admin user...')

  // First, create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@skillplace.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin',
      phone: '',
    },
  })

  if (authError) {
    console.log('Auth error:', authError.message)
    // User might already exist, try to get existing user
    if (authError.message.includes('already exists')) {
      console.log('Admin user already exists in auth, checking profile...')
    } else {
      process.exit(1)
    }
  }

  const userId = authData?.user?.id

  if (userId) {
    // Create profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: 'admin@skillplace.com',
      full_name: 'Admin',
      phone: '',
      role: 'admin',
    })

    if (profileError) {
      console.log('Profile error:', profileError.message)
    } else {
      console.log('✅ Admin profile created/updated')
    }
  } else {
    // Try to find existing user
    console.log('Looking for existing admin user...')
    const { data: existing } = await supabase.auth.admin.listUsers()
    const adminUser = existing?.users?.find(u => u.email === 'admin@skillplace.com')
    if (adminUser) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: adminUser.id,
        email: 'admin@skillplace.com',
        full_name: 'Admin',
        phone: '',
        role: 'admin',
      })
      if (profileError) {
        console.log('Profile upsert error:', profileError.message)
      } else {
        console.log('✅ Admin profile updated for existing user')
      }
    } else {
      console.log('❌ Could not find or create admin user')
    }
  }

  console.log('\n✅ Admin setup complete!')
  console.log('Email: admin@skillplace.com')
  console.log('Password: admin123')
}

createAdmin().catch(console.error)
