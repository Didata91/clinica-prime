-- Fix Security Definer View issues and OTP configuration

-- 1. Remove security_barrier settings from views that are causing warnings
-- (The views themselves are fine, it's the security_barrier that's flagged)

-- Drop and recreate views without security_barrier
DROP VIEW IF EXISTS public.clientes_basic;
CREATE VIEW public.clientes_basic AS
SELECT 
  id,
  nome_completo,
  telefone,
  email,
  data_nascimento,
  sexo,
  cidade,
  uf,
  consentimento_lgpd,
  termo_consentimento_assinado_em,
  created_at,
  updated_at,
  -- Hide sensitive fields: cpf_cnpj, alergias, medicamentos_uso, full address details
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN cpf_cnpj
    ELSE NULL 
  END as cpf_cnpj,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN alergias
    ELSE NULL 
  END as alergias,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN medicamentos_uso
    ELSE NULL 
  END as medicamentos_uso,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN logradouro
    ELSE NULL 
  END as logradouro,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN numero
    ELSE NULL 
  END as numero,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN complemento
    ELSE NULL 
  END as complemento,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN bairro
    ELSE NULL 
  END as bairro,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'profissional') THEN cep
    ELSE NULL 
  END as cep,
  observacoes,
  instagram
FROM public.clientes
WHERE can_access_client(auth.uid(), id);

DROP VIEW IF EXISTS public.prontuarios_summary;
CREATE VIEW public.prontuarios_summary AS
SELECT 
  p.id,
  p.agendamento_id,
  p.created_at,
  p.updated_at,
  p.data_finalizacao,
  -- Only show full details to treating professionals and admin
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR 
         (has_role(auth.uid(), 'profissional') AND EXISTS (
           SELECT 1 FROM agendamentos a 
           JOIN profissionais prof ON prof.id = a.profissional_id
           WHERE a.id = p.agendamento_id
           AND a.data_hora_inicio BETWEEN (now() - interval '30 days') AND (now() + interval '30 days')
         )) THEN p.anamnese
    ELSE '{}'::jsonb 
  END as anamnese,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR 
         (has_role(auth.uid(), 'profissional') AND EXISTS (
           SELECT 1 FROM agendamentos a 
           JOIN profissionais prof ON prof.id = a.profissional_id
           WHERE a.id = p.agendamento_id
           AND a.data_hora_inicio BETWEEN (now() - interval '30 days') AND (now() + interval '30 days')
         )) THEN p.produtos_utilizados
    ELSE NULL 
  END as produtos_utilizados,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR 
         (has_role(auth.uid(), 'profissional') AND EXISTS (
           SELECT 1 FROM agendamentos a 
           JOIN profissionais prof ON prof.id = a.profissional_id
           WHERE a.id = p.agendamento_id
           AND a.data_hora_inicio BETWEEN (now() - interval '30 days') AND (now() + interval '30 days')
         )) THEN p.observacoes
    ELSE NULL 
  END as observacoes,
  -- Never show photos or signatures in summary view
  ARRAY[]::text[] as fotos_antes,
  ARRAY[]::text[] as fotos_depois,
  NULL as assinatura_digital_paciente,
  NULL as assinatura_profissional,
  p.quantidade_unidades,
  p.lote_validade
FROM public.prontuarios p
WHERE has_role(auth.uid(), 'admin') OR 
      (has_role(auth.uid(), 'profissional') AND EXISTS (
        SELECT 1 FROM agendamentos a 
        JOIN profissionais prof ON prof.id = a.profissional_id
        WHERE a.id = p.agendamento_id
        AND a.data_hora_inicio BETWEEN (now() - interval '30 days') AND (now() + interval '30 days')
      ));

DROP VIEW IF EXISTS public.pagamentos_status;
CREATE VIEW public.pagamentos_status AS
SELECT 
  p.id,
  p.agendamento_id,
  p.status,
  p.data_pagamento,
  p.created_at,
  -- Hide sensitive payment details from reception
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'financeiro') THEN p.valor
    ELSE NULL 
  END as valor,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'financeiro') THEN p.forma
    ELSE NULL 
  END as forma,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'financeiro') THEN p.transacao_externa_id
    ELSE NULL 
  END as transacao_externa_id
FROM public.pagamentos p
WHERE has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'financeiro') OR
      has_role(auth.uid(), 'recepcao');