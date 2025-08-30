-- CRITICAL SECURITY FIXES - SIMPLIFIED VERSION
-- Only drop and fix the most critical insecure objects

-- Phase 1: Drop insecure views that have no access controls
DROP VIEW IF EXISTS public.clientes_basic;
DROP VIEW IF EXISTS public.prontuarios_summary; 
DROP VIEW IF EXISTS public.pagamentos_status;
DROP VIEW IF EXISTS public.usuarios_safe;

-- Phase 2: Fix database function security by adding proper search paths
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

-- Phase 3: Add secure audit logging table (if not exists)
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

-- Enable RLS on audit log table if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'sensitive_data_access_log' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.sensitive_data_access_log ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy for audit logs if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sensitive_data_access_log' 
    AND policyname = 'Only admin can view sensitive access logs'
  ) THEN
    CREATE POLICY "Only admin can view sensitive access logs"
    ON public.sensitive_data_access_log
    FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;