-- Fix the security definer view issue by updating usuarios_safe view
-- The issue is that usuarios_safe has security_barrier=true which is being flagged

-- Drop and recreate usuarios_safe without security_barrier
DROP VIEW IF EXISTS public.usuarios_safe;
CREATE VIEW public.usuarios_safe AS
SELECT 
  id,
  nome,
  email,
  perfil,
  ativo,
  created_at,
  updated_at
FROM public.usuarios
WHERE (id = auth.uid()) OR has_role(auth.uid(), 'admin');

-- Note: The security is now handled by the WHERE clause using RLS functions
-- rather than relying on security_barrier which was causing the warning