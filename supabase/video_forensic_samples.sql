create table public.video_forensic_samples (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  lesson_id uuid null,
  sample_timestamp timestamp with time zone null default now(),
  video_current_time real null default 0,
  screenshot_b64 text null,
  user_agent text null,
  screen_width integer null,
  screen_height integer null,
  ip_address text null,
  created_at timestamp with time zone null default now(),
  flagged boolean null default false,
  flag_reason text null,
  flagged_at timestamp with time zone null,
  warning_sent_at timestamp with time zone null,
  access_revoked_at timestamp with time zone null,
  constraint video_forensic_samples_pkey primary key (id),
  constraint video_forensic_samples_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete set null,
  constraint video_forensic_samples_user_id_fkey foreign KEY (user_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_forensic_samples_user on public.video_forensic_samples using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_forensic_samples_lesson on public.video_forensic_samples using btree (lesson_id) TABLESPACE pg_default;

create index IF not exists idx_forensic_samples_flagged on public.video_forensic_samples using btree (flagged) TABLESPACE pg_default
where
  (flagged = true);