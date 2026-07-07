create table public.live_classes (
  id uuid not null default gen_random_uuid (),
  course_id uuid null,
  title text not null,
  description text null,
  scheduled_at timestamp with time zone not null,
  duration_minutes integer null default 60,
  meeting_url text null,
  recording_url text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint live_classes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_live_classes_course on public.live_classes using btree (course_id) TABLESPACE pg_default;