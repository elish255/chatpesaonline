-- CHATPESA.ONLINE — REGISTRATION + PAYMENT DATABASE SETUP
-- Run this entire file in Supabase SQL Editor.
-- It is safe to run more than once and does not delete existing user data.

create extension if not exists pgcrypto;

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text,
  username text,
  email text,
  phone text,
  password_hash text,
  password_salt text,
  status text not null default 'pending',
  role text not null default 'user',
  balance bigint not null default 0,
  withdrawn bigint not null default 0,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

alter table public.app_users add column if not exists name text;
alter table public.app_users add column if not exists username text;
alter table public.app_users add column if not exists email text;
alter table public.app_users add column if not exists phone text;
alter table public.app_users add column if not exists password_hash text;
alter table public.app_users add column if not exists password_salt text;
alter table public.app_users add column if not exists status text not null default 'pending';
alter table public.app_users add column if not exists role text not null default 'user';
alter table public.app_users add column if not exists balance bigint not null default 0;
alter table public.app_users add column if not exists withdrawn bigint not null default 0;
alter table public.app_users add column if not exists created_at timestamptz not null default now();
alter table public.app_users add column if not exists activated_at timestamptz;

-- Remove old username constraint/index if present, then use a case-insensitive unique index.
drop index if exists public.app_users_username_key;
create unique index if not exists app_users_username_key on public.app_users (lower(username)) where username is not null;
create unique index if not exists app_users_email_key on public.app_users (lower(email)) where email is not null;
create unique index if not exists app_users_phone_key on public.app_users (phone) where phone is not null;

alter table public.app_users drop constraint if exists app_users_status_check;
alter table public.app_users add constraint app_users_status_check check (status in ('pending','active','rejected'));
alter table public.app_users drop constraint if exists app_users_role_check;
alter table public.app_users add constraint app_users_role_check check (role in ('user','admin'));
alter table public.app_users drop constraint if exists app_users_username_format;
alter table public.app_users add constraint app_users_username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$');

-- ============================================================
-- ACTIVATION PAYMENTS
-- ============================================================
create table if not exists public.activation_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  method text not null,
  amount bigint not null default 16000,
  phone text not null,
  external_id text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reviewed_at timestamptz
);

alter table public.activation_payments add column if not exists method text;
alter table public.activation_payments add column if not exists amount bigint not null default 16000;
alter table public.activation_payments add column if not exists phone text;
alter table public.activation_payments add column if not exists external_id text;
alter table public.activation_payments add column if not exists status text not null default 'pending';
alter table public.activation_payments add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.activation_payments add column if not exists created_at timestamptz not null default now();
alter table public.activation_payments add column if not exists confirmed_at timestamptz;
alter table public.activation_payments add column if not exists reviewed_at timestamptz;

alter table public.activation_payments drop constraint if exists activation_payments_method_check;
alter table public.activation_payments add constraint activation_payments_method_check check (method in ('fimipay','lipa_namba'));
alter table public.activation_payments drop constraint if exists activation_payments_status_check;
alter table public.activation_payments add constraint activation_payments_status_check check (status in ('pending','approved','rejected'));
create index if not exists activation_payments_user_status_idx on public.activation_payments(user_id,status);

-- ============================================================
-- WITHDRAWALS — minimum TZS 100,000
-- ============================================================
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  amount bigint not null check (amount >= 100000),
  method text not null,
  account_number text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.withdrawals drop constraint if exists withdrawals_amount_check;
alter table public.withdrawals add constraint withdrawals_amount_check check (amount >= 100000);
alter table public.withdrawals drop constraint if exists withdrawals_status_check;
alter table public.withdrawals add constraint withdrawals_status_check check (status in ('pending','approved','rejected'));
create index if not exists withdrawals_user_status_idx on public.withdrawals(user_id,status);

-- ============================================================
-- NOTIFICATIONS
-- user_id NULL = notification to everyone
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  created_at timestamptz not null default now()
);

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (type in ('info','success','warning','error'));
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);

create table if not exists public.notification_dismissals (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (notification_id,user_id)
);

-- ============================================================
-- CHAT SESSIONS / PAYOUTS
-- ============================================================
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  user_id uuid not null references public.app_users(id) on delete cascade,
  person_name text not null,
  payout bigint not null,
  status text not null default 'completed',
  completed_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_idx on public.chat_sessions(user_id,completed_at desc);

-- ============================================================
-- SECURITY
-- The Chatpesa app performs database writes from the server using
-- SUPABASE_SERVICE_ROLE_KEY. Do not expose that key in browser code.
-- ============================================================
alter table public.app_users enable row level security;
alter table public.activation_payments enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_dismissals enable row level security;
alter table public.chat_sessions enable row level security;

grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- Helpful welcome notification. It is shown to all users and can be dismissed.
insert into public.notifications (user_id,title,message,type)
select null,
       'Karibu Chatpesa.online 👋',
       'Jisajili, lipia TZS 16,000, kisha anza kuchat. Unaweza kufuta ujumbe huu kwa kubonyeza X.',
       'info'
where not exists (
  select 1 from public.notifications
  where user_id is null and title = 'Karibu Chatpesa.online 👋'
);

-- QUICK CHECKS
select 'app_users' as table_name, count(*) as rows from public.app_users
union all select 'activation_payments', count(*) from public.activation_payments
union all select 'withdrawals', count(*) from public.withdrawals
union all select 'notifications', count(*) from public.notifications;
