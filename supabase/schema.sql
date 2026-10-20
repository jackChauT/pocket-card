-- Run once in the Supabase SQL editor.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number bigint generated always as identity (start with 1001) unique,
  status text not null default 'pending_payment' check (status in (
    'pending_payment',   -- created, not paid yet
    'awaiting_photo',    -- paid; customer will send photo on WhatsApp
    'received',          -- paid; ready to work on
    'proof_sent',        -- sketch emailed, waiting for the customer
    'changes_requested', -- customer asked for changes to the sketch
    'approved',          -- customer approved the sketch
    'preparing', 'packed', 'shipped'
  )),
  email text not null,             -- lower-case; customer accounts match orders by this
  lang text not null default 'en' check (lang in ('en', 'zh-hk')), -- language for customer emails
  newsletter boolean not null default false,
  lines jsonb not null,            -- server-priced cart lines, incl. personalisation (photo object keys)
  country text not null,
  shipping_address jsonb not null,
  shipping_method jsonb not null,  -- { id, label, cost }
  subtotal_hkd integer not null,   -- cents
  shipping_hkd integer not null,
  total_hkd integer not null,
  stripe_session_id text unique,
  proof_key text,                  -- latest sketch (private storage key)
  proof_message text,              -- studio's note sent with the sketch
  proof_feedback text,             -- customer's requested changes
  proof_sent_at timestamptz,
  approved_at timestamptz,
  tracking text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz
);

create index if not exists orders_email_idx on orders (email, created_at desc);

-- No policies: only the server (service role) reads or writes orders, after checking who is asking.
alter table orders enable row level security;

-- Private bucket for customer photos (uploads/) and sketches (proofs/), 15 MB max.
insert into storage.buckets (id, name, public, file_size_limit)
values ('photos', 'photos', false, 15728640)
on conflict (id) do nothing;

-- Already ran an earlier version of this file? Add the language column:
alter table orders add column if not exists lang text not null default 'en' check (lang in ('en', 'zh-hk'));
