create table public.tests (
  id uuid not null default gen_random_uuid (),
  course_id uuid null,
  title text not null,
  description text null,
  passing_score integer null default 70,
  time_limit_minutes integer null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint tests_pkey primary key (id),
  constraint tests_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_tests_course on public.tests using btree (course_id) TABLESPACE pg_default;