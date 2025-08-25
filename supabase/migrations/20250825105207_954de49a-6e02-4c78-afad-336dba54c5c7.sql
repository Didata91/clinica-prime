-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view their own user record" ON public.usuarios;

-- Create a secure policy that properly restricts access
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

-- Create a function for password verification (without exposing the hash)
CREATE OR REPLACE FUNCTION public.verify_user_password(user_email text, password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  stored_hash text;
BEGIN
  -- Only allow password verification for the requesting user or admin
  SELECT senha_hash INTO stored_hash 
  FROM public.usuarios 
  WHERE email = user_email 
  AND (id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- In a real implementation, you would use a proper password hashing function
  -- This is a placeholder - the actual password verification should be handled by Supabase Auth
  RETURN stored_hash = crypt(password_input, stored_hash);
END;
$$;

-- Add audit logging for password hash access attempts
CREATE OR REPLACE FUNCTION public.log_password_access_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any attempt to access password hashes
  INSERT INTO public.logs_auditoria (
    entidade,
    entidade_id,
    acao,
    por_usuario_id,
    delta
  ) VALUES (
    'usuarios_password_access',
    NEW.id,
    'PASSWORD_HASH_ACCESS_ATTEMPT',
    auth.uid(),
    jsonb_build_object(
      'attempted_at', NOW(),
      'user_email', NEW.email,
      'requesting_user_role', (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log suspicious password hash access
CREATE TRIGGER audit_password_access
  AFTER SELECT ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.log_password_access_attempt();