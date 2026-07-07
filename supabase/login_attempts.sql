create table public.login_attempts (
  id uuid not null default gen_random_uuid (),
  email text not null,
  ip_address inet not null,
  attempted_at timestamp with time zone null default now(),
  success boolean null default false,
  failure_reason text null,
  constraint login_attempts_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_login_attempts_email on public.login_attempts using btree (email, attempted_at desc) TABLESPACE pg_default;

create index IF not exists idx_login_attempts_ip on public.login_attempts using btree (ip_address, attempted_at desc) TABLESPACE pg_default;