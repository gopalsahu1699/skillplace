// scripts/create-employee.mjs - Creates employee user in Supabase
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

// Default values — override via CLI args: node create-employee.mjs email name password
const email = process.argv[2] || 'employee@skillplace.com'
const fullName = process.argv[3] || 'Employee User'
const password = process.argv[4] || 'employee123'

async function createEmployee() {
  console.log(`Creating employee: ${email}`)

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone: '',
    },
  })

  if (authError) {
    console.log('Auth error:', authError.message)
    if (authError.message.includes('already exists')) {
      console.log('Employee user already exists in auth, checking profile...')
    } else {
      process.exit(1)
    }
  }

  const userId = authData?.user?.id

  if (userId) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email,
      full_name: fullName,
      phone: '',
      role: 'employee',
    })

    if (profileError) {
      console.log('Profile error:', profileError.message)
    } else {
      console.log('✅ Employee profile created/updated')
    }
  } else {
    console.log('Looking for existing employee user...')
    const { data: existing } = await supabase.auth.admin.listUsers()
    const empUser = existing?.users?.find(u => u.email === email)
    if (empUser) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: empUser.id,
        email,
        full_name: fullName,
        phone: '',
        role: 'employee',
      })
      if (profileError) {
        console.log('Profile upsert error:', profileError.message)
      } else {
        console.log('✅ Employee profile updated for existing user')
      }
    } else {
      console.log('❌ Could not find or create employee user')
    }
  }

  console.log('\n✅ Employee setup complete!')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
}

createEmployee().catch(console.error)
