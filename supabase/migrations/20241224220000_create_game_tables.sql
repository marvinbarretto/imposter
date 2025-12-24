-- Create rooms table
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  host_id text not null,
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'voting', 'results')),
  secret_word text,
  imposter_id text,
  current_turn int default 0,
  created_at timestamp with time zone default now()
);

-- Create players table
create table if not exists players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references rooms(id) on delete cascade,
  name text not null,
  is_host boolean default false,
  vote text,
  created_at timestamp with time zone default now()
);

-- Create indexes for common queries
create index if not exists idx_rooms_code on rooms(code);
create index if not exists idx_players_room_id on players(room_id);

-- Enable Row Level Security (but allow all for MVP)
alter table rooms enable row level security;
alter table players enable row level security;

-- Permissive policies for MVP (anyone can do anything)
-- In production, you'd want proper auth policies
create policy "Allow all room operations" on rooms for all using (true) with check (true);
create policy "Allow all player operations" on players for all using (true) with check (true);

-- Enable realtime subscriptions
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
