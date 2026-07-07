create table public.batches (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  course_id uuid null,
  program_type text null default 'online_course'::text,
  start_date date null,
  end_date date null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint batches_pkey primary key (id),
  constraint batches_course_id_fkey foreign KEY (course_id) references courses (id),
  constraint batches_program_type_check check (
    (
      program_type = any (
        array[
          'online_course'::text,
          'offline'::text,
          'hybrid'::text,
          'single_course'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_batches_course_id on public.batches using btree (course_id) TABLESPACE pg_default;