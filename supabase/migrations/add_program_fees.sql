-- Migration: Add program_fees table for multi-mode pricing
-- This replaces the single program_type + price on training_programs
-- with per-mode pricing (online/offline/hybrid each have their own fee).

-- 1. Create the program_fees table
create table if not exists public.program_fees (
  id uuid not null default gen_random_uuid(),
  program_id uuid not null,
  program_type text not null,
  price integer not null default 0,
  discount_price integer null,
  is_active boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint program_fees_pkey primary key (id),
  constraint program_fees_program_id_fkey foreign KEY (program_id) references training_programs (id) on delete cascade,
  constraint program_fees_program_type_check check (
    program_type = any (array['online'::text, 'offline'::text, 'hybrid'::text])
  ),
  constraint program_fees_program_type_unique unique (program_id, program_type)
);

create index if not exists idx_program_fees_program_id on public.program_fees using btree (program_id);
create index if not exists idx_program_fees_program_type on public.program_fees using btree (program_type);

-- 2. Migrate existing data from training_programs into program_fees
insert into public.program_fees (program_id, program_type, price, discount_price)
select id, program_type, price, discount_price
from public.training_programs
where is_active = true
on conflict (program_id, program_type) do nothing;

-- 3. Add selected_mode column to enrollments
alter table public.enrollments add column if not exists selected_mode text null;

-- Add check constraint for selected_mode
alter table public.enrollments add constraint enrollments_selected_mode_check
  check (selected_mode = any (array['online'::text, 'offline'::text, 'hybrid'::text]));

-- 4. Add program_type column to payments (for reporting)
alter table public.payments add column if not exists program_type text null;

-- 5. Enable RLS
alter table public.program_fees enable row level security;

-- 6. RLS policies
create policy "Program fees are publicly readable"
  on public.program_fees for select
  using (true);

create policy "Admin can manage program fees"
  on public.program_fees for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 7. Update Database.md documentation reference order
-- program_fees should run after training_programs.sql, before enrollments.sql
