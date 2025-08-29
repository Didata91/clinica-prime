import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DadosFinanceiros {
  faturamentoMensal: Array<{ mes: string; valor: number }>;
  servicosMaisRealizados: Array<{
    servico: string;
    quantidade: number;
    faturamento: number;
  }>;
  clientesMaisAtivos: Array<{
    cliente: string;
    procedimentos: number;
    gasto: number;
  }>;
}

export interface DadosOperacionais {
  agendamentosPorDia: Array<{
    dia: string;
    agendamentos: number;
    taxa_ocupacao: number;
  }>;
  profissionaisPerformance: Array<{
    profissional: string;
    atendimentos: number;
    faturamento: number;
    avaliacaoMedia: number;
  }>;
}

export interface RelatoriosStats {
  faturamentoTotal: number;
  totalAtendimentos: number;
  clientesAtivos: number;
  taxaOcupacao: number;
}

export const useRelatorios = (periodo: string = 'mes_atual') => {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros>({
    faturamentoMensal: [],
    servicosMaisRealizados: [],
    clientesMaisAtivos: [],
  });
  const [dadosOperacionais, setDadosOperacionais] = useState<DadosOperacionais>({
    agendamentosPorDia: [],
    profissionaisPerformance: [],
  });
  const [stats, setStats] = useState<RelatoriosStats>({
    faturamentoTotal: 0,
    totalAtendimentos: 0,
    clientesAtivos: 0,
    taxaOcupacao: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getDateRange = (periodo: string) => {
    const hoje = new Date();
    let inicio: Date;
    let fim = new Date();

    switch (periodo) {
      case 'semana':
        inicio = new Date(hoje);
        inicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes_atual':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'trimestre':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case 'semestre':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    }

    return { inicio: inicio.toISOString(), fim: fim.toISOString() };
  };

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      const { inicio, fim } = getDateRange(periodo);

      // Faturamento mensal
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('valor, data_pagamento')
        .eq('status', 'pago')
        .gte('data_pagamento', inicio)
        .lte('data_pagamento', fim);

      if (pagamentosError) throw pagamentosError;

      // Serviços mais realizados
      const { data: servicosData, error: servicosError } = await supabase
        .from('agendamentos')
        .select(`
          servicos(nome),
          pagamentos(valor, status)
        `)
        .eq('status', 'compareceu')
        .gte('data_hora_inicio', inicio)
        .lte('data_hora_inicio', fim);

      if (servicosError) throw servicosError;

      // Clientes mais ativos
      const { data: clientesData, error: clientesError } = await supabase
        .from('agendamentos')
        .select(`
          clientes(nome_completo),
          pagamentos(valor, status)
        `)
        .eq('status', 'compareceu')
        .gte('data_hora_inicio', inicio)
        .lte('data_hora_inicio', fim);

      if (clientesError) throw clientesError;

      // Profissionais performance
      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from('agendamentos')
        .select(`
          profissionais(nome),
          status,
          pagamentos(valor, status)
        `)
        .gte('data_hora_inicio', inicio)
        .lte('data_hora_inicio', fim);

      if (profissionaisError) throw profissionaisError;

      // Processar faturamento mensal
      const faturamentoMensal = processarFaturamentoMensal(pagamentosData || []);
      
      // Processar serviços mais realizados
      const servicosMaisRealizados = processarServicosMaisRealizados(servicosData || []);
      
      // Processar clientes mais ativos
      const clientesMaisAtivos = processarClientesMaisAtivos(clientesData || []);
      
      // Processar performance dos profissionais
      const profissionaisPerformance = processarProfissionaisPerformance(profissionaisData || []);

      // Calcular estatísticas
      const faturamentoTotal = servicosMaisRealizados.reduce((acc, s) => acc + s.faturamento, 0);
      const totalAtendimentos = servicosMaisRealizados.reduce((acc, s) => acc + s.quantidade, 0);

      setDadosFinanceiros({
        faturamentoMensal,
        servicosMaisRealizados,
        clientesMaisAtivos,
      });

      setDadosOperacionais({
        agendamentosPorDia: [], // Implementar se necessário
        profissionaisPerformance,
      });

      setStats({
        faturamentoTotal,
        totalAtendimentos,
        clientesAtivos: clientesMaisAtivos.length,
        taxaOcupacao: 82, // Calcular baseado nos dados reais
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processarFaturamentoMensal = (pagamentos: any[]) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const faturamentoPorMes: { [key: string]: number } = {};

    pagamentos.forEach(p => {
      if (p.data_pagamento) {
        const mes = new Date(p.data_pagamento).getMonth();
        const nomeMes = meses[mes];
        faturamentoPorMes[nomeMes] = (faturamentoPorMes[nomeMes] || 0) + (p.valor || 0);
      }
    });

    return Object.entries(faturamentoPorMes).map(([mes, valor]) => ({ mes, valor }));
  };

  const processarServicosMaisRealizados = (agendamentos: any[]) => {
    const servicosMap: { [key: string]: { quantidade: number; faturamento: number } } = {};

    agendamentos.forEach(a => {
      const nomeServico = a.servicos?.nome || 'Serviço não informado';
      const valorPago = a.pagamentos?.filter((p: any) => p.status === 'pago').reduce((acc: number, p: any) => acc + (p.valor || 0), 0) || 0;

      if (!servicosMap[nomeServico]) {
        servicosMap[nomeServico] = { quantidade: 0, faturamento: 0 };
      }
      servicosMap[nomeServico].quantidade += 1;
      servicosMap[nomeServico].faturamento += valorPago;
    });

    return Object.entries(servicosMap)
      .map(([servico, data]) => ({ servico, ...data }))
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 10);
  };

  const processarClientesMaisAtivos = (agendamentos: any[]) => {
    const clientesMap: { [key: string]: { procedimentos: number; gasto: number } } = {};

    agendamentos.forEach(a => {
      const nomeCliente = a.clientes?.nome_completo || 'Cliente não informado';
      const valorPago = a.pagamentos?.filter((p: any) => p.status === 'pago').reduce((acc: number, p: any) => acc + (p.valor || 0), 0) || 0;

      if (!clientesMap[nomeCliente]) {
        clientesMap[nomeCliente] = { procedimentos: 0, gasto: 0 };
      }
      clientesMap[nomeCliente].procedimentos += 1;
      clientesMap[nomeCliente].gasto += valorPago;
    });

    return Object.entries(clientesMap)
      .map(([cliente, data]) => ({ cliente, ...data }))
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 10);
  };

  const processarProfissionaisPerformance = (agendamentos: any[]) => {
    const profissionaisMap: { [key: string]: { atendimentos: number; faturamento: number } } = {};

    agendamentos.forEach(a => {
      const nomeProfissional = a.profissionais?.nome || 'Profissional não informado';
      const valorPago = a.pagamentos?.filter((p: any) => p.status === 'pago').reduce((acc: number, p: any) => acc + (p.valor || 0), 0) || 0;

      if (!profissionaisMap[nomeProfissional]) {
        profissionaisMap[nomeProfissional] = { atendimentos: 0, faturamento: 0 };
      }

      if (a.status === 'compareceu') {
        profissionaisMap[nomeProfissional].atendimentos += 1;
        profissionaisMap[nomeProfissional].faturamento += valorPago;
      }
    });

    return Object.entries(profissionaisMap)
      .map(([profissional, data]) => ({ 
        profissional, 
        ...data,
        avaliacaoMedia: 4.8 // Placeholder - implementar sistema de avaliações
      }))
      .sort((a, b) => b.faturamento - a.faturamento);
  };

  useEffect(() => {
    fetchRelatorios();
  }, [periodo]);

  return {
    dadosFinanceiros,
    dadosOperacionais,
    stats,
    loading,
    refetch: fetchRelatorios,
  };
};