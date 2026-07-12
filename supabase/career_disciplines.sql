create table public.career_disciplines (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  color text not null,
  gradient_from text not null,
  gradient_to text not null,
  roles text[] not null default '{}',
  skills text[] not null default '{}',
  demand text not null,
  salary text not null,
  growth text not null,
  popular boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint career_disciplines_pkey primary key (id),
  constraint career_disciplines_slug_key unique (slug)
) TABLESPACE pg_default;

create index if not exists idx_career_disciplines_display_order on public.career_disciplines using btree (display_order) TABLESPACE pg_default;
create index if not exists idx_career_disciplines_active on public.career_disciplines using btree (is_active) TABLESPACE pg_default;

