create table public.lesson_progress (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  lesson_id uuid null,
  is_completed boolean null default false,
  watched_seconds integer null default 0,
  completed_at timestamp with time zone null,
  constraint lesson_progress_pkey primary key (id),
  constraint lesson_progress_user_id_lesson_id_key unique (user_id, lesson_id),
  constraint lesson_progress_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint lesson_progress_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_lesson_progress_user on public.lesson_progress using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_lesson_progress_lesson on public.lesson_progress using btree (lesson_id) TABLESPACE pg_default;