create table public.partners (
  id uuid not null default gen_random_uuid (),
  name text not null,
  short text not null,
  description text not null,
  type text not null default 'Sponsor',
  logo text null,
  color text not null default 'bg-blue-600',
  display_order integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint partners_pkey primary key (id)
) TABLESPACE pg_default;

create index if not exists idx_partners_display_order on public.partners using btree (display_order) TABLESPACE pg_default;
