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

-- 5) Update the existing function to include services from pivot table
CREATE OR REPLACE FUNCTION public.get_agendamentos_detalhe(target_date date DEFAULT NULL::date)
 RETURNS TABLE(
  id uuid, 
  data_hora_inicio timestamp with time zone, 
  data_hora_fim timestamp with time zone, 
  status status_agendamento_enum, 
  observacoes text, 
  profissional_id uuid, 
  profissional_nome text, 
  servico_id uuid, 
  servico_nome text, 
  servicos_nomes text[], 
  duracao_minutos integer, 
  cliente_id uuid, 
  cliente_nome text, 
  sala_id uuid, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    a.id,
    a.data_hora_inicio,
    a.data_hora_fim,
    a.status,
    a.observacoes,
    a.profissional_id,
    p.nome AS profissional_nome,
    COALESCE(a.servico_id, (array_agg(asv.servico_id) FILTER (WHERE asv.servico_id IS NOT NULL))[1]) AS servico_id,
    COALESCE(s.nome, (array_agg(sv.nome) FILTER (WHERE sv.nome IS NOT NULL))[1]) AS servico_nome,
    array_remove(array_agg(sv.nome ORDER BY asv.ordem), NULL) AS servicos_nomes,
    COALESCE(s.duracao_minutos, SUM(COALESCE(asv.minutos, sv.duracao_minutos))) AS duracao_minutos,
    a.cliente_id,
    c.nome_completo AS cliente_nome,
    a.sala_id,
    a.created_at,
    a.updated_at
  FROM public.agendamentos a
  LEFT JOIN public.agendamento_servicos asv ON asv.agendamento_id = a.id
  LEFT JOIN public.servicos sv ON sv.id = asv.servico_id
  LEFT JOIN public.profissionais p ON p.id = a.profissional_id
  LEFT JOIN public.servicos s ON s.id = a.servico_id
  LEFT JOIN public.clientes c ON c.id = a.cliente_id
  WHERE (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'recepcao'::app_role) OR 
    (has_role(auth.uid(), 'profissional'::app_role) AND 
     EXISTS (SELECT 1 FROM profissionais prof WHERE prof.id = a.profissional_id)) OR
    has_role(auth.uid(), 'financeiro'::app_role)
  )
  AND (target_date IS NULL OR a.data_hora_inicio::date = target_date)
  GROUP BY a.id, p.nome, c.nome_completo, s.nome, s.duracao_minutos
  ORDER BY a.data_hora_inicio;
$function$