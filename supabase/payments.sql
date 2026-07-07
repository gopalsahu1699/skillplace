create table public.payments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  program_id uuid null,
  amount integer not null default 0,
  currency text null default 'INR'::text,
  razorpay_order_id text null,
  razorpay_payment_id text null,
  razorpay_signature text null,
  coupon_id uuid null,
  status text null default 'pending'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  order_id text null,
  cf_order_id text null,
  cf_payment_session_id text null,
  cf_payment_id text null,
  payment_id text null,
  payment_method text null,
  constraint payments_pkey primary key (id),
  constraint payments_coupon_id_fkey foreign KEY (coupon_id) references coupons (id) on delete set null,
  constraint payments_course_id_fkey foreign KEY (course_id) references courses (id) on delete set null,
  constraint payments_program_id_fkey foreign KEY (program_id) references training_programs (id) on delete set null,
  constraint payments_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint payments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'completed'::text,
          'failed'::text,
          'refunded'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_payments_user on public.payments using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_payments_course on public.payments using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_payments_program on public.payments using btree (program_id) TABLESPACE pg_default;

create index IF not exists idx_payments_order on public.payments using btree (razorpay_order_id) TABLESPACE pg_default;

create index IF not exists idx_payments_status on public.payments using btree (status) TABLESPACE pg_default;

create index IF not exists idx_payments_cf_order on public.payments using btree (cf_order_id) TABLESPACE pg_default;