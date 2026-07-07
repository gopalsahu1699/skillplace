create table public.faqs (
  id uuid not null default gen_random_uuid (),
  question text not null,
  answer text not null,
  display_order integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint faqs_pkey primary key (id)
) TABLESPACE pg_default;
