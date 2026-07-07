create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  target_user_id uuid null,
  title text not null,
  message text null,
  type text null default 'info'::text,
  is_read boolean null default false,
  metadata jsonb null,
  created_at timestamp with time zone null default now(),
  constraint notifications_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user on public.notifications using btree (user_id) TABLESPACE pg_default;