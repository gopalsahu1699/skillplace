-- Nullify orphaned references before adding constraints
update public.certificates set course_id = null
  where course_id is not null
  and not exists (select 1 from public.courses where id = certificates.course_id);

update public.certificates set user_id = null
  where user_id is not null
  and not exists (select 1 from public.profiles where id = certificates.user_id);

-- Add foreign key constraints
alter table public.certificates
  add constraint certificates_user_id_fkey
    foreign key (user_id) references profiles (id) on delete set null,
  add constraint certificates_course_id_fkey
    foreign key (course_id) references courses (id) on delete set null;
