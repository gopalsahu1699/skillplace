create table public.enrollments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  program_id uuid null,
  branch_id uuid null,
  status text null default 'pending'::text,
  notes text null,
  enrolled_at timestamp with time zone null default now(),
  completed_at timestamp with time zone null,
  program_type text null,
  constraint enrollments_pkey primary key (id),
  constraint enrollments_branch_id_fkey foreign KEY (branch_id) references branches (id) on delete set null,
  constraint enrollments_program_id_fkey foreign KEY (program_id) references training_programs (id) on delete CASCADE,
  constraint enrollments_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint enrollments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'active'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_enrollments_status on public.enrollments using btree (status) TABLESPACE pg_default;

create index IF not exists idx_enrollments_user on public.enrollments using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_enrollments_program on public.enrollments using btree (program_id) TABLESPACE pg_default;