const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/rest\/v1\/?$/, '');
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function createMissingTables() {
  console.log('Creating missing tables...');

  const url = `${supabaseUrl}/rest/v1/rpc/exec_sql`;
  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };

  const tables = [
    `CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      avatar_url TEXT,
      role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS public.enrollments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
      progress_percent INTEGER DEFAULT 0,
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ DEFAULT NULL,
      UNIQUE(user_id, course_id)
    )`,
    `CREATE TABLE IF NOT EXISTS public.payments (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'INR',
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS public.certificates (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
      certificate_number TEXT UNIQUE NOT NULL,
      issued_at TIMESTAMPTZ DEFAULT NOW(),
      pdf_url TEXT,
      UNIQUE(user_id, course_id)
    )`,
    `CREATE TABLE IF NOT EXISTS public.notifications (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT,
      type TEXT DEFAULT 'info',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS public.student_projects (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      project_url TEXT,
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
  ];

  for (const sql of tables) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: sql })
      });
      if (response.ok) {
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/)[1];
        console.log(`✅ Created table: ${tableName}`);
      } else {
        const text = await response.text();
        const tableName = sql.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/)[1];
        console.log(`❌ Failed ${tableName}: ${text.substring(0, 100)}`);
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
  }
}

createMissingTables().catch(console.error);
