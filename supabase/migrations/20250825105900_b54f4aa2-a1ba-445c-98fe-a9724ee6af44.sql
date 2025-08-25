-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view their own user record" ON public.usuarios;

-- Create a secure policy that properly restricts access and excludes password hashes
CREATE POLICY "Users can view own record securely" ON public.usuarios
FOR SELECT USING (
  id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create a secure view that excludes password hashes from all SELECT operations
CREATE OR REPLACE VIEW public.usuarios_secure AS
SELECT 
  id,
  nome,
  email,
  perfil,
  ativo,
  created_at,
  updated_at
  -- Explicitly exclude senha_hash from the view
FROM public.usuarios
WHERE (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Grant permissions on the secure view
GRANT SELECT ON public.usuarios_secure TO authenticated;

-- Create a function for secure user data access that logs access attempts
CREATE OR REPLACE FUNCTION public.get_user_data_secure(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  nome text,
  email text,
  perfil perfil_usuario_enum,
  ativo boolean,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user can access this data
  IF NOT (target_user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)) THEN
    -- Log unauthorized access attempt
    INSERT INTO public.logs_auditoria (
      entidade,
      entidade_id,
      acao,
      por_usuario_id,
      delta
    ) VALUES (
      'usuarios_unauthorized_access',
      target_user_id,
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      auth.uid(),
      jsonb_build_object(
        'attempted_at', NOW(),
        'requesting_user_role', (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
      )
    );
    
    RAISE EXCEPTION 'Access denied: insufficient permissions to view user data';
  END IF;

  -- Log legitimate access for audit trail
  INSERT INTO public.logs_auditoria (
    entidade,
    entidade_id,
    acao,
    por_usuario_id,
    delta
  ) VALUES (
    'usuarios_data_access',
    target_user_id,
    'USER_DATA_ACCESS',
    auth.uid(),
    jsonb_build_object(
      'accessed_at', NOW(),
      'requesting_user_role', (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
    )
  );

  -- Return user data (without password hash)
  RETURN QUERY
  SELECT 
    u.id,
    u.nome,
    u.email,
    u.perfil,
    u.ativo,
    u.created_at,
    u.updated_at
  FROM public.usuarios u
  WHERE u.id = target_user_id;
END;
$$;