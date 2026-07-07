create table public.scheduled_notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  target_user_id uuid null,
  title text not null,
  message text null,
  type text null default 'info'::text,
  scheduled_at timestamp with time zone not null,
  sent_at timestamp with time zone null,
  status text null default 'pending'::text,
  metadata jsonb null default '{"is_scheduled": true}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint scheduled_notifications_pkey primary key (id),
  constraint scheduled_notifications_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'sent'::text,
          'failed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_scheduled_notifications_status on public.scheduled_notifications using btree (status) TABLESPACE pg_default;

create index IF not exists idx_scheduled_notifications_at on public.scheduled_notifications using btree (scheduled_at) TABLESPACE pg_default;