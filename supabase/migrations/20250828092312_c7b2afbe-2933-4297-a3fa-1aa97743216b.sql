-- Fix function search path security issues
create or replace function public.set_updated_by()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
begin
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end; $$;

create or replace function public.current_role()
returns text 
language sql 
stable 
security definer
set search_path = public
as $$
  select ur.role::text from public.user_roles ur where ur.user_id = auth.uid();
$$;