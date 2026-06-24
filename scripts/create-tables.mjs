
// create-tables.mjs - Uses Supabase Management API to create tables
const SUPABASE_URL = 'https://weebasgxtemffakbvcfa.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function exec(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/weebasgxtemffakbvcfa/sql`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

async function main() {
  console.log('Creating missing tables via Management API...');

  const sqls = [
    `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
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
    )`,
    `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY`,
  ];

  for (const sql of sqls) {
    const { ok, status, body } = await exec(sql);
    if (ok) {
      console.log('✅ OK:', sql.split('\n')[0].substring(0, 60));
    } else {
      console.log(`❌ ${status}:`, sql.split('\n')[0].substring(0, 60), body.substring(0, 100));
    }
  }
}

main().catch(e => console.error(e));
