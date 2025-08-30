-- Drop the existing view and recreate without security issues
DROP VIEW IF EXISTS public.v_agendamentos_detalhe;

-- Create a secure function instead of a view
CREATE OR REPLACE FUNCTION public.get_agendamentos_detalhe(target_date date DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  data_hora_inicio timestamptz,
  data_hora_fim timestamptz,
  status status_agendamento_enum,
  observacoes text,
  profissional_id uuid,
  profissional_nome text,
  servico_id uuid,
  servico_nome text,
  duracao_minutos integer,
  cliente_id uuid,
  cliente_nome text,
  sala_id uuid,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.data_hora_inicio,
    a.data_hora_fim,
    a.status,
    a.observacoes,
    a.profissional_id,
    p.nome AS profissional_nome,
    a.servico_id,
    s.nome AS servico_nome,
    s.duracao_minutos,
    a.cliente_id,
    c.nome_completo AS cliente_nome,
    a.sala_id,
    a.created_at,
    a.updated_at
  FROM public.agendamentos a
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
  ORDER BY a.data_hora_inicio;
$$;