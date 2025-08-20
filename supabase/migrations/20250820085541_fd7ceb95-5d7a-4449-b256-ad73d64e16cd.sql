-- Criar enums primeiro
CREATE TYPE public.sexo_enum AS ENUM ('feminino', 'masculino', 'outro', 'nao_informar');
CREATE TYPE public.especialidade_enum AS ENUM ('toxina_botulinica', 'preenchimento', 'rinomodelacao', 'peeling', 'skinbooster', 'harmonizacao_facial', 'limpeza_pele');
CREATE TYPE public.categoria_servico_enum AS ENUM ('toxina', 'preenchimento', 'avaliacao', 'pos', 'peeling', 'outros');
CREATE TYPE public.status_agendamento_enum AS ENUM ('solicitado', 'confirmado', 'compareceu', 'faltou', 'cancelado');
CREATE TYPE public.origem_agendamento_enum AS ENUM ('recepcao', 'online', 'whatsapp');
CREATE TYPE public.forma_pagamento_enum AS ENUM ('pix', 'cartao', 'dinheiro', 'transferencia');
CREATE TYPE public.status_pagamento_enum AS ENUM ('pendente', 'pago', 'estornado');
CREATE TYPE public.perfil_usuario_enum AS ENUM ('admin', 'recepcao', 'profissional', 'financeiro', 'gestor');
CREATE TYPE public.template_tipo_enum AS ENUM ('whatsapp', 'email', 'termo');

-- Tabela de usuários (sistema interno)
CREATE TABLE public.usuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    perfil perfil_usuario_enum NOT NULL DEFAULT 'recepcao',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo TEXT NOT NULL,
    cpf_cnpj TEXT,
    data_nascimento DATE,
    sexo sexo_enum,
    telefone TEXT NOT NULL,
    email TEXT,
    instagram TEXT,
    alergias TEXT,
    medicamentos_uso TEXT,
    observacoes TEXT,
    consentimento_lgpd BOOLEAN NOT NULL DEFAULT false,
    termo_consentimento_assinado_em TIMESTAMP WITH TIME ZONE,
    -- Endereço
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    cep TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de profissionais
CREATE TABLE public.profissionais (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    conselho_registro TEXT,
    especialidades especialidade_enum[] DEFAULT '{}',
    email TEXT,
    telefone TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    horarios_atendimento JSONB DEFAULT '{}',
    bloqueios_agenda JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de salas
CREATE TABLE public.salas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'procedimento',
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE public.servicos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria categoria_servico_enum NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    preco_base DECIMAL NOT NULL DEFAULT 0,
    exige_avaliacao_previa BOOLEAN NOT NULL DEFAULT false,
    contra_indicacoes TEXT,
    cuidados_pre TEXT,
    cuidados_pos TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE public.agendamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL,
    profissional_id UUID NOT NULL,
    servico_id UUID NOT NULL,
    sala_id UUID,
    data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_hora_fim TIMESTAMP WITH TIME ZONE NOT NULL,
    status status_agendamento_enum NOT NULL DEFAULT 'solicitado',
    origem origem_agendamento_enum NOT NULL DEFAULT 'recepcao',
    observacoes TEXT,
    politica_cancelamento_aceita BOOLEAN NOT NULL DEFAULT false,
    lembrete_enviado_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE public.pagamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agendamento_id UUID NOT NULL,
    valor DECIMAL NOT NULL,
    forma forma_pagamento_enum NOT NULL,
    status status_pagamento_enum NOT NULL DEFAULT 'pendente',
    transacao_externa_id TEXT,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de prontuários
CREATE TABLE public.prontuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agendamento_id UUID NOT NULL,
    anamnese JSONB DEFAULT '{}',
    fotos_antes TEXT[] DEFAULT '{}',
    fotos_depois TEXT[] DEFAULT '{}',
    produtos_utilizados TEXT,
    quantidade_unidades INTEGER,
    lote_validade TEXT,
    observacoes TEXT,
    assinatura_digital_paciente TEXT,
    assinatura_profissional TEXT,
    data_finalizacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de templates
CREATE TABLE public.templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo template_tipo_enum NOT NULL,
    nome TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs de auditoria
CREATE TABLE public.logs_auditoria (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entidade TEXT NOT NULL,
    entidade_id UUID NOT NULL,
    acao TEXT NOT NULL,
    por_usuario_id UUID,
    delta JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS simples (permitir tudo para usuários autenticados por enquanto)
CREATE POLICY "Allow all for authenticated users" ON public.usuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.profissionais FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.salas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.servicos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.agendamentos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.pagamentos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.prontuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON public.logs_auditoria FOR ALL TO authenticated USING (true);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON public.profissionais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_salas_updated_at BEFORE UPDATE ON public.salas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON public.pagamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prontuarios_updated_at BEFORE UPDATE ON public.prontuarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();