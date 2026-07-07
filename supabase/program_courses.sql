create table public.program_courses (
  id uuid not null default gen_random_uuid (),
  program_id uuid null,
  course_id uuid null,
  order_index integer null default 0,
  constraint program_courses_pkey primary key (id),
  constraint program_courses_program_id_course_id_key unique (program_id, course_id),
  constraint program_courses_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint program_courses_program_id_fkey foreign KEY (program_id) references training_programs (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_program_courses_program on public.program_courses using btree (program_id) TABLESPACE pg_default;