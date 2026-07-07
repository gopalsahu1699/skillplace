create table public.certificates (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  certificate_number text not null,
  issued_at timestamp with time zone null default now(),
  pdf_url text null,
  certificate_type text null default 'course_completion'::text,
  theme text null default 'classic_blue'::text,
  organization_name text null,
  custom_message text null,
  constraint certificates_pkey primary key (id),
  constraint certificates_certificate_number_key unique (certificate_number),
  constraint certificates_user_id_course_id_key unique (user_id, course_id)
) TABLESPACE pg_default;

create index IF not exists idx_certificates_user on public.certificates using btree (user_id) TABLESPACE pg_default;