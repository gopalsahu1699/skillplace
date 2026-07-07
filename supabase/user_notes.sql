create table public.user_notes (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  lesson_id uuid null,
  content text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_notes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_notes_user on public.user_notes using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_user_notes_lesson on public.user_notes using btree (lesson_id) TABLESPACE pg_default;

create index IF not exists idx_user_notes_user_lesson on public.user_notes using btree (user_id, lesson_id) TABLESPACE pg_default;