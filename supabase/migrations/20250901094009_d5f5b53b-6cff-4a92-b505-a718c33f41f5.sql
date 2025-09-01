-- Complete migration to fix multiple services issue

-- 1) Make servico_id optional in agendamentos table
ALTER TABLE public.agendamentos ALTER COLUMN servico_id DROP NOT NULL;

-- 2) Create pivot table for services per appointment
CREATE TABLE IF NOT EXISTS public.agendamento_servicos (
  id BIGSERIAL PRIMARY KEY,
  agendamento_id UUID NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES public.servicos(id),
  ordem INTEGER NOT NULL DEFAULT 1,
  minutos INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_agendamento_servicos_agendamento ON public.agendamento_servicos(agendamento_id);
CREATE INDEX IF NOT EXISTS ix_agendamento_servicos_servico ON public.agendamento_servicos(servico_id);

-- 3) Enable RLS for pivot table
ALTER TABLE public.agendamento_servicos ENABLE ROW LEVEL SECURITY;

-- 4) RLS policies for pivot table
DROP POLICY IF EXISTS "agendamento_servicos_select" ON public.agendamento_servicos;
CREATE POLICY "agendamento_servicos_select" ON public.agendamento_servicos
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role) OR 
  (has_role(auth.uid(), 'profissional'::app_role) AND EXISTS (
    SELECT 1 FROM agendamentos a 
    WHERE a.id = agendamento_servicos.agendamento_id 
    AND EXISTS (SELECT 1 FROM profissionais p WHERE p.id = a.profissional_id)
  )) OR 
  has_role(auth.uid(), 'financeiro'::app_role)
);

DROP POLICY IF EXISTS "agendamento_servicos_write" ON public.agendamento_servicos;
CREATE POLICY "agendamento_servicos_write" ON public.agendamento_servicos
FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role)
);