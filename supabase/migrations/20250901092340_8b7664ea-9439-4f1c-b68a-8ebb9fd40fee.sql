-- Adicionar campo para múltiplos serviços na tabela agendamentos
-- Vamos usar um campo JSONB para flexibilidade

-- Primeiro, adicionar a nova coluna servicos (array de objetos com serviço e duração)
ALTER TABLE public.agendamentos 
ADD COLUMN servicos JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo sobre a estrutura esperada
COMMENT ON COLUMN public.agendamentos.servicos IS 'Array de objetos com id, nome e duracao_minutos dos serviços selecionados. Exemplo: [{"id": "uuid", "nome": "Botox", "duracao_minutos": 60}]';

-- Criar um índice GIN para consultas eficientes no campo JSONB
CREATE INDEX idx_agendamentos_servicos ON public.agendamentos USING GIN(servicos);

-- Migrar dados existentes do campo servico_id para o novo campo servicos
-- Apenas para registros que têm servico_id preenchido
UPDATE public.agendamentos 
SET servicos = (
  SELECT jsonb_build_array(
    jsonb_build_object(
      'id', s.id::text,
      'nome', s.nome,
      'duracao_minutos', s.duracao_minutos
    )
  )
  FROM public.servicos s 
  WHERE s.id = agendamentos.servico_id
)
WHERE servico_id IS NOT NULL 
AND (servicos IS NULL OR servicos = '[]'::jsonb);

-- Comentários sobre a migração
COMMENT ON TABLE public.agendamentos IS 'Tabela de agendamentos. O campo servicos substitui servico_id para permitir múltiplos serviços por agendamento.';