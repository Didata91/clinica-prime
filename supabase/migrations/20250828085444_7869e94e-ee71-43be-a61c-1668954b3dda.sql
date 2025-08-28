-- Fix security issue: Add RLS policies to clientes_basic view
-- The view already has column-level security but lacks row-level security policies

-- Enable RLS on the clientes_basic view
ALTER VIEW public.clientes_basic SET (security_invoker = on);

-- Add RLS policy for viewing clients based on role - same as main clientes table
CREATE POLICY "Users can view clients basic info based on role" 
ON public.clientes_basic 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role) OR 
  has_role(auth.uid(), 'profissional'::app_role) OR
  has_role(auth.uid(), 'financeiro'::app_role)
);