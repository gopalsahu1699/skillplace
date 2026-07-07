create table public.modules (
  id uuid not null default gen_random_uuid (),
  course_id uuid null,
  title text not null,
  description text null,
  order_index integer null default 0,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint modules_pkey primary key (id),
  constraint modules_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_modules_course on public.modules using btree (course_id) TABLESPACE pg_default;