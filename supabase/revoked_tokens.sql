create table public.revoked_tokens (
  id uuid not null default gen_random_uuid (),
  token text not null,
  user_id uuid not null,
  revoked_at timestamp with time zone null default now(),
  reason text null,
  ip_address inet null,
  constraint revoked_tokens_pkey primary key (id),
  constraint revoked_tokens_token_key unique (token)
) TABLESPACE pg_default;

create index IF not exists idx_revoked_tokens_token on public.revoked_tokens using btree (token) TABLESPACE pg_default;

create index IF not exists idx_revoked_tokens_user on public.revoked_tokens using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_revoked_tokens on public.revoked_tokens using btree (token) TABLESPACE pg_default;