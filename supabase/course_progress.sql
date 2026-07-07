create table public.course_progress (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  lesson_id uuid null,
  completed boolean null default false,
  completed_at timestamp with time zone null,
  constraint course_progress_pkey primary key (id),
  constraint course_progress_user_id_lesson_id_key unique (user_id, lesson_id)
) TABLESPACE pg_default;

create index IF not exists idx_course_progress_user on public.course_progress using btree (user_id) TABLESPACE pg_default;