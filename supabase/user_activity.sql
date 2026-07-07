create table public.user_activity (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  session_id uuid null,
  action text not null,
  resource text null,
  ip_address inet null,
  user_agent text null,
  created_at timestamp with time zone null default now(),
  constraint user_activity_pkey primary key (id),
  constraint user_activity_session_id_fkey foreign KEY (session_id) references user_sessions (id) on delete CASCADE,
  constraint user_activity_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_activity_user on public.user_activity using btree (user_id, created_at desc) TABLESPACE pg_default;