-- Migration: Add is_popular and display_order to program_fees
-- Enables admin to mark a mode as "Popular" and set display ordering

alter table public.program_fees add column if not exists is_popular boolean not null default false;
alter table public.program_fees add column if not exists display_order integer not null default 0;

create index if not exists idx_program_fees_display_order on public.program_fees using btree (program_id, display_order);
