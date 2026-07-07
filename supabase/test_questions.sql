create table public.test_questions (
  id uuid not null default gen_random_uuid (),
  test_id uuid null,
  question text not null,
  options text[] null,
  correct_answer integer null,
  order_index integer null default 0,
  created_at timestamp with time zone null default now(),
  constraint test_questions_pkey primary key (id),
  constraint test_questions_test_id_fkey foreign KEY (test_id) references tests (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_test_questions_test on public.test_questions using btree (test_id) TABLESPACE pg_default;