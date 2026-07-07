create table public.student_projects (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  title text not null,
  description text null,
  image_url text null,
  project_url text null,
  is_approved boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint student_projects_pkey primary key (id)
) TABLESPACE pg_default;