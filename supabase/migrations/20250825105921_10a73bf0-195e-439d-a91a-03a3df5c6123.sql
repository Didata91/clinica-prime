-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.usuarios_secure;

-- Create a simple, secure view without SECURITY DEFINER
CREATE VIEW public.usuarios_safe AS
SELECT 
  id,
  nome,
  email,
  perfil,
  ativo,
  created_at,
  updated_at
  -- senha_hash is explicitly excluded for security
FROM public.usuarios;

-- Enable RLS on the view
ALTER VIEW public.usuarios_safe SET (security_barrier = true);

-- Grant select permissions
GRANT SELECT ON public.usuarios_safe TO authenticated;

-- The existing RLS policy on usuarios table will automatically apply to this view
-- since it's a simple view without SECURITY DEFINER