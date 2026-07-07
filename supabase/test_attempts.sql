create table public.test_attempts (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  test_id uuid null,
  answers jsonb null,
  score integer null,
  passed boolean null default false,
  started_at timestamp with time zone null default now(),
  completed_at timestamp with time zone null,
  constraint test_attempts_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_test_attempts_user on public.test_attempts using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_test_attempts_test on public.test_attempts using btree (test_id) TABLESPACE pg_default;