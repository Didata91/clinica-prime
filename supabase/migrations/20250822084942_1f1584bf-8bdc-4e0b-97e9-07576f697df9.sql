-- Fix security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  LIMIT 1;
$$;

-- Fix function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid AND role = required_role
  );
$$;

-- Fix function to check if user can access client data
CREATE OR REPLACE FUNCTION public.can_access_client(user_uuid UUID, client_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    -- Admin and recepcao can access all clients
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = user_uuid AND ur.role IN ('admin', 'recepcao')
  ) OR EXISTS (
    -- Profissional can access clients they have appointments with
    SELECT 1 FROM public.agendamentos a 
    JOIN public.profissionais p ON p.id = a.profissional_id
    WHERE a.cliente_id = client_uuid 
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur2 
      WHERE ur2.user_id = user_uuid AND ur2.role = 'profissional'
    )
  ) OR EXISTS (
    -- Financeiro can access clients with payment records
    SELECT 1 FROM public.pagamentos pag 
    JOIN public.agendamentos a2 ON a2.id = pag.agendamento_id
    WHERE a2.cliente_id = client_uuid
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur3 
      WHERE ur3.user_id = user_uuid AND ur3.role = 'financeiro'
    )
  );
$$;