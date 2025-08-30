-- Fix security issue with view - Enable RLS on the view
ALTER VIEW public.v_agendamentos_detalhe SET (security_barrier = true);

-- Create RLS policies for the view
CREATE POLICY "Users can view appointment details based on role" 
ON public.v_agendamentos_detalhe 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role) OR 
  (has_role(auth.uid(), 'profissional'::app_role) AND 
   EXISTS (SELECT 1 FROM profissionais p WHERE p.id = v_agendamentos_detalhe.profissional_id)) OR
  has_role(auth.uid(), 'financeiro'::app_role)
);

-- Enable RLS on the view
ALTER VIEW public.v_agendamentos_detalhe ENABLE ROW LEVEL SECURITY;