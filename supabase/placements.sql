create table public.placements (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  course_id uuid null,
  company_name text null,
  role text null,
  package_lpa numeric null,
  placed_at timestamp with time zone not null default now(),
  notes text null,
  is_featured boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint placements_pkey primary key (id),
  constraint placements_course_id_fkey foreign KEY (course_id) references courses (id) on delete set null,
  constraint placements_student_id_fkey foreign KEY (student_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_placements_student on public.placements using btree (student_id) TABLESPACE pg_default;