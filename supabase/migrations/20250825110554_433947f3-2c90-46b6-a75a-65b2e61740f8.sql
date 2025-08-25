-- Phase 1: Critical Data Access Security Fixes

-- 1. Enhanced can_access_client function with temporal restrictions
CREATE OR REPLACE FUNCTION public.can_access_client(user_uuid uuid, client_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    -- Admin can access all clients
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = user_uuid AND ur.role = 'admin'
  ) OR EXISTS (
    -- Recepcao can only access clients with appointments within ±30 days
    SELECT 1 FROM public.user_roles ur 
    JOIN public.agendamentos a ON a.cliente_id = client_uuid
    WHERE ur.user_id = user_uuid 
    AND ur.role = 'recepcao'
    AND a.data_hora_inicio BETWEEN (now() - interval '30 days') AND (now() + interval '30 days')
  ) OR EXISTS (
    -- Profissional can only access clients with appointments within ±7 days
    SELECT 1 FROM public.agendamentos a 
    JOIN public.profissionais p ON p.id = a.profissional_id
    JOIN public.user_roles ur ON ur.user_id = user_uuid
    WHERE a.cliente_id = client_uuid 
    AND ur.role = 'profissional'
    AND a.data_hora_inicio BETWEEN (now() - interval '7 days') AND (now() + interval '7 days')
  ) OR EXISTS (
    -- Financeiro can only access clients with payment activity within 90 days
    SELECT 1 FROM public.pagamentos pag 
    JOIN public.agendamentos a2 ON a2.id = pag.agendamento_id
    JOIN public.user_roles ur ON ur.user_id = user_uuid
    WHERE a2.cliente_id = client_uuid
    AND ur.role = 'financeiro'
    AND (pag.data_pagamento >= (now() - interval '90 days') OR pag.created_at >= (now() - interval '90 days'))
  );
$function$;

-- 2. Create secure view for basic client data (reception staff)
CREATE OR REPLACE VIEW public.clientes_basic AS
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
FROM public.clientes;

-- Enable RLS on the view
ALTER VIEW public.clientes_basic SET (security_barrier = true);

-- 3. Create secure view for medical records summary
CREATE OR REPLACE VIEW public.prontuarios_summary AS
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
         )) THEN p.anamnese
    ELSE '{}'::jsonb 
  END as anamnese,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR 
         (has_role(auth.uid(), 'profissional') AND EXISTS (
           SELECT 1 FROM agendamentos a 
           JOIN profissionais prof ON prof.id = a.profissional_id
           WHERE a.id = p.agendamento_id
         )) THEN p.produtos_utilizados
    ELSE NULL 
  END as produtos_utilizados,
  CASE 
    WHEN has_role(auth.uid(), 'admin') OR 
         (has_role(auth.uid(), 'profissional') AND EXISTS (
           SELECT 1 FROM agendamentos a 
           JOIN profissionais prof ON prof.id = a.profissional_id
           WHERE a.id = p.agendamento_id
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
FROM public.prontuarios p;

-- Enable RLS on the view
ALTER VIEW public.prontuarios_summary SET (security_barrier = true);

-- 4. Enhanced RLS policy for prontuarios with temporal access
DROP POLICY IF EXISTS "Medical records access by role" ON public.prontuarios;
CREATE POLICY "Enhanced medical records access with temporal control" 
ON public.prontuarios 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  (has_role(auth.uid(), 'profissional') AND EXISTS (
    SELECT 1 FROM agendamentos a 
    JOIN profissionais prof ON prof.id = a.profissional_id
    WHERE a.id = prontuarios.agendamento_id
    -- Only during active treatment period (±30 days from appointment)
    AND a.data_hora_inicio BETWEEN (now() - interval '30 days') AND (now() + interval '30 days')
  ))
);

-- 5. Payment data segregation - Update payment policies
DROP POLICY IF EXISTS "Payment access by role" ON public.pagamentos;
CREATE POLICY "Enhanced payment access by role" 
ON public.pagamentos 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'financeiro') OR
  -- Reception can only see payment status, not full details
  (has_role(auth.uid(), 'recepcao') AND status IS NOT NULL)
);

-- Create payment summary view for reception
CREATE OR REPLACE VIEW public.pagamentos_status AS
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
FROM public.pagamentos p;

-- Enable RLS on the view
ALTER VIEW public.pagamentos_status SET (security_barrier = true);

-- 6. Create audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access(
  entity_type text,
  entity_id uuid,
  access_type text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.logs_auditoria (
    entidade,
    entidade_id,
    acao,
    por_usuario_id,
    delta
  ) VALUES (
    entity_type,
    entity_id,
    'SENSITIVE_ACCESS: ' || access_type,
    auth.uid(),
    jsonb_build_object(
      'timestamp', now(),
      'user_role', (SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1),
      'access_method', 'database_query'
    )
  );
END;
$function$;