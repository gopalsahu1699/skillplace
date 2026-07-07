create table public.lessons (
  id uuid not null default gen_random_uuid (),
  module_id uuid null,
  title text not null,
  content text null,
  video_url text null,
  duration_minutes integer null default 0,
  order_index integer null default 0,
  is_free boolean null default false,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  video_id text null,
  r2_source_key text null,
  r2_original_filename text null,
  stream_status text null default 'pending'::text,
  content_type text null default 'text'::text,
  pdf_url text null,
  is_downloadable boolean null default false,
  updated_at timestamp with time zone null default now(),
  constraint lessons_pkey primary key (id),
  constraint lessons_module_id_fkey foreign KEY (module_id) references modules (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_lessons_module on public.lessons using btree (module_id) TABLESPACE pg_default;

create index IF not exists idx_lessons_video_id on public.lessons using btree (video_id) TABLESPACE pg_default
where
  (video_id is not null);