import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DashboardStats {
  agendamentosHoje: number;
  clientesTotal: number;
  receitaMes: number;
  taxaOcupacao: number;
  noShowMes: number;
  atendimentosRealizados: number;
}

export interface AgendamentoHoje {
  id: string;
  horario: string;
  cliente: string;
  servico: string;
  profissional: string;
  status: string;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    agendamentosHoje: 0,
    clientesTotal: 0,
    receitaMes: 0,
    taxaOcupacao: 0,
    noShowMes: 0,
    atendimentosRealizados: 0,
  });
  const [agendamentosHoje, setAgendamentosHoje] = useState<AgendamentoHoje[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

      // Agendamentos de hoje
      const { data: agendamentosData, error: agendamentosError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_hora_inicio,
          status,
          clientes(nome_completo),
          servicos(nome),
          profissionais(nome)
        `)
        .gte('data_hora_inicio', `${hoje}T00:00:00`)
        .lt('data_hora_inicio', `${hoje}T23:59:59`)
        .order('data_hora_inicio');

      if (agendamentosError) throw agendamentosError;

      // Contar total de clientes
      const { count: totalClientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id', { count: 'exact' });

      if (clientesError) throw clientesError;

      // Receita do mês
      const { data: pagamentosData, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('status', 'pago')
        .gte('data_pagamento', inicioMes)
        .lte('data_pagamento', fimMes);

      if (pagamentosError) throw pagamentosError;

      // No-show do mês
      const { count: noShowCount, error: noShowError } = await supabase
        .from('agendamentos')
        .select('id', { count: 'exact' })
        .eq('status', 'faltou')
        .gte('data_hora_inicio', inicioMes)
        .lte('data_hora_inicio', fimMes);

      if (noShowError) throw noShowError;

      // Processar dados
      const agendamentosProcessados = (agendamentosData || []).map(a => ({
        id: a.id,
        horario: new Date(a.data_hora_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        cliente: a.clientes?.nome_completo || 'N/A',
        servico: a.servicos?.nome || 'N/A',
        profissional: a.profissionais?.nome || 'N/A',
        status: a.status,
      }));

      const receitaMes = pagamentosData?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
      const atendimentosRealizados = agendamentosData?.filter(a => a.status === 'compareceu').length || 0;

      setStats({
        agendamentosHoje: agendamentosData?.length || 0,
        clientesTotal: totalClientes || 0,
        receitaMes,
        taxaOcupacao: agendamentosData?.length ? Math.round((atendimentosRealizados / agendamentosData.length) * 100) : 0,
        noShowMes: noShowCount || 0,
        atendimentosRealizados,
      });

      setAgendamentosHoje(agendamentosProcessados);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do dashboard: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Setup realtime subscription
    const channel = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agendamentos'
        },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagamentos'
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    agendamentosHoje,
    loading,
    refetch: fetchDashboardData,
  };
};