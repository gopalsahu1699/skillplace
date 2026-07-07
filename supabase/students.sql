create table public.students (
  id uuid not null default gen_random_uuid (),
  email text not null,
  full_name text null,
  phone text null,
  avatar_url text null,
  program_type text null,
  batch_id uuid null,
  branch_id uuid null,
  is_active boolean null default true,
  enrolled_at timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint students_pkey primary key (id),
  constraint students_batch_id_fkey foreign KEY (batch_id) references batches (id) on delete set null,
  constraint students_branch_id_fkey foreign KEY (branch_id) references branches (id) on delete set null
) TABLESPACE pg_default;