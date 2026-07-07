create table public.training_programs (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text not null,
  description text null,
  short_description text null,
  program_type text not null,
  branch_id uuid null,
  price integer not null default 0,
  discount_price integer null,
  duration_weeks integer null,
  features text[] null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_featured boolean null default false,
  skill_level text null,
  career_outcome text null,
  student_count integer null default 0,
  rating numeric(2, 1) null default 0,
  display_order integer null default 0,
  constraint training_programs_pkey primary key (id),
  constraint training_programs_slug_key unique (slug),
  constraint training_programs_branch_id_fkey foreign KEY (branch_id) references branches (id) on delete set null,
  constraint training_programs_program_type_check check (
    (
      program_type = any (
        array['online'::text, 'offline'::text, 'hybrid'::text]
      )
    )
  ),
  constraint training_programs_skill_level_check check (
    (
      skill_level = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_training_programs_is_featured on public.training_programs using btree (is_featured) TABLESPACE pg_default;

create index IF not exists idx_training_programs_display_order on public.training_programs using btree (display_order) TABLESPACE pg_default;

create index IF not exists idx_training_programs_branch on public.training_programs using btree (branch_id) TABLESPACE pg_default;

create index IF not exists idx_training_programs_type on public.training_programs using btree (program_type) TABLESPACE pg_default;