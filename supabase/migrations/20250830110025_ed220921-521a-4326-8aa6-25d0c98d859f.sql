-- CRITICAL SECURITY FIXES
-- Phase 1: Enable RLS and add policies for exposed tables

-- 1. Enable RLS on clientes_basic and add restrictive policies
ALTER TABLE public.clientes_basic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and recepcao can view basic client data"
ON public.clientes_basic
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'recepcao'::app_role));

-- 2. Enable RLS on prontuarios_summary with temporal controls
ALTER TABLE public.prontuarios_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enhanced medical records summary access with temporal control"
ON public.prontuarios_summary
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  (has_role(auth.uid(), 'profissional'::app_role) AND 
   EXISTS (
     SELECT 1 FROM agendamentos a 
     JOIN profissionais prof ON prof.id = a.profissional_id
     WHERE a.id = prontuarios_summary.agendamento_id 
     AND a.data_hora_inicio >= (now() - interval '30 days') 
     AND a.data_hora_inicio <= (now() + interval '30 days')
   ))
);

-- 3. Enable RLS on pagamentos_status
ALTER TABLE public.pagamentos_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and financeiro can view payment status"
ON public.pagamentos_status
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'financeiro'::app_role));

-- 4. Enable RLS on usuarios_safe
ALTER TABLE public.usuarios_safe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own safe data"
ON public.usuarios_safe
FOR SELECT
USING (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Phase 2: Fix database function security by setting proper search paths
-- This prevents SQL injection through schema manipulation

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