-- A) Esquema — adicionar colunas que faltarem
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS submission_ts timestamptz,
  ADD COLUMN IF NOT EXISTS best_contact_period text CHECK (best_contact_period IN ('Manhã','Tarde','Noite')),
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS notes text;

-- B) Helpers de normalização
-- 1) Mantém apenas dígitos (p/ CPF/telefone). Retorna NULL se input vazio.
CREATE OR REPLACE FUNCTION public.only_digits(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT nullif(regexp_replace(coalesce(p,''), '\D', '', 'g'), '');
$$;

-- 2) Normaliza @instagram: baixa, remove espaços, garante prefixo '@'
CREATE OR REPLACE FUNCTION public.norm_instagram(p text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p IS NULL OR btrim(p) = '' THEN NULL
    ELSE
      CASE
        WHEN left(btrim(lower(p)),1) = '@' THEN btrim(lower(p))
        ELSE '@' || btrim(lower(p))
      END
  END;
$$;

-- 3) Trigger para limpar campos antes de INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.clean_cliente_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Limpa CPF/CNPJ
  NEW.cpf_cnpj := public.only_digits(NEW.cpf_cnpj);
  
  -- Limpa telefone
  NEW.telefone := public.only_digits(NEW.telefone);
  
  -- Normaliza Instagram
  NEW.instagram_handle := public.norm_instagram(NEW.instagram_handle);
  
  -- Se CPF tiver menos de 11 dígitos, zera (dados incompletos do forms)
  IF NEW.cpf_cnpj IS NOT NULL AND length(NEW.cpf_cnpj) < 11 THEN
    NEW.cpf_cnpj := NULL;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_clean_clientes ON public.clientes;
CREATE TRIGGER trg_clean_clientes
BEFORE INSERT OR UPDATE ON public.clientes
FOR EACH ROW EXECUTE PROCEDURE public.clean_cliente_fields();

-- C) Unicidade (sem duplicar registros)
-- CPF
CREATE UNIQUE INDEX IF NOT EXISTS ux_clientes_cpf ON public.clientes (cpf_cnpj) WHERE cpf_cnpj IS NOT NULL;

-- Email
CREATE UNIQUE INDEX IF NOT EXISTS ux_clientes_email ON public.clientes (lower(email)) WHERE email IS NOT NULL;

-- D) Inserção/Upsert dos clientes do formulário
INSERT INTO public.clientes
  (submission_ts, nome_completo, cpf_cnpj, telefone, email, data_nascimento,
   best_contact_period, referral_source, instagram_handle, notes)
VALUES
  (to_timestamp('28/08/2025 06:15','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Lucas Eduardo Prado Delfino','39692556800','11963615242','clinica.gabrielebatista@gmail.com',
   to_date('28/08/2025','DD/MM/YYYY'),'Manhã','Contato com a Gabriele','@teste',NULL),

  (to_timestamp('28/08/2025 22:39','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Renata Lechner mota','17146092860','11947772478','renatalechner@yahoo.com.br',
   to_date('29/10/1976','DD/MM/YYYY'),'Manhã','Indicação',NULL,NULL),

  (to_timestamp('28/08/2025 22:46','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Beatriz Lechner mota','48603853819','11999698647','beatrizl11@yahoo.com',
   to_date('06/06/2000','DD/MM/YYYY'),'Noite','Contato com a Gabriele','@beatrizlechner',NULL),

  (to_timestamp('26/08/2025 21:22','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Juliana Kayane dos Santos Souza','14543951417','11981732530','Juliana.kayane50@gmail.com',
   to_date('12/05/2002','DD/MM/YYYY'),'Tarde','Outro',NULL,NULL),

  (to_timestamp('26/08/2025 22:21','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Fernanda de Oliveira Silva','47076507838','11960731766','fernanda6073@hotmail.com',
   to_date('17/01/2001','DD/MM/YYYY'),'Tarde','Indicação',NULL,NULL),

  (to_timestamp('26/08/2025 22:43','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Gracielle Barros Santos','43465071824','11959185730','grazy121819@gmail.com',
   to_date('13/04/1991','DD/MM/YYYY'),'Noite','Google',NULL,NULL),

  (to_timestamp('27/08/2025 13:51','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Edjane silva dos Santos','41106432878','11951206064','jane36096@gmail.com',
   to_date('28/09/1990','DD/MM/YYYY'),'Manhã','Indicação',NULL,NULL),

  (to_timestamp('27/08/2025 15:06','DD/MM/YYYY HH24:MI') AT TIME ZONE 'America/Sao_Paulo',
   'Debora de Jesus Oliveira','45183976813','11985535852','Debora.iborges2@gmail.com',
   to_date('27/07/1994','DD/MM/YYYY'),'Tarde','Indicação',NULL,NULL)
ON CONFLICT (cpf_cnpj) DO UPDATE
SET submission_ts       = EXCLUDED.submission_ts,
    nome_completo       = EXCLUDED.nome_completo,
    telefone            = EXCLUDED.telefone,
    email               = EXCLUDED.email,
    data_nascimento     = EXCLUDED.data_nascimento,
    best_contact_period = EXCLUDED.best_contact_period,
    referral_source     = EXCLUDED.referral_source,
    instagram_handle    = EXCLUDED.instagram_handle,
    notes               = EXCLUDED.notes,
    updated_at          = NOW();