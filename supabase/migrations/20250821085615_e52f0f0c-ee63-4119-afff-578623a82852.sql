-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'recepcao', 'profissional', 'financeiro');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = user_uuid 
  LIMIT 1;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, required_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE 
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid AND role = required_role
  );
$$;

-- Create function to check if user can access client data
CREATE OR REPLACE FUNCTION public.can_access_client(user_uuid UUID, client_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- DROP existing dangerous RLS policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.clientes;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.agendamentos;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.profissionais;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.prontuarios;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.pagamentos;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.servicos;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.salas;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.templates;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.usuarios;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.logs_auditoria;

-- Create secure RLS policies for clientes table
CREATE POLICY "Users can view clients based on role"
ON public.clientes
FOR SELECT
TO authenticated
USING (public.can_access_client(auth.uid(), id));

CREATE POLICY "Admin and recepcao can insert clients"
ON public.clientes  
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Admin and recepcao can update clients"
ON public.clientes
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Only admin can delete clients"
ON public.clientes
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for other sensitive tables
CREATE POLICY "Role based access to appointments"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recepcao') OR
  (public.has_role(auth.uid(), 'profissional') AND EXISTS (
    SELECT 1 FROM public.profissionais p WHERE p.id = profissional_id
  )) OR
  (public.has_role(auth.uid(), 'financeiro'))
);

CREATE POLICY "Admin and recepcao can manage appointments"
ON public.agendamentos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'));

-- Secure prontuarios (medical records) - most sensitive data
CREATE POLICY "Medical records access by role"
ON public.prontuarios
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  (public.has_role(auth.uid(), 'profissional') AND EXISTS (
    SELECT 1 FROM public.agendamentos a 
    JOIN public.profissionais p ON p.id = a.profissional_id
    WHERE a.id = agendamento_id
  ))
);

CREATE POLICY "Only professionals can manage medical records"
ON public.prontuarios
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- Secure payments
CREATE POLICY "Payment access by role"
ON public.pagamentos
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recepcao') OR
  public.has_role(auth.uid(), 'financeiro')
);

CREATE POLICY "Admin, recepcao and financeiro can manage payments"
ON public.pagamentos
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recepcao') OR
  public.has_role(auth.uid(), 'financeiro')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'recepcao') OR
  public.has_role(auth.uid(), 'financeiro')
);

-- Basic access policies for other tables
CREATE POLICY "Authenticated users can view services"
ON public.servicos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and recepcao can manage services"
ON public.servicos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Authenticated users can view rooms"
ON public.salas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin and recepcao can manage rooms"
ON public.salas
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'recepcao'));

CREATE POLICY "Authenticated users can view professionals"
ON public.profissionais
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage professionals"
ON public.profissionais
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can view templates"
ON public.templates
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage templates"
ON public.templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Most restrictive policies for users and audit logs
CREATE POLICY "Users can view their own user record"
ON public.usuarios
FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can manage users"
ON public.usuarios
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can access audit logs"
ON public.logs_auditoria
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));