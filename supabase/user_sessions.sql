create table public.user_sessions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  session_token text not null,
  refresh_token text null,
  access_token text null,
  ip_address inet null,
  user_agent text null,
  device_type text null,
  browser text null,
  os text null,
  login_method text null default 'email'::text,
  is_active boolean null default true,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone null default now(),
  last_active_at timestamp with time zone null default now(),
  logout_at timestamp with time zone null,
  is_revoked boolean null default false,
  revoked_at timestamp with time zone null,
  revoke_reason text null,
  constraint user_sessions_pkey primary key (id),
  constraint user_sessions_session_token_key unique (session_token),
  constraint user_sessions_device_type_check check (
    (
      device_type = any (
        array[
          'desktop'::text,
          'mobile'::text,
          'tablet'::text,
          'unknown'::text
        ]
      )
    )
  ),
  constraint user_sessions_login_method_check check (
    (
      login_method = any (
        array[
          'email'::text,
          'google'::text,
          'github'::text,
          'admin'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_user_sessions_user on public.user_sessions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_sessions_user_active on public.user_sessions using btree (user_id, is_active) TABLESPACE pg_default
where
  (is_active = true);

create index IF not exists idx_user_sessions_user_id on public.user_sessions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_sessions_token on public.user_sessions using btree (session_token) TABLESPACE pg_default;

create index IF not exists idx_user_sessions_active on public.user_sessions using btree (is_active) TABLESPACE pg_default
where
  (is_active = true);

create index IF not exists idx_user_sessions_expires on public.user_sessions using btree (expires_at) TABLESPACE pg_default;

create index IF not exists idx_user_sessions_created on public.user_sessions using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_user_sessions_last_active on public.user_sessions using btree (last_active_at desc) TABLESPACE pg_default;

create trigger trigger_single_session
after INSERT on user_sessions for EACH row
execute FUNCTION enforce_single_session ();