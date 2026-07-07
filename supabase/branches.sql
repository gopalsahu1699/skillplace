create table public.branches (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  description text null,
  icon text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint branches_pkey primary key (id),
  constraint branches_name_key unique (name),
  constraint branches_slug_key unique (slug)
) TABLESPACE pg_default;