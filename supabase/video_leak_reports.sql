create table public.video_leak_reports (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  lesson_id uuid null,
  course_id uuid null,
  sample_id uuid null,
  status text null default 'open'::text,
  severity text null default 'medium'::text,
  detected_by text null default 'system'::text,
  warning_sent_at timestamp with time zone null,
  access_revoked_at timestamp with time zone null,
  revoke_duration_days integer null default 30,
  admin_notes text null,
  resolution_notes text null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint video_leak_reports_pkey primary key (id),
  constraint video_leak_reports_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete set null,
  constraint video_leak_reports_user_id_fkey foreign KEY (user_id) references profiles (id) on delete set null,
  constraint video_leak_reports_sample_id_fkey foreign KEY (sample_id) references video_forensic_samples (id) on delete set null,
  constraint video_leak_reports_course_id_fkey foreign KEY (course_id) references courses (id) on delete set null,
  constraint video_leak_reports_severity_check check (
    (
      severity = any (
        array[
          'low'::text,
          'medium'::text,
          'high'::text,
          'critical'::text
        ]
      )
    )
  ),
  constraint video_leak_reports_detected_by_check check (
    (
      detected_by = any (
        array['system'::text, 'admin'::text, 'manual'::text]
      )
    )
  ),
  constraint video_leak_reports_status_check check (
    (
      status = any (
        array[
          'open'::text,
          'investigating'::text,
          'resolved'::text,
          'dismissed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_leak_reports_user on public.video_leak_reports using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_leak_reports_status on public.video_leak_reports using btree (status) TABLESPACE pg_default;

create index IF not exists idx_leak_reports_created on public.video_leak_reports using btree (created_at) TABLESPACE pg_default;