-- Create global app configuration table
create table if not exists public.app_config (
  id          bigint primary key generated always as identity,
  clinic_name text,
  timezone    text not null default 'America/Sao_Paulo',
  currency    text not null default 'BRL',
  agenda_interval_minutes int not null default 30,
  allow_overbooking boolean not null default false,
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz not null default now()
);

-- Create schedule windows table for allowed booking times
create table if not exists public.app_schedule_windows (
  id          bigint primary key generated always as identity,
  -- weekday (0=sunday, 6=saturday) 
  weekday     int check (weekday between 0 and 6),
  start_time  time not null,
  end_time    time not null,
  -- specific dates (holidays/blocks or exceptions)
  specific_date date,
  is_blocked  boolean not null default false,
  notes       text,
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz not null default now()
);

-- Create audit trigger function
create or replace function public.set_updated_by()
returns trigger language plpgsql as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end; $$;

-- Apply audit triggers
drop trigger if exists trg_app_config_audit on public.app_config;
create trigger trg_app_config_audit
before insert or update on public.app_config
for each row execute procedure public.set_updated_by();

drop trigger if exists trg_app_schedule_windows_audit on public.app_schedule_windows;
create trigger trg_app_schedule_windows_audit
before insert or update on public.app_schedule_windows
for each row execute procedure public.set_updated_by();

-- Enable RLS
alter table public.app_config enable row level security;
alter table public.app_schedule_windows enable row level security;

-- Create function to get current user role
create or replace function public.current_role()
returns text language sql stable as $$
  select ur.role::text from public.user_roles ur where ur.user_id = auth.uid();
$$;

-- RLS policies for app_config
drop policy if exists app_config_select on public.app_config;
create policy app_config_select on public.app_config
for select to authenticated
using ( public.current_role() in ('admin','recepcao','profissional','financeiro') );

drop policy if exists app_config_upsert on public.app_config;
create policy app_config_upsert on public.app_config
for all to authenticated
using ( public.current_role() in ('admin','recepcao') )
with check ( public.current_role() in ('admin','recepcao') );

-- RLS policies for app_schedule_windows
drop policy if exists schedule_select on public.app_schedule_windows;
create policy schedule_select on public.app_schedule_windows
for select to authenticated
using ( public.current_role() in ('admin','recepcao','profissional','financeiro') );

drop policy if exists schedule_upsert on public.app_schedule_windows;
create policy schedule_upsert on public.app_schedule_windows
for all to authenticated
using ( public.current_role() in ('admin','recepcao') )
with check ( public.current_role() in ('admin','recepcao') );

-- Insert default configuration
insert into public.app_config (clinic_name, agenda_interval_minutes, allow_overbooking)
values ('Clínica Dra. Gabriele Batista', 30, false)
on conflict do nothing;

-- Insert default schedule windows (Monday to Friday, 8:00-18:00)
insert into public.app_schedule_windows (weekday, start_time, end_time, notes)
values 
  (1, '08:00:00', '18:00:00', 'Segunda-feira'),
  (2, '08:00:00', '18:00:00', 'Terça-feira'),
  (3, '08:00:00', '18:00:00', 'Quarta-feira'),
  (4, '08:00:00', '18:00:00', 'Quinta-feira'),
  (5, '08:00:00', '18:00:00', 'Sexta-feira')
on conflict do nothing;