-- Enable required extensions
create extension if not exists "pgcrypto";

-- Parent dogs
create table if not exists parents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  breed text check (breed in ('french_bulldog', 'english_bulldog')),
  sex text check (sex in ('male','female')),
  birth_date date,
  weight_lbs numeric(5,2),
  color text,
  description text,
  health_clearances text[],
  photo_urls text[] default '{}',
  video_urls text[] default '{}',
  created_at timestamptz default now()
);

-- Litters
create table if not exists litters (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique,
  sire_id uuid references parents(id),
  dam_id uuid references parents(id),
  mating_date date,
  due_date date,
  born_at date,
  notes text,
  created_at timestamptz default now()
);

-- Puppies
create table if not exists puppies (
  id uuid primary key default gen_random_uuid(),
  litter_id uuid references litters(id),
  name text,
  slug text unique,
  sex text check (sex in ('male','female')),
  color text,
  birth_date date,
  price_usd numeric(10,2),
  status text not null check (status in ('available','reserved','sold','upcoming')) default 'available',
  weight_oz int,
  description text,
  photo_urls text[] default '{}',
  video_urls text[] default '{}',
  paypal_enabled boolean default true,
  stripe_payment_link text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


-- Updated at helper
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_puppies_updated_at
before update on puppies
for each row
execute function set_updated_at();

-- Reservations / deposits
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  puppy_id uuid references puppies(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  channel text check (channel in ('site','whatsapp','telegram','instagram','facebook','phone')),
  status text check (status in ('pending','paid','refunded','canceled')) default 'pending',
  deposit_amount numeric(10,2),
  stripe_payment_intent text,
  payment_provider text check (payment_provider in ('stripe','paypal')),
  paypal_order_id text,
  notes text,
  created_at timestamptz default now()
);

-- Inquiries / leads
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('form','whatsapp','telegram','instagram','facebook','phone')),
  name text,
  email text,
  phone text,
  message text,
  puppy_id uuid references puppies(id),
  utm jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Indices
create index if not exists idx_puppies_status on puppies (status);
create index if not exists idx_inquiries_created_at on inquiries (created_at);
create index if not exists idx_reservations_puppy_status on reservations (puppy_id, status);
create index if not exists idx_puppies_slug on puppies (slug);

-- Row level security (policies to be defined later)
alter table parents enable row level security;
alter table litters enable row level security;
alter table puppies enable row level security;
alter table reservations enable row level security;
alter table inquiries enable row level security;

