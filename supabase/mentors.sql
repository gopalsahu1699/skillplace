create table public.mentors (
  id uuid not null default gen_random_uuid (),
  name text not null,
  position text not null,
  company text not null,
  expertise text not null,
  experience text not null,
  bio text not null,
  initials text not null,
  gradient text not null,
  image text null,
  linkedin_url text null,
  display_order integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint mentors_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_mentors_display_order on public.mentors using btree (display_order) TABLESPACE pg_default;