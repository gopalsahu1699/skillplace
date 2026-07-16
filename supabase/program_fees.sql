create table public.program_fees (
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
) TABLESPACE pg_default;

create index if not exists idx_program_fees_program_id on public.program_fees using btree (program_id) TABLESPACE pg_default;

create index if not exists idx_program_fees_program_type on public.program_fees using btree (program_type) TABLESPACE pg_default;

-- Enable RLS
alter table public.program_fees enable row level security;

-- RLS policies
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
