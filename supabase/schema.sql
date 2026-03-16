-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create user_progress table to track solved problems per user
create table if not exists user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  problem_id integer not null,
  solved_at timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null,
  unique(user_id, problem_id)
);

-- Create index for faster queries
create index if not exists idx_user_progress_user_id on user_progress(user_id);
create index if not exists idx_user_progress_problem_id on user_progress(problem_id);

-- Enable Row Level Security
alter table user_progress enable row level security;

-- Policy: Users can only see their own progress
create policy "Users can view their own progress"
  on user_progress
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own progress
create policy "Users can insert their own progress"
  on user_progress
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can delete their own progress
create policy "Users can delete their own progress"
  on user_progress
  for delete
  using (auth.uid() = user_id);
