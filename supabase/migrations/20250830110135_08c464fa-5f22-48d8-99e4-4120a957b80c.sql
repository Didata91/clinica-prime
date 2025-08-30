-- CRITICAL SECURITY FIXES (Corrected)
-- Views need to be recreated with security definer functions instead of RLS

-- Phase 1: Fix database function security by setting proper search paths
CREATE OR REPLACE FUNCTION public.only_digits(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT nullif(regexp_replace(coalesce(p,''), '\D', '', 'g'), '');
$function$;

CREATE OR REPLACE FUNCTION public.norm_instagram(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE
    WHEN p IS NULL OR btrim(p) = '' THEN NULL
    ELSE
      CASE
        WHEN left(btrim(lower(p)),1) = '@' THEN btrim(lower(p))
        ELSE '@' || btrim(lower(p))
      END
  END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.clean_cliente_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Limpa CPF/CNPJ
  NEW.cpf_cnpj := public.only_digits(NEW.cpf_cnpj);
  
  -- Limpa telefone
  NEW.telefone := public.only_digits(NEW.telefone);
  
  -- Normaliza Instagram
  NEW.instagram_handle := public.norm_instagram(NEW.instagram_handle);
  
  -- Se CPF tiver menos de 11 dígitos, zera (dados incompletos do forms)
  IF NEW.cpf_cnpj IS NOT NULL AND length(NEW.cpf_cnpj) < 11 THEN
    NEW.cpf_cnpj := NULL;
  END IF;

  RETURN NEW;
END;
$function$;

-- Phase 2: Create secure functions to replace insecure views
-- These functions will have proper role-based access control

CREATE OR REPLACE FUNCTION public.get_clientes_basic()
RETURNS TABLE(
  id uuid,
  nome_completo text,
  telefone text,
  email text,
  data_nascimento date,
  sexo sexo_enum,
  cpf_cnpj text,
  cidade text,
  uf text,
  alergias text,
  medicamentos_uso text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cep text,
  observacoes text,
  instagram text,
  consentimento_lgpd boolean,
  termo_consentimento_assinado_em timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    c.id,
    c.nome_completo,
    c.telefone,
    c.email,
    c.data_nascimento,
    c.sexo,
    c.cpf_cnpj,
    c.cidade,
    c.uf,
    c.alergias,
    c.medicamentos_uso,
    c.logradouro,
    c.numero,
    c.complemento,
    c.bairro,
    c.cep,
    c.observacoes,
    c.instagram,
    c.consentimento_lgpd,
    c.termo_consentimento_assinado_em,
    c.created_at,
    c.updated_at
  FROM public.clientes c
  WHERE has_role(auth.uid(), 'admin'::app_role) 
     OR has_role(auth.uid(), 'recepcao'::app_role);
$function$;

CREATE OR REPLACE FUNCTION public.get_prontuarios_summary()
RETURNS TABLE(
  id uuid,
  agendamento_id uuid,
  anamnese jsonb,
  produtos_utilizados text,
  quantidade_unidades integer,
  lote_validade text,
  fotos_antes text[],
  fotos_depois text[],
  observacoes text,
  assinatura_profissional text,
  assinatura_digital_paciente text,
  data_finalizacao timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.agendamento_id,
    p.anamnese,
    p.produtos_utilizados,
    p.quantidade_unidades,
    p.lote_validade,
    p.fotos_antes,
    p.fotos_depois,
    p.observacoes,
    p.assinatura_profissional,
    p.assinatura_digital_paciente,
    p.data_finalizacao,
    p.created_at,
    p.updated_at
  FROM public.prontuarios p
  JOIN public.agendamentos a ON a.id = p.agendamento_id
  WHERE has_role(auth.uid(), 'admin'::app_role) 
     OR (has_role(auth.uid(), 'profissional'::app_role) 
         AND EXISTS (
           SELECT 1 FROM profissionais prof 
           WHERE prof.id = a.profissional_id
           AND a.data_hora_inicio >= (now() - interval '30 days') 
           AND a.data_hora_inicio <= (now() + interval '30 days')
         ));
$function$;

CREATE OR REPLACE FUNCTION public.get_pagamentos_status()
RETURNS TABLE(
  id uuid,
  agendamento_id uuid,
  valor numeric,
  forma forma_pagamento_enum,
  status status_pagamento_enum,
  data_pagamento timestamp with time zone,
  transacao_externa_id text,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.agendamento_id,
    p.valor,
    p.forma,
    p.status,
    p.data_pagamento,
    p.transacao_externa_id,
    p.created_at
  FROM public.pagamentos p
  WHERE has_role(auth.uid(), 'admin'::app_role) 
     OR has_role(auth.uid(), 'financeiro'::app_role);
$function$;

CREATE OR REPLACE FUNCTION public.get_usuarios_safe()
RETURNS TABLE(
  id uuid,
  nome text,
  email text,
  perfil perfil_usuario_enum,
  ativo boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    u.id,
    u.nome,
    u.email,
    u.perfil,
    u.ativo,
    u.created_at,
    u.updated_at
  FROM public.usuarios u
  WHERE u.id = auth.uid() 
     OR has_role(auth.uid(), 'admin'::app_role);
$function$;

-- Phase 3: Add audit logging for sensitive data access
CREATE TABLE IF NOT EXISTS public.sensitive_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  access_type text NOT NULL,
  user_role text,
  accessed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address inet,
  user_agent text
);

ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admin can view sensitive access logs"
ON public.sensitive_data_access_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enhanced logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  table_name text,
  record_id uuid,
  access_type text DEFAULT 'SELECT'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.sensitive_data_access_log (
    user_id,
    table_name,
    record_id,
    access_type,
    user_role
  ) VALUES (
    auth.uid(),
    table_name,
    record_id,
    access_type,
    (SELECT role::text FROM user_roles WHERE user_id = auth.uid() LIMIT 1)
  );
END;
$function$;