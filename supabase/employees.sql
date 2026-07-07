create table public.employees (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text not null,
  phone text null,
  role text null default 'instructor'::text,
  department text null,
  bio text null,
  photo_url text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint employees_pkey primary key (id),
  constraint employees_email_key unique (email),
  constraint employees_role_check check (
    (
      role = any (
        array[
          'admin'::text,
          'instructor'::text,
          'counselor'::text,
          'support'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;