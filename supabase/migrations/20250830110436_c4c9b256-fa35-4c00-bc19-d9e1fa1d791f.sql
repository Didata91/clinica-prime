-- CRITICAL SECURITY FIXES - SIMPLIFIED VERSION
-- Focus only on the most critical security issues

-- Phase 1: Fix database function security by setting proper search paths
-- This prevents SQL injection through schema manipulation

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(user_uuid uuid, required_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid AND role = required_role
  );
$function$;

CREATE OR REPLACE FUNCTION public."current_role"()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select ur.role::text from public.user_roles ur where ur.user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.can_access_client(user_uuid uuid, client_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
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

-- Phase 2: Drop insecure views to prevent data exposure
DROP VIEW IF EXISTS public.clientes_basic;
DROP VIEW IF EXISTS public.prontuarios_summary; 
DROP VIEW IF EXISTS public.pagamentos_status;
DROP VIEW IF EXISTS public.usuarios_safe;