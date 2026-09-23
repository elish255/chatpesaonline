-- ============================================================
-- CHATPESA ONLINE — SHARED SUPABASE SAFE TABLES
-- ============================================================
-- This migration is SAFE for an existing VelaSite database.
-- It creates/updates ONLY tables whose names start with chatpesa_.
-- It does NOT drop, rename, alter, or delete VelaSite tables.
-- Chatpesa uses the same Supabase project/database as VelaSite.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.chatpesa_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text not null,
  email text not null,
  phone text not null,
  password_hash text not null,
  password_salt text not null,
  status text not null default 'pending' check (status in ('pending','active','rejected')),
  role text not null default 'user' check (role in ('user','admin')),
  balance bigint not null default 0 check (balance >= 0),
  withdrawn bigint not null default 0 check (withdrawn >= 0),
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create unique index if not exists chatpesa_users_username_key on public.chatpesa_users(lower(username));
create unique index if not exists chatpesa_users_email_key on public.chatpesa_users(lower(email));
create unique index if not exists chatpesa_users_phone_key on public.chatpesa_users(phone);

create table if not exists public.chatpesa_activation_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.chatpesa_users(id) on delete cascade,
  method text not null check (method in ('fimipay','lipa_namba')),
  amount bigint not null check (amount > 0),
  phone text not null,
  external_id text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reviewed_at timestamptz
);

create index if not exists chatpesa_activation_user_status_idx on public.chatpesa_activation_payments(user_id,status);
create index if not exists chatpesa_activation_created_idx on public.chatpesa_activation_payments(created_at desc);

create table if not exists public.chatpesa_withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.chatpesa_users(id) on delete cascade,
  amount bigint not null check (amount >= 100000),
  method text not null,
  account_number text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists chatpesa_withdrawals_user_status_idx on public.chatpesa_withdrawals(user_id,status);
create index if not exists chatpesa_withdrawals_created_idx on public.chatpesa_withdrawals(created_at desc);

create table if not exists public.chatpesa_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  user_id uuid not null references public.chatpesa_users(id) on delete cascade,
  person_name text not null,
  payout bigint not null check (payout >= 0),
  message_count integer not null default 0 check (message_count between 0 and 20),
  status text not null default 'open' check (status in ('open','completed','closed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists chatpesa_chat_sessions_user_created_idx on public.chatpesa_chat_sessions(user_id,created_at desc);
create index if not exists chatpesa_chat_sessions_status_idx on public.chatpesa_chat_sessions(status);

create table if not exists public.chatpesa_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.chatpesa_users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','success','warning','error')),
  created_at timestamptz not null default now()
);

create index if not exists chatpesa_notifications_user_created_idx on public.chatpesa_notifications(user_id,created_at desc);

-- Compatibility additions if the tables were created by an earlier Chatpesa version.
alter table public.chatpesa_users add column if not exists withdrawn bigint not null default 0;
alter table public.chatpesa_users add column if not exists activated_at timestamptz;
alter table public.chatpesa_chat_sessions add column if not exists message_count integer not null default 0;

-- The Chatpesa server uses the Supabase service-role key. RLS stays enabled so
-- the public browser cannot directly write these private tables.
alter table public.chatpesa_users enable row level security;
alter table public.chatpesa_activation_payments enable row level security;
alter table public.chatpesa_withdrawals enable row level security;
alter table public.chatpesa_chat_sessions enable row level security;
alter table public.chatpesa_notifications enable row level security;

-- First create/register your admin account through /jisajili, then run: 
-- update public.chatpesa_users set role='admin', status='active', activated_at=now()
-- where lower(email)=lower('YOUR_ADMIN_EMAIL@example.com');

-- Optional welcome notification for all Chatpesa users.
insert into public.chatpesa_notifications (user_id,title,message,type)
select null,'Karibu Chatpesa.online 👋','Karibu! Jisajili, lipia activation fee, kisha anza kuchat.','info'
where not exists (select 1 from public.chatpesa_notifications where user_id is null and title='Karibu Chatpesa.online 👋');
