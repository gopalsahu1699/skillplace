create table public.course_enrollments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  status text null default 'active'::text,
  enrolled_at timestamp with time zone null default now(),
  completed_at timestamp with time zone null,
  constraint course_enrollments_pkey primary key (id),
  constraint course_enrollments_user_id_course_id_key unique (user_id, course_id),
  constraint course_enrollments_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint course_enrollments_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint course_enrollments_status_check check (
    (
      status = any (
        array[
          'active'::text,
          'completed'::text,
          'expired'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_course_enrollments_user on public.course_enrollments using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_course_enrollments_course on public.course_enrollments using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_course_enrollments_status on public.course_enrollments using btree (status) TABLESPACE pg_default;