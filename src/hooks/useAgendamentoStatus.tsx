import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AgendamentoStatus {
  id: string;
  nome: string;
  ordem: number;
}

export const useAgendamentoStatus = () => {
  const { data: statusOptions = [], isLoading } = useQuery<AgendamentoStatus[]>({
    queryKey: ['agendamento-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamento_status')
        .select('*')
        .order('ordem');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    statusOptions,
    isLoading,
  };
};