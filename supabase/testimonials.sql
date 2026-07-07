create table public.testimonials (
  id uuid not null default gen_random_uuid (),
  student_name text not null,
  student_photo text null,
  course_name text null,
  rating integer null default 5,
  review text not null,
  is_featured boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint testimonials_pkey primary key (id),
  constraint testimonials_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;