-- Chatpesa.online database
-- Run this in Supabase SQL Editor before deploying.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  username text,
  email text not null unique,
  phone text not null unique,
  password_hash text not null,
  password_salt text not null,
  status text not null default 'pending' check (status in ('pending','active','rejected')),
  role text not null default 'user' check (role in ('user','admin')),
  balance bigint not null default 0,
  withdrawn bigint not null default 0,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create table if not exists public.activation_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  method text not null check (method in ('fimipay','lipa_namba')),
  amount bigint not null,
  phone text not null,
  external_id text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  reviewed_at timestamptz
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  amount bigint not null check (amount >= 100000),
  method text not null,
  account_number text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info','success','warning','error')),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_dismissals (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.app_users(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique,
  user_id uuid not null references public.app_users(id) on delete cascade,
  person_name text not null,
  payout bigint not null,
  status text not null default 'completed',
  completed_at timestamptz not null default now()
);


-- Withdrawal minimum is TZS 100,000. Update an older 50,000 constraint if present.
alter table public.withdrawals drop constraint if exists withdrawals_amount_check;
alter table public.withdrawals add constraint withdrawals_amount_check check (amount >= 100000);

-- Username is used for normal user login. Safe migration for an existing database.
alter table public.app_users add column if not exists username text;
update public.app_users
set username = substr(lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]+', '', 'g')), 1, 24) || '_' || substr(replace(id::text, '-', ''), 1, 4)
where username is null;
create unique index if not exists app_users_username_key on public.app_users(lower(username));
alter table public.app_users drop constraint if exists app_users_username_format;
alter table public.app_users add constraint app_users_username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$');

create index if not exists activation_payments_user_status_idx on public.activation_payments(user_id,status);
create index if not exists withdrawals_user_status_idx on public.withdrawals(user_id,status);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);

alter table public.app_users enable row level security;
alter table public.activation_payments enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_dismissals enable row level security;
alter table public.chat_sessions enable row level security;

-- The app uses the Supabase service-role key only on the server. No public browser
-- policy is intentionally granted for these tables.

insert into public.notifications (user_id,title,message,type)
select null,
       'Karibu Chatpesa.online 👋',
       'Jisajili, lipia TZS 16,000, kisha anza kuchat. Unaweza kufuta ujumbe huu kwa kubonyeza X.',
       'info'
where not exists (
  select 1 from public.notifications where user_id is null and title = 'Karibu Chatpesa.online 👋'
);
