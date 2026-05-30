-- ================================================
-- بيرق — جداول Supabase
-- انسخ هذا الكود في Supabase SQL Editor وشغّله
-- ================================================

-- جدول السير الذاتية
create table if not exists cvs (
  id bigint primary key generated always as identity,
  name text not null,
  spec text,
  age integer,
  exp integer default 0,
  city text,
  skills text,
  source text default 'local',
  notes text,
  date date default current_date,
  created_at timestamptz default now()
);

-- جدول المشغّلين
create table if not exists employers (
  id bigint primary key generated always as identity,
  name text not null,
  sector text,
  city text,
  contact text,
  phone text,
  size text default 'صغيرة',
  notes text,
  created_at timestamptz default now()
);

-- جدول عروض الشغل
create table if not exists jobs (
  id bigint primary key generated always as identity,
  employer_id bigint references employers(id) on delete cascade,
  title text not null,
  spec text,
  city text,
  type text,
  salary text,
  exp_min integer default 0,
  exp_max integer default 20,
  age_min integer default 18,
  age_max integer default 55,
  skills text,
  description text,
  requirements text,
  deadline date,
  active boolean default true,
  date date default current_date,
  created_at timestamptz default now()
);

-- جدول متابعة الملفات
create table if not exists applications (
  id bigint primary key generated always as identity,
  candidate_name text not null,
  job_title text,
  company text,
  country text,
  stage text default 'selected',
  notes text,
  history jsonb default '[]',
  date date default current_date,
  created_at timestamptz default now()
);

-- جدول المعاملات المالية
create table if not exists transactions (
  id bigint primary key generated always as identity,
  type text not null,
  candidate_name text,
  job_title text,
  company text,
  country text,
  amount numeric not null,
  currency text default 'TND',
  paid boolean default false,
  notes text,
  date date default current_date,
  created_at timestamptz default now()
);

-- جدول المستخدمين
create table if not exists users (
  id bigint primary key generated always as identity,
  name text not null,
  username text unique not null,
  password text not null,
  role text default 'staff',
  active boolean default true,
  created_at date default current_date
);

-- إدخال مستخدمين افتراضيين
insert into users (name, username, password, role) values
  ('المدير العام',  'admin',   'admin123',   'admin'),
  ('المدير المالي', 'finance', 'finance123', 'finance'),
  ('موظف التوظيف', 'staff',   'staff123',   'staff')
on conflict (username) do nothing;

-- تفعيل RLS (Row Level Security) — اختياري
-- alter table cvs enable row level security;
-- alter table employers enable row level security;
-- alter table jobs enable row level security;
-- alter table applications enable row level security;
-- alter table transactions enable row level security;
-- alter table users enable row level security;

-- سياسة عامة للقراءة والكتابة (للاختبار)
-- create policy "allow all" on cvs for all using (true);

select 'تم إنشاء جداول بيرق بنجاح ✅' as result;

-- ================================================
-- إضافة Storage لحفظ ملفات السير الذاتية
-- شغّل هذا في Supabase SQL Editor
-- ================================================

-- إضافة عمود لرابط الملف في جدول cvs
alter table cvs add column if not exists file_url text;
alter table cvs add column if not exists file_name text;

-- إنشاء bucket لحفظ الملفات
insert into storage.buckets (id, name, public)
values ('cvs-files', 'cvs-files', true)
on conflict (id) do nothing;

-- سياسة للسماح برفع الملفات
create policy "allow upload cvs" on storage.objects
  for insert with check (bucket_id = 'cvs-files');

create policy "allow read cvs" on storage.objects
  for select using (bucket_id = 'cvs-files');

create policy "allow delete cvs" on storage.objects
  for delete using (bucket_id = 'cvs-files');

select 'تم إعداد Storage بنجاح ✅' as result;

-- إضافة حقل الهاتف للمترشحين والمشغّلين
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS whatsapp text;
