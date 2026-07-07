create table public.courses (
  id uuid not null default gen_random_uuid (),
  title text not null,
  slug text not null,
  description text null,
  short_description text null,
  thumbnail_url text null,
  price integer not null default 0,
  discount_price integer null,
  duration_hours integer null,
  level text null default 'beginner'::text,
  branch_id uuid null,
  is_featured boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint courses_pkey primary key (id),
  constraint courses_slug_key unique (slug),
  constraint courses_branch_id_fkey foreign KEY (branch_id) references branches (id) on delete set null,
  constraint courses_level_check check (
    (
      level = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_courses_branch on public.courses using btree (branch_id) TABLESPACE pg_default;