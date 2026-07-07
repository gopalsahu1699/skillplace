create table public.profiles (
  id uuid not null,
  email text not null,
  full_name text null,
  phone text null,
  avatar_url text null,
  role text null default 'student'::text,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  program_type text null,
  date_of_birth date null,
  gender text null,
  location text null,
  date_of_joining date null,
  bio text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_role_check check (
    (
      role = any (array['student'::text, 'admin'::text])
    )
  )
) TABLESPACE pg_default;