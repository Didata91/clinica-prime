-- CRITICAL SECURITY FIXES - FINAL VERSION
-- First drop existing functions to avoid conflicts

-- Phase 1: Drop existing functions and insecure views
DROP FUNCTION IF EXISTS public.get_clientes_basic();
DROP FUNCTION IF EXISTS public.get_prontuarios_summary();
DROP FUNCTION IF EXISTS public.get_pagamentos_status();
DROP FUNCTION IF EXISTS public.get_usuarios_safe();
DROP VIEW IF EXISTS public.clientes_basic;
DROP VIEW IF EXISTS public.prontuarios_summary; 
DROP VIEW IF EXISTS public.pagamentos_status;
DROP VIEW IF EXISTS public.usuarios_safe;

-- Phase 2: Fix database function security by setting proper search paths
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

-- Phase 3: Add audit logging table for sensitive data access
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
EXCEPTION WHEN OTHERS THEN
  -- Silently ignore logging errors to avoid breaking application flow
  NULL;
END;
$function$;