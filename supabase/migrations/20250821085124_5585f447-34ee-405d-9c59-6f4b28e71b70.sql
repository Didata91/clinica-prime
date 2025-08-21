-- Inserir dados iniciais (corrigido)

-- Inserir usuário administrador
INSERT INTO public.usuarios (nome, email, senha_hash, perfil) VALUES 
('Administrador', 'admin@clinica.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('Recepção Principal', 'recepcao@clinica.com', '$2b$10$YourHashedPasswordHere', 'recepcao')
ON CONFLICT (email) DO NOTHING;

-- Inserir profissionais
INSERT INTO public.profissionais (nome, especialidades, email, telefone, horarios_atendimento) VALUES 
('Dra. Maria Silva', ARRAY['toxina_botulinica', 'preenchimento', 'harmonizacao_facial']::especialidade_enum[], 'maria@clinica.com', '+55 11 99999-0001', '{"segunda": {"inicio": "08:00", "fim": "18:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "terca": {"inicio": "08:00", "fim": "18:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "quarta": {"inicio": "08:00", "fim": "18:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "quinta": {"inicio": "08:00", "fim": "18:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "sexta": {"inicio": "08:00", "fim": "18:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}}'),
('Dr. João Santos', ARRAY['rinomodelacao', 'preenchimento']::especialidade_enum[], 'joao@clinica.com', '+55 11 99999-0002', '{"segunda": {"inicio": "09:00", "fim": "17:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "terca": {"inicio": "09:00", "fim": "17:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "quarta": {"inicio": "09:00", "fim": "17:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "quinta": {"inicio": "09:00", "fim": "17:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}, "sexta": {"inicio": "09:00", "fim": "17:00", "intervalo": {"inicio": "12:00", "fim": "13:00"}}}'),
('Dra. Ana Costa', ARRAY['peeling', 'skinbooster', 'limpeza_pele']::especialidade_enum[], 'ana@clinica.com', '+55 11 99999-0003', '{"terca": {"inicio": "14:00", "fim": "20:00"}, "quarta": {"inicio": "14:00", "fim": "20:00"}, "quinta": {"inicio": "14:00", "fim": "20:00"}, "sexta": {"inicio": "08:00", "fim": "16:00"}, "sabado": {"inicio": "08:00", "fim": "14:00"}}');

-- Inserir salas
INSERT INTO public.salas (nome, tipo) VALUES 
('Sala de Procedimentos 1', 'procedimento'),
('Sala de Procedimentos 2', 'procedimento'),
('Sala de Avaliação', 'avaliacao');

-- Inserir serviços
INSERT INTO public.servicos (nome, categoria, duracao_minutos, preco_base, exige_avaliacao_previa, contra_indicacoes, cuidados_pre, cuidados_pos) VALUES 
('Avaliação Inicial', 'avaliacao', 30, 0.00, false, 'Nenhuma', 'Comparecer com o rosto limpo', 'Aguardar contato para agendamento do procedimento'),
('Toxina Botulínica 30U', 'toxina', 45, 899.00, true, 'Gravidez, amamentação, miastenia gravis', 'Não usar anti-inflamatórios 7 dias antes', 'Não deitar por 4h, não fazer exercícios por 24h'),
('Toxina Botulínica 50U', 'toxina', 60, 1299.00, true, 'Gravidez, amamentação, miastenia gravis', 'Não usar anti-inflamatórios 7 dias antes', 'Não deitar por 4h, não fazer exercícios por 24h'),
('Preenchimento Labial', 'preenchimento', 60, 1599.00, true, 'Herpes ativo, gravidez', 'Evitar bebidas alcoólicas 24h antes', 'Aplicar gelo, evitar exercícios por 24h'),
('Rinomodelação', 'preenchimento', 90, 2499.00, true, 'Rinite aguda, gravidez', 'Não usar anti-inflamatórios', 'Não usar óculos por 15 dias'),
('Skinbooster Facial', 'outros', 45, 699.00, false, 'Infecção ativa na face', 'Pele limpa sem maquiagem', 'Protetor solar obrigatório'),
('Peeling Químico', 'limpeza', 30, 399.00, false, 'Feridas abertas, exposição solar recente', 'Não usar ácidos 5 dias antes', 'Protetor solar FPS 60, não exposição solar por 7 dias'),
('Consulta de Retorno', 'pos', 20, 0.00, false, 'Nenhuma', 'Trazer fotos do resultado', 'Seguir orientações dadas na consulta');

-- Inserir templates de mensagem
INSERT INTO public.templates (tipo, nome, conteudo) VALUES 
('whatsapp', 'Confirmação de Agendamento', 'Olá {{cliente}}! Seu agendamento foi confirmado para {{data}} às {{hora}} com {{profissional}} para {{servico}}. Local: Clínica Prime. Em caso de dúvidas, entre em contato.'),
('whatsapp', 'Lembrete 24h', 'Oi {{cliente}}! Lembramos que você tem consulta amanhã ({{data}}) às {{hora}} para {{servico}}. Confirme sua presença respondendo este WhatsApp. Obrigado!'),
('whatsapp', 'Cuidados Pós-Procedimento', 'Olá {{cliente}}! Esperamos que esteja bem após seu procedimento de {{servico}}. Lembre-se dos cuidados: {{cuidados}}. Qualquer dúvida, estamos aqui!'),
('email', 'Confirmação por Email', 'Prezado(a) {{cliente}}, confirmamos seu agendamento para {{data}} às {{hora}} com {{profissional}} para o procedimento {{servico}}. Aguardamos você!'),
('termo', 'Termo de Consentimento Padrão', 'TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO\n\nEu, {{cliente}}, declaro ter sido informado(a) sobre o procedimento {{servico}} a ser realizado em {{data}}.\n\nFui esclarecido(a) sobre:\n- Os objetivos do tratamento\n- Os riscos e complicações possíveis\n- Os cuidados pré e pós-procedimento\n- As alternativas de tratamento\n\nDeclaro estar ciente e concordo com a realização do procedimento.\n\nData: {{data}}\nAssinatura do Paciente: ________________________\nAssinatura do Profissional: ________________________');

-- Inserir alguns clientes de exemplo
INSERT INTO public.clientes (nome_completo, telefone, email, data_nascimento, sexo, consentimento_lgpd) VALUES 
('Maria Oliveira Santos', '+55 11 99888-7777', 'maria.santos@email.com', '1985-03-15', 'feminino', true),
('Ana Paula Silva', '+55 11 98777-6666', 'ana.silva@email.com', '1992-07-22', 'feminino', true),
('Carla Mendes', '+55 11 97666-5555', 'carla.mendes@email.com', '1988-11-08', 'feminino', true),
('Juliana Costa', '+55 11 96555-4444', 'juliana.costa@email.com', '1990-05-12', 'feminino', true),
('Renata Lima', '+55 11 95444-3333', 'renata.lima@email.com', '1987-09-25', 'feminino', true)
ON CONFLICT (telefone) DO NOTHING;