-- 1) Tabela de status de agendamento
CREATE TABLE IF NOT EXISTS public.agendamento_status (
  id text PRIMARY KEY,
  nome text NOT NULL,
  ordem int NOT NULL
);

INSERT INTO public.agendamento_status (id, nome, ordem) VALUES
  ('solicitado', 'Solicitado', 1),
  ('confirmado', 'Confirmado', 2),
  ('concluido', 'Concluído', 3),
  ('cancelado', 'Cancelado', 4)
ON CONFLICT (id) DO NOTHING;

-- 2) Adicionar status_id em agendamentos (se não existir)
ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS status_id text REFERENCES public.agendamento_status(id) DEFAULT 'solicitado';

-- 3) Adicionar preço padrão em serviços
ALTER TABLE public.servicos
  ADD COLUMN IF NOT EXISTS preco_padrao numeric(10,2) DEFAULT 0;

-- 4) Adicionar campos de preço na pivô agendamento_servicos
ALTER TABLE public.agendamento_servicos
  ADD COLUMN IF NOT EXISTS valor_padrao numeric(10,2),
  ADD COLUMN IF NOT EXISTS valor_aplicado numeric(10,2),
  ADD COLUMN IF NOT EXISTS desconto_motivo text;

-- 5) Atualizar dados existentes com preços padrão
UPDATE public.servicos 
SET preco_padrao = COALESCE(preco_base, 0) 
WHERE preco_padrao IS NULL;

-- 6) View para agendamentos com detalhes financeiros
CREATE OR REPLACE VIEW public.v_agendamentos_detalhe AS
SELECT
  a.id,
  a.data_hora_inicio,
  a.data_hora_fim,
  a.cliente_id,
  c.nome_completo as cliente_nome,
  a.profissional_id,
  p.nome as profissional_nome,
  array_remove(array_agg(s.nome ORDER BY asv.ordem), null) as servicos_nomes,
  COALESCE(SUM(asv.minutos), 0) as duracao_total_min,
  COALESCE(SUM(COALESCE(asv.valor_aplicado, asv.valor_padrao, s.preco_padrao, 0)), 0) as valor_total,
  COALESCE(a.status_id, 'solicitado') as status_id,
  ast.nome as status_nome,
  a.observacoes,
  a.created_at,
  a.updated_at
FROM public.agendamentos a
LEFT JOIN public.agendamento_servicos asv ON asv.agendamento_id = a.id
LEFT JOIN public.servicos s ON s.id = asv.servico_id
LEFT JOIN public.clientes c ON c.id = a.cliente_id
LEFT JOIN public.profissionais p ON p.id = a.profissional_id
LEFT JOIN public.agendamento_status ast ON ast.id = COALESCE(a.status_id, 'solicitado')
GROUP BY a.id, c.nome_completo, p.nome, ast.nome;

-- 7) Políticas RLS para agendamento_status
ALTER TABLE public.agendamento_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view status options"
ON public.agendamento_status
FOR SELECT
TO authenticated
USING (true);

-- 8) Atualizar políticas da pivô se necessário
DROP POLICY IF EXISTS "agendamento_servicos_select" ON public.agendamento_servicos;
DROP POLICY IF EXISTS "agendamento_servicos_write" ON public.agendamento_servicos;

CREATE POLICY "agendamento_servicos_select"
ON public.agendamento_servicos
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role) OR 
  (has_role(auth.uid(), 'profissional'::app_role) AND 
   EXISTS (
     SELECT 1 FROM agendamentos a 
     WHERE a.id = agendamento_servicos.agendamento_id 
     AND EXISTS (SELECT 1 FROM profissionais p WHERE p.id = a.profissional_id)
   )) OR
  has_role(auth.uid(), 'financeiro'::app_role)
);

CREATE POLICY "agendamento_servicos_write"
ON public.agendamento_servicos
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'recepcao'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'recepcao'::app_role));