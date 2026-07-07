create table public.video_playback_log (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  lesson_id uuid null,
  course_id uuid null,
  ip_address text null,
  user_agent text null,
  action text not null default 'stream'::text,
  watch_duration_seconds integer null default 0,
  bytes_served bigint null default 0,
  range_requested text null,
  success boolean null default true,
  error_message text null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  constraint video_playback_log_pkey primary key (id),
  constraint video_playback_log_course_id_fkey foreign KEY (course_id) references courses (id) on delete set null,
  constraint video_playback_log_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete set null,
  constraint video_playback_log_user_id_fkey foreign KEY (user_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_video_playback_log_user on public.video_playback_log using btree (user_id, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_video_playback_log_lesson on public.video_playback_log using btree (lesson_id) TABLESPACE pg_default;

create index IF not exists idx_video_playback_log_action on public.video_playback_log using btree (action) TABLESPACE pg_default;

create index IF not exists idx_video_playback_log_created on public.video_playback_log using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_video_playback_log_ip on public.video_playback_log using btree (ip_address) TABLESPACE pg_default;