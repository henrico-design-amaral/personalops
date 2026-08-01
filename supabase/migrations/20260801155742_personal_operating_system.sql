begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.record_status as enum ('active', 'paused', 'completed', 'cancelled');
create type public.task_status as enum ('inbox', 'planned', 'in_progress', 'blocked', 'completed', 'cancelled');
create type public.goal_status as enum ('planned', 'active', 'paused', 'completed', 'cancelled');
create type public.review_type as enum ('daily', 'weekly', 'monthly');
create type public.review_status as enum ('draft', 'completed');
create type public.day_period as enum ('morning', 'afternoon', 'evening', 'flexible');
create type public.occurrence_status as enum ('pending', 'completed', 'skipped');
create type public.commitment_status as enum ('scheduled', 'completed', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  timezone text not null default 'America/Sao_Paulo',
  onboarding_completed boolean not null default false,
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  default_daily_capacity_minutes integer not null default 360 check (default_daily_capacity_minutes between 0 and 1440),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 600),
  color text not null default '#FFC83D' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  position integer not null default 0 check (position >= 0),
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  area_id uuid,
  title text not null check (char_length(title) between 1 and 160),
  desired_outcome text not null default '' check (char_length(desired_outcome) <= 1200),
  status public.goal_status not null default 'planned',
  progress smallint not null default 0 check (progress between 0 and 100),
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (area_id, user_id) references public.areas(id, user_id) on delete restrict
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  area_id uuid,
  goal_id uuid,
  name text not null check (char_length(name) between 1 and 140),
  outcome text not null default '' check (char_length(outcome) <= 1200),
  status public.record_status not null default 'active',
  start_date date,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (area_id, user_id) references public.areas(id, user_id) on delete restrict,
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete restrict
);

create table public.priorities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  area_id uuid,
  goal_id uuid,
  project_id uuid,
  title text not null check (char_length(title) between 1 and 180),
  rationale text not null default '' check (char_length(rationale) <= 1200),
  impact smallint not null default 3 check (impact between 1 and 5),
  urgency smallint not null default 3 check (urgency between 1 and 5),
  effort smallint not null default 3 check (effort between 1 and 5),
  status public.record_status not null default 'active',
  position integer not null default 0 check (position >= 0),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (area_id, user_id) references public.areas(id, user_id) on delete restrict,
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete restrict,
  foreign key (project_id, user_id) references public.projects(id, user_id) on delete restrict
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  area_id uuid,
  goal_id uuid,
  project_id uuid,
  priority_id uuid,
  title text not null check (char_length(title) between 1 and 220),
  notes text not null default '' check (char_length(notes) <= 5000),
  status public.task_status not null default 'inbox',
  scheduled_date date,
  due_date date,
  estimated_minutes integer check (estimated_minutes between 1 and 1440),
  recurrence_rule text check (recurrence_rule is null or char_length(recurrence_rule) <= 240),
  blocked_reason text not null default '' check (char_length(blocked_reason) <= 1200),
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (area_id, user_id) references public.areas(id, user_id) on delete restrict,
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete restrict,
  foreign key (project_id, user_id) references public.projects(id, user_id) on delete restrict,
  foreign key (priority_id, user_id) references public.priorities(id, user_id) on delete restrict
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  area_id uuid,
  title text not null check (char_length(title) between 1 and 180),
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.commitment_status not null default 'scheduled',
  energy_cost smallint not null default 3 check (energy_cost between 1 and 5),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at),
  unique (id, user_id),
  foreign key (area_id, user_id) references public.areas(id, user_id) on delete restrict
);

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  area_id uuid,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '' check (char_length(description) <= 1200),
  frequency_type text not null default 'daily' check (frequency_type in ('daily', 'weekly')),
  days_of_week smallint[] not null default '{}',
  period public.day_period not null default 'flexible',
  scheduled_time time,
  estimated_minutes integer not null default 15 check (estimated_minutes between 1 and 720),
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (days_of_week <@ array[0,1,2,3,4,5,6]::smallint[]),
  unique (id, user_id),
  foreign key (area_id, user_id) references public.areas(id, user_id) on delete restrict
);

create table public.routine_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  routine_id uuid not null,
  occurrence_date date not null,
  status public.occurrence_status not null default 'pending',
  notes text not null default '' check (char_length(notes) <= 1200),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (routine_id, occurrence_date),
  foreign key (routine_id, user_id) references public.routines(id, user_id) on delete cascade
);

create table public.energy_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  energy_level smallint not null check (energy_level between 1 and 5),
  capacity_level smallint not null check (capacity_level between 1 and 5),
  period public.day_period not null default 'flexible',
  impact_note text not null default '' check (char_length(impact_note) <= 1200),
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  plan_date date not null,
  capacity_minutes integer not null default 360 check (capacity_minutes between 0 and 1440),
  intention text not null default '' check (char_length(intention) <= 600),
  summary text not null default '' check (char_length(summary) <= 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, plan_date)
);

create table public.daily_plan_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  daily_plan_id uuid not null,
  task_id uuid,
  priority_id uuid,
  routine_occurrence_id uuid,
  title text not null default '' check (char_length(title) <= 220),
  item_type text not null check (item_type in ('task', 'priority', 'routine', 'manual')),
  position integer not null default 0 check (position >= 0),
  status public.occurrence_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(task_id, priority_id, routine_occurrence_id) <= 1),
  check (item_type <> 'manual' or char_length(title) > 0),
  foreign key (daily_plan_id, user_id) references public.daily_plans(id, user_id) on delete cascade,
  foreign key (task_id, user_id) references public.tasks(id, user_id) on delete cascade,
  foreign key (priority_id, user_id) references public.priorities(id, user_id) on delete cascade,
  foreign key (routine_occurrence_id, user_id) references public.routine_occurrences(id, user_id) on delete cascade
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  review_type public.review_type not null,
  period_start date not null,
  period_end date not null,
  status public.review_status not null default 'draft',
  completed_summary text not null default '' check (char_length(completed_summary) <= 5000),
  stalled_summary text not null default '' check (char_length(stalled_summary) <= 5000),
  blockers text not null default '' check (char_length(blockers) <= 5000),
  energy_drains text not null default '' check (char_length(energy_drains) <= 5000),
  adjustments text not null default '' check (char_length(adjustments) <= 5000),
  next_priorities text not null default '' check (char_length(next_priorities) <= 5000),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (user_id, review_type, period_start)
);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  goal_id uuid,
  project_id uuid,
  progress_delta smallint not null default 0 check (progress_delta between -100 and 100),
  note text not null check (char_length(note) between 1 and 2000),
  recorded_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals(id, user_id) on delete cascade,
  foreign key (project_id, user_id) references public.projects(id, user_id) on delete cascade
);

create table public.task_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  task_id uuid not null,
  event_type text not null check (event_type in ('created', 'updated', 'status_changed', 'scheduled', 'reopened', 'deleted')),
  from_status public.task_status,
  to_status public.task_status,
  note text not null default '' check (char_length(note) <= 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks(id, user_id) on delete cascade
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'areas', 'goals', 'projects', 'priorities', 'tasks',
    'commitments', 'routines', 'routine_occurrences', 'energy_checkins',
    'daily_plans', 'daily_plan_items', 'reviews', 'progress_entries', 'task_events'
  ]
  loop
    execute format(
      'create trigger set_%1$s_updated_at before update on public.%1$I for each row execute procedure private.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

create index areas_user_position_idx on public.areas (user_id, position);
create index goals_user_status_idx on public.goals (user_id, status, target_date);
create index projects_user_status_idx on public.projects (user_id, status, target_date);
create index priorities_user_status_position_idx on public.priorities (user_id, status, position);
create index tasks_user_schedule_idx on public.tasks (user_id, scheduled_date, status) where deleted_at is null;
create index tasks_user_due_idx on public.tasks (user_id, due_date, status) where deleted_at is null;
create index commitments_user_start_idx on public.commitments (user_id, starts_at, status);
create index routines_user_status_idx on public.routines (user_id, status);
create index routine_occurrences_user_date_idx on public.routine_occurrences (user_id, occurrence_date, status);
create index energy_checkins_user_recorded_idx on public.energy_checkins (user_id, recorded_at desc);
create index daily_plans_user_date_idx on public.daily_plans (user_id, plan_date desc);
create index reviews_user_period_idx on public.reviews (user_id, period_start desc, review_type);
create index progress_entries_user_date_idx on public.progress_entries (user_id, recorded_on desc);
create index task_events_task_created_idx on public.task_events (task_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'areas', 'goals', 'projects', 'priorities', 'tasks',
    'commitments', 'routines', 'routine_occurrences', 'energy_checkins',
    'daily_plans', 'daily_plan_items', 'reviews', 'progress_entries', 'task_events'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('alter table public.%I force row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
  end loop;
end;
$$;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'areas', 'goals', 'projects', 'priorities', 'tasks', 'commitments',
    'routines', 'routine_occurrences', 'energy_checkins', 'daily_plans',
    'daily_plan_items', 'reviews', 'progress_entries', 'task_events'
  ]
  loop
    execute format(
      'create policy %1$I on public.%2$I for select to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_select_own', table_name
    );
    execute format(
      'create policy %1$I on public.%2$I for insert to authenticated with check ((select auth.uid()) = user_id)',
      table_name || '_insert_own', table_name
    );
    execute format(
      'create policy %1$I on public.%2$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name || '_update_own', table_name
    );
    execute format(
      'create policy %1$I on public.%2$I for delete to authenticated using ((select auth.uid()) = user_id)',
      table_name || '_delete_own', table_name
    );
  end loop;
end;
$$;

comment on table public.profiles is 'Preferências e configuração inicial do usuário.';
comment on table public.priorities is 'Resultados que merecem atenção, distintos de tarefas executáveis.';
comment on table public.energy_checkins is 'Sinais de energia e capacidade que modulam a leitura do dia.';
comment on table public.reviews is 'Revisões periódicas com aprendizado e próximas decisões.';

commit;
