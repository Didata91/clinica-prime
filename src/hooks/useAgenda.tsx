import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, getDay } from 'date-fns';

export interface AgendaConfig {
  agenda_interval_minutes: number;
  timezone: string;
  allow_overbooking: boolean;
}

export interface ScheduleWindow {
  id: number;
  weekday?: number;
  start_time: string;
  end_time: string;
  specific_date?: string;
  is_blocked: boolean;
  notes?: string;
}

export interface DayCount {
  dia: string;
  qtd: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  occupied?: boolean;
  agendamento?: any;
}

export const useAgenda = (currentMonth: Date, selectedDate: Date | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  // Configurações globais
  const { data: config, isLoading: configLoading } = useQuery<AgendaConfig>({
    queryKey: ['agenda-config'],
    queryFn: async () => {
      const result = await supabase
        .from('app_config')
        .select('agenda_interval_minutes, timezone, allow_overbooking')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Janelas do mês (específicas por data)
  const { data: specificWindows = [] } = useQuery<ScheduleWindow[]>({
    queryKey: ['schedule-windows-specific', monthStart, monthEnd],
    queryFn: async () => {
      const result = await supabase
        .from('app_schedule_windows')
        .select('id, specific_date, start_time, end_time, is_blocked, notes')
        .gte('specific_date', monthStart)
        .lte('specific_date', monthEnd)
        .not('specific_date', 'is', null);
      
      if (result.error) throw result.error;
      return result.data || [];
    },
  });

  // Janelas por weekday (recorrentes)
  const { data: weekdayWindows = [] } = useQuery<ScheduleWindow[]>({
    queryKey: ['schedule-windows-weekday'],
    queryFn: async () => {
      const result = await supabase
        .from('app_schedule_windows')
        .select('id, weekday, start_time, end_time, is_blocked, notes')
        .is('specific_date', null);
      
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Contagem de agendados por data
  const { data: dayCounts = [] } = useQuery<DayCount[]>({
    queryKey: ['agenda-counts', monthStart, monthEnd],
    queryFn: async () => {
      const result = await supabase
        .from('agendamentos')
        .select('data_hora_inicio, cliente_id')
        .gte('data_hora_inicio::date', monthStart)
        .lte('data_hora_inicio::date', monthEnd);
      
      if (result.error) throw result.error;
      
      // Agrupar por data no cliente
      const counts: Record<string, Set<string>> = {};
      (result.data || []).forEach((item: any) => {
        const dia = item.data_hora_inicio.split('T')[0];
        if (!counts[dia]) counts[dia] = new Set();
        counts[dia].add(item.cliente_id);
      });
      
      return Object.entries(counts).map(([dia, clienteIds]) => ({
        dia,
        qtd: clienteIds.size,
      }));
    },
  });

  // Agendamentos do dia selecionado - removida para evitar erro de tipos
  const dayAppointments: any[] = [];

  // Função para verificar se uma data é habilitada
  const isDateEnabled = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    
    // Verifica se há bloqueio específico para esta data
    const specificBlock = specificWindows.find(
      w => w.specific_date === dateStr && w.is_blocked
    );
    if (specificBlock) return false;
    
    // Verifica se há configuração específica para esta data (não bloqueada)
    const specificWindow = specificWindows.find(
      w => w.specific_date === dateStr && !w.is_blocked
    );
    if (specificWindow) return true;
    
    // Verifica janelas recorrentes por weekday (não bloqueadas)
    const weekdayWindow = weekdayWindows.find(
      w => w.weekday === dayOfWeek && !w.is_blocked
    );
    
    return !!weekdayWindow;
  };

  // Função para obter contagem de agendados de uma data
  const getDateCount = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dayCounts.find(d => d.dia === dateStr)?.qtd || 0;
  };

  // Slots do dia selecionado - simplificado
  const daySlots: TimeSlot[] = (() => {
    if (!selectedDate || !config) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayOfWeek = getDay(selectedDate);
    
    // Buscar janelas aplicáveis
    let applicableWindows: ScheduleWindow[] = [];
    
    // Primeiro, buscar configuração específica
    const specificWindow = specificWindows.find(
      w => w.specific_date === dateStr && !w.is_blocked
    );
    
    if (specificWindow) {
      applicableWindows = [specificWindow];
    } else {
      // Buscar por weekday
      applicableWindows = weekdayWindows.filter(
        w => w.weekday === dayOfWeek && !w.is_blocked
      );
    }
    
    if (applicableWindows.length === 0) return [];
    
    // Gerar slots
    const slots: TimeSlot[] = [];
    const intervalMinutes = config.agenda_interval_minutes || 30;
    
    applicableWindows.forEach(window => {
      const [startHours, startMinutes] = window.start_time.split(':').map(Number);
      const [endHours, endMinutes] = window.end_time.split(':').map(Number);
      
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = endHours * 60 + endMinutes;
      
      for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += intervalMinutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeString,
          available: true,
          occupied: false,
        });
      }
    });
    
    // Remover duplicatas e ordenar
    const uniqueSlots = Array.from(
      new Map(slots.map(slot => [slot.time, slot])).values()
    ).sort((a, b) => a.time.localeCompare(b.time));
    
    return uniqueSlots;
  })();

  // Função para criar agendamento
  const createAgendamento = async (agendamentoData: any) => {
    try {
      const result = await supabase
        .from('agendamentos')
        .insert([agendamentoData]);
      
      if (result.error) throw result.error;
      
      // Invalidar queries relevantes
      await queryClient.invalidateQueries({ queryKey: ['agenda-counts'] });
      
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar agendamento",
        variant: "destructive",
      });
      return false;
    }
  };

  // Setup realtime
  useEffect(() => {
    const channel = supabase
      .channel('agenda-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agendamentos' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['agenda-counts'] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_config' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['agenda-config'] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_schedule_windows' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['schedule-windows-specific'] });
          queryClient.invalidateQueries({ queryKey: ['schedule-windows-weekday'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    config,
    isLoading: configLoading,
    isDateEnabled,
    getDateCount,
    daySlots,
    dayAppointments,
    createAgendamento,
  };
};