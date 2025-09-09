import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type StatusAgenda = 'agendado' | 'concluido' | 'nao_compareceu' | 'cancelado' | 'remarcado';
export type FormaPagamento = 'pix' | 'debito' | 'credito' | 'dinheiro' | 'boleto' | 'transferencia' | 'outro';

export interface Agenda {
  id?: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  nome: string;
  procedimento: string;
  valor_procedimento_padrao: number;
  valor_cobrado?: number | null;
  desconto_aplicado: number;
  motivo_desconto?: string | null;
  faturamento_liquido?: number | null;
  status: StatusAgenda;
  mls?: number | null;
  sinal: number;
  forma_pagamento?: FormaPagamento | null;
  created_at?: string;
  updated_at?: string;
}

export interface AgendaFilters {
  data_inicio?: string;
  data_fim?: string;
  status?: StatusAgenda;
  procedimento?: string;
  forma_pagamento?: FormaPagamento;
}

export interface DashboardMetrics {
  faturamento_bruto: number;
  descontos: number;
  faturamento_liquido: number;
  ticket_medio: number;
  num_procedimentos: number;
}

export const useAgendas = (filters?: AgendaFilters) => {
  const queryClient = useQueryClient();

  // Buscar agendas com filtros
  const { data: agendas = [], isLoading } = useQuery({
    queryKey: ['agendas', filters],
    queryFn: async () => {
      let query = supabase
        .from('agendas')
        .select('*')
        .order('data', { ascending: false })
        .order('horario', { ascending: true });

      if (filters?.data_inicio) {
        query = query.gte('data', filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte('data', filters.data_fim);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.procedimento) {
        query = query.ilike('procedimento', `%${filters.procedimento}%`);
      }
        if (filters?.forma_pagamento) {
          query = query.eq('forma_pagamento', filters.forma_pagamento as any);
        }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    }
  });

  // Criar agenda
  const createAgenda = useMutation({
    mutationFn: async (agenda: Agenda) => {
      const { data, error } = await supabase
        .from('agendas')
        .insert([agenda as any])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Agenda criada com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar agenda',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Atualizar agenda
  const updateAgenda = useMutation({
    mutationFn: async ({ id, ...agenda }: Agenda) => {
      if (!id) throw new Error('ID é obrigatório para atualização');
      
      const { data, error } = await supabase
        .from('agendas')
        .update(agenda as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Agenda atualizada com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar agenda',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Deletar agenda
  const deleteAgenda = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Agenda deletada com sucesso!' });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar agenda',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Marcar como concluído
  const marcarConcluido = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendas')
        .update({ status: 'concluido' as StatusAgenda })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Agenda marcada como concluída!' });
    }
  });

  // Remarcar agenda
  const remarcarAgenda = useMutation({
    mutationFn: async ({ id, data, horario }: { id: string; data: string; horario: string }) => {
      const { error } = await supabase
        .from('agendas')
        .update({ 
          data,
          horario,
          status: 'remarcado' as StatusAgenda 
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Agenda remarcada com sucesso!' });
    }
  });

  return {
    agendas,
    isLoading,
    createAgenda,
    updateAgenda,
    deleteAgenda,
    marcarConcluido,
    remarcarAgenda
  };
};

// Hook para o dashboard
export const useDashboard = (filters?: Pick<AgendaFilters, 'data_inicio' | 'data_fim'>) => {
  const { data: metricas, isLoading: isLoadingMetricas } = useQuery({
    queryKey: ['dashboard', 'metricas', filters],
    queryFn: async () => {
      let query = supabase.from('v_agendas_base').select('*');
      
      if (filters?.data_inicio) {
        query = query.gte('data', filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte('data', filters.data_fim);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calcular métricas agregadas
      const faturamento_bruto = data.reduce((sum, item) => sum + (item.faturamento_bruto || 0), 0);
      const descontos = data.reduce((sum, item) => sum + (item.descontos || 0), 0);
      const faturamento_liquido = data.reduce((sum, item) => sum + (item.faturamento_liquido || 0), 0);
      const num_procedimentos = data.length;
      const ticket_medio = num_procedimentos > 0 ? faturamento_liquido / num_procedimentos : 0;

      return {
        faturamento_bruto,
        descontos,
        faturamento_liquido,
        ticket_medio,
        num_procedimentos
      } as DashboardMetrics;
    }
  });

  // Gráfico diário
  const { data: graficoDiario = [] } = useQuery({
    queryKey: ['dashboard', 'diario', filters],
    queryFn: async () => {
      let query = supabase.from('v_agendas_diario').select('*');
      
      if (filters?.data_inicio || filters?.data_fim) {
        if (filters.data_inicio) query = query.gte('data', filters.data_inicio);
        if (filters.data_fim) query = query.lte('data', filters.data_fim);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Top procedimentos
  const { data: topProcedimentos = [] } = useQuery({
    queryKey: ['dashboard', 'procedimentos', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_agendas_procedimento')
        .select('*')
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  // Por forma de pagamento
  const { data: porPagamento = [] } = useQuery({
    queryKey: ['dashboard', 'pagamento', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_agendas_pagamento')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  // Por status
  const { data: porStatus = [] } = useQuery({
    queryKey: ['dashboard', 'status', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_agendas_status')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  return {
    metricas,
    isLoadingMetricas,
    graficoDiario,
    topProcedimentos,
    porPagamento,
    porStatus
  };
};