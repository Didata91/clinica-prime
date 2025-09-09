-- =========================================================
-- 0) Extensões necessárias
-- =========================================================
create extension if not exists pgcrypto;  -- gen_random_uuid()

-- =========================================================
-- 1) Tipos ENUM
-- =========================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'status_agenda_enum') then
    create type public.status_agenda_enum as enum ('agendado','concluido','nao_compareceu','cancelado','remarcado');
  end if;

  if not exists (select 1 from pg_type where typname = 'forma_pagamento_enum') then
    create type public.forma_pagamento_enum as enum ('pix','debito','credito','dinheiro','boleto','transferencia','outro');
  end if;
end$$;

-- =========================================================
-- 2) Tabela principal
--    (idempotente: cria se não existir)
-- =========================================================
create table if not exists public.agendas (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  horario time without time zone not null,
  nome text not null,
  procedimento text not null,
  valor_procedimento_padrao numeric(12,2) not null default 0,
  valor_cobrado numeric(12,2),
  desconto_aplicado numeric(12,2) not null default 0,
  motivo_desconto text,
  faturamento_liquido numeric(12,2) generated always as
    (coalesce(nullif(valor_cobrado,0), valor_procedimento_padrao) - coalesce(desconto_aplicado,0)) stored,
  status public.status_agenda_enum not null default 'agendado',
  mls numeric(12,2),
  sinal numeric(12,2) not null default 0,
  forma_pagamento public.forma_pagamento_enum,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agendas_ck_valores check (
    valor_procedimento_padrao >= 0 and coalesce(valor_cobrado,0) >= 0 and desconto_aplicado >= 0 and sinal >= 0
  )
);

-- =========================================================
-- 3) Índices para performance nos filtros das telas/dashboard
-- =========================================================
create index if not exists idx_agendas_data         on public.agendas (data);
create index if not exists idx_agendas_procedimento on public.agendas (procedimento);
create index if not exists idx_agendas_pagamento    on public.agendas (forma_pagamento);
create index if not exists idx_agendas_status       on public.agendas (status);

-- =========================================================
-- 4) Trigger de atualização de updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists trg_set_updated_at on public.agendas;
create trigger trg_set_updated_at
before update on public.agendas
for each row execute function public.set_updated_at();

-- =========================================================
-- 5) RLS (habilita e cria políticas)
--    Use esta versão idempotente que checa por policyname
-- =========================================================
alter table public.agendas enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'agendas'
      and policyname = 'agendas_read_authenticated'
  ) then
    create policy agendas_read_authenticated
      on public.agendas
      for select
      using (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'agendas'
      and policyname = 'agendas_insert_authenticated'
  ) then
    create policy agendas_insert_authenticated
      on public.agendas
      for insert
      with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'agendas'
      and policyname = 'agendas_update_authenticated'
  ) then
    create policy agendas_update_authenticated
      on public.agendas
      for update
      using (auth.uid() is not null)
      with check (auth.uid() is not null);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'agendas'
      and policyname = 'agendas_delete_authenticated'
  ) then
    create policy agendas_delete_authenticated
      on public.agendas
      for delete
      using (auth.uid() is not null);
  end if;
end $$;

-- =========================================================
-- 6) Views analíticas para o dashboard
--    (bruto, descontos, líquido, ticket, contagens)
-- =========================================================
create or replace view public.v_agendas_base as
select
  data,
  procedimento,
  forma_pagamento,
  status,
  coalesce(nullif(valor_cobrado,0), valor_procedimento_padrao) as faturamento_bruto,
  desconto_aplicado as descontos,
  faturamento_liquido,
  1 as qtd
from public.agendas;

create or replace view public.v_agendas_diario as
select
  data,
  sum(faturamento_bruto)   as faturamento_bruto,
  sum(descontos)           as descontos,
  sum(faturamento_liquido) as faturamento_liquido,
  case when sum(qtd) > 0 then round(sum(faturamento_liquido)::numeric / sum(qtd), 2) else 0 end as ticket_medio,
  count(*) as procedimentos
from public.v_agendas_base
group by data
order by data;

create or replace view public.v_agendas_procedimento as
select
  procedimento,
  sum(faturamento_bruto)   as faturamento_bruto,
  sum(descontos)           as descontos,
  sum(faturamento_liquido) as faturamento_liquido,
  count(*) as qtd
from public.v_agendas_base
group by procedimento
order by faturamento_liquido desc;

create or replace view public.v_agendas_pagamento as
select
  forma_pagamento,
  sum(faturamento_bruto)   as faturamento_bruto,
  sum(descontos)           as descontos,
  sum(faturamento_liquido) as faturamento_liquido,
  count(*) as qtd
from public.v_agendas_base
group by forma_pagamento
order by faturamento_liquido desc;

create or replace view public.v_agendas_status as
select
  status,
  sum(faturamento_bruto)   as faturamento_bruto,
  sum(descontos)           as descontos,
  sum(faturamento_liquido) as faturamento_liquido,
  count(*) as qtd
from public.v_agendas_base
group by status
order by faturamento_liquido desc;