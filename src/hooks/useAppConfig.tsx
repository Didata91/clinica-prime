import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AppConfig {
  id: number;
  clinic_name: string | null;
  timezone: string;
  currency: string;
  agenda_interval_minutes: number;
  allow_overbooking: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface ScheduleWindow {
  id: number;
  weekday: number | null;
  start_time: string;
  end_time: string;
  specific_date: string | null;
  is_blocked: boolean;
  notes: string | null;
  updated_by: string | null;
  updated_at: string;
}

export const useAppConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [scheduleWindows, setScheduleWindows] = useState<ScheduleWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Fetch app config
      const { data: configData, error: configError } = await supabase
        .from('app_config')
        .select('*')
        .single();

      if (configError) throw configError;
      setConfig(configData);

      // Fetch schedule windows
      const { data: windowsData, error: windowsError } = await supabase
        .from('app_schedule_windows')
        .select('*')
        .order('weekday', { ascending: true, nullsFirst: false })
        .order('start_time', { ascending: true });

      if (windowsError) throw windowsError;
      setScheduleWindows(windowsData || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<Omit<AppConfig, 'id' | 'updated_by' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('app_config')
        .update(updates)
        .eq('id', config?.id)
        .select()
        .single();

      if (error) throw error;
      
      setConfig(data);
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configurações: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const createScheduleWindow = async (windowData: Omit<ScheduleWindow, 'id' | 'updated_by' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('app_schedule_windows')
        .insert([windowData])
        .select()
        .single();

      if (error) throw error;
      
      setScheduleWindows(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Janela de horário criada com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar janela de horário: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateScheduleWindow = async (id: number, updates: Partial<Omit<ScheduleWindow, 'id' | 'updated_by' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('app_schedule_windows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setScheduleWindows(prev => prev.map(w => w.id === id ? data : w));
      toast({
        title: "Sucesso",
        description: "Janela de horário atualizada com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar janela de horário: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteScheduleWindow = async (id: number) => {
    try {
      const { error } = await supabase
        .from('app_schedule_windows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setScheduleWindows(prev => prev.filter(w => w.id !== id));
      toast({
        title: "Sucesso",
        description: "Janela de horário excluída com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir janela de horário: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchConfig();

    // Subscribe to config changes
    const configChannel = supabase
      .channel('app_config_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_config'
        },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    // Subscribe to schedule windows changes
    const windowsChannel = supabase
      .channel('schedule_windows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_schedule_windows'
        },
        () => {
          fetchConfig();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(configChannel);
      supabase.removeChannel(windowsChannel);
    };
  }, []);

  return {
    config,
    scheduleWindows,
    loading,
    updateConfig,
    createScheduleWindow,
    updateScheduleWindow,
    deleteScheduleWindow,
    refetch: fetchConfig,
  };
};