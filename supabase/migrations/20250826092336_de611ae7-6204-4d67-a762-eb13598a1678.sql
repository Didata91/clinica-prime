-- Add created_by column to clientes and agendamentos tables
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create trigger function to set created_by automatically
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic created_by setting
DROP TRIGGER IF EXISTS set_created_by_clientes ON public.clientes;
CREATE TRIGGER set_created_by_clientes
  BEFORE INSERT ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

DROP TRIGGER IF EXISTS set_created_by_agendamentos ON public.agendamentos;  
CREATE TRIGGER set_created_by_agendamentos
  BEFORE INSERT ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- Backfill existing records with admin user ID
UPDATE public.clientes 
SET created_by = 'd8440321-e23b-4ae8-9f61-1b5fb2d80119' 
WHERE created_by IS NULL;

UPDATE public.agendamentos 
SET created_by = 'd8440321-e23b-4ae8-9f61-1b5fb2d80119'
WHERE created_by IS NULL;

-- Update RLS policies to include ownership checks
DROP POLICY IF EXISTS "Users can view clients based on role" ON public.clientes;
CREATE POLICY "Users can view clients based on role" ON public.clientes
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role) OR
  created_by = auth.uid()
);

DROP POLICY IF EXISTS "Admin and recepcao can update clients" ON public.clientes;
CREATE POLICY "Admin and recepcao can update clients" ON public.clientes  
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'recepcao'::app_role) OR
  created_by = auth.uid()
);

DROP POLICY IF EXISTS "Only admin can delete clients" ON public.clientes;
CREATE POLICY "Only admin can delete clients" ON public.clientes
FOR DELETE USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  created_by = auth.uid()
);