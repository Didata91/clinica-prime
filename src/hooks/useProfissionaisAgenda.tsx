import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

export interface ProfissionalAgendaData {
  id: string;
  nome: string;
  conselho_registro?: string;
  especialidades: string[];
  email?: string;
  telefone?: string;
  ativo: boolean;
  proximosAtendimentos: any[];
  countHoje: number;
  countSemana: number;
}

export const useProfissionaisAgenda = (filtros?: {
  periodo?: 'hoje' | 'semana' | 'mes';
  servico_id?: string;
}) => {
  const [loading, setLoading] = useState(true);

  const hoje = new Date();
  const inicioHoje = startOfDay(hoje);
  const fimHoje = endOfDay(hoje);
  const fimSemana = endOfDay(addDays(hoje, 7));
  
  // Buscar profissionais
  const { data: profissionais = [], isLoading: profissionaisLoading } = useQuery({
    queryKey: ['profissionais-agenda'],
    queryFn: async () => {
      const result = await supabase
        .from('profissionais')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (result.error) throw result.error;
      return result.data || [];
    },
  });

  // Buscar próximos agendamentos para cada profissional
  const { data: agendamentos = [], isLoading: agendamentosLoading } = useQuery({
    queryKey: ['agenda-profissionais', format(hoje, 'yyyy-MM-dd'), filtros],
    queryFn: async () => {
      let query = supabase
        .rpc('get_agendamentos_detalhe')
        .gte('data_hora_inicio', inicioHoje.toISOString())
        .lte('data_hora_inicio', fimSemana.toISOString())
        .order('data_hora_inicio');

      if (filtros?.servico_id && filtros.servico_id !== 'todos') {
        query = query.eq('servico_id', filtros.servico_id);
      }

      const result = await query;
      
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: profissionais.length > 0,
  });

  // Combinar dados dos profissionais com seus agendamentos
  const profissionaisComAgenda: ProfissionalAgendaData[] = profissionais.map(prof => {
    const agendamentosProf = agendamentos.filter(
      ag => ag.profissional_id === prof.id
    );

    const agendamentosHoje = agendamentosProf.filter(ag => {
      const dataAg = new Date(ag.data_hora_inicio);
      return dataAg >= inicioHoje && dataAg <= fimHoje;
    });

    const agendamentosSemana = agendamentosProf.filter(ag => {
      const dataAg = new Date(ag.data_hora_inicio);
      return dataAg >= inicioHoje && dataAg <= fimSemana;
    });

    // Próximos 5 atendimentos
    const proximosAtendimentos = agendamentosProf
      .filter(ag => new Date(ag.data_hora_inicio) >= hoje)
      .slice(0, 5);

    return {
      ...prof,
      proximosAtendimentos,
      countHoje: agendamentosHoje.length,
      countSemana: agendamentosSemana.length,
    };
  });

  const isLoading = profissionaisLoading || agendamentosLoading;

  return {
    profissionais: profissionaisComAgenda,
    loading: isLoading,
    refetch: () => {
      // Implementar refetch se necessário
    }
  };
};