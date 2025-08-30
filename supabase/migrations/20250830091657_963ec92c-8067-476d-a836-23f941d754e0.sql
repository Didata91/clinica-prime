-- 1) Índices (melhoram contagem e busca por data/profissional)
CREATE INDEX IF NOT EXISTS ix_agendamentos_data_hora ON public.agendamentos (data_hora_inicio);
CREATE INDEX IF NOT EXISTS ix_agendamentos_profissional ON public.agendamentos (profissional_id, data_hora_inicio);

-- 2) updated_at auto (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_agendamentos_updated_at ON public.agendamentos;
CREATE TRIGGER trg_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 3) View de leitura com joins, para exibir nome do cliente, profissional e serviço
CREATE OR REPLACE VIEW public.v_agendamentos_detalhe AS
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
LEFT JOIN public.clientes c ON c.id = a.cliente_id;