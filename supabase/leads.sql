create table public.leads (
  id uuid not null default gen_random_uuid (),
  name text not null,
  email text not null,
  phone text null,
  message text null,
  source text null default 'website'::text,
  status text null default 'new'::text,
  created_at timestamp with time zone null default now(),
  constraint leads_pkey primary key (id),
  constraint leads_status_check check (
    (
      status = any (
        array[
          'new'::text,
          'contacted'::text,
          'converted'::text,
          'closed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;