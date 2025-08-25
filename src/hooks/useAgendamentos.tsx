import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Agendamento {
  id: string;
  cliente_id: string;
  profissional_id: string;
  servico_id: string;
  sala_id?: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  status: 'solicitado' | 'confirmado' | 'cancelado' | 'faltou' | 'compareceu';
  origem: 'recepcao' | 'online' | 'whatsapp';
  observacoes?: string;
  politica_cancelamento_aceita: boolean;
  lembrete_enviado_em?: string;
  created_at?: string;
  updated_at?: string;
  clientes?: { nome_completo: string };
  profissionais?: { nome: string };
  servicos?: { nome: string };
  salas?: { nome: string };
}

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          clientes(nome_completo),
          profissionais(nome),
          servicos(nome),
          salas(nome)
        `)
        .order('data_hora_inicio');

      if (error) throw error;
      setAgendamentos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgendamento = async (agendamentoData: any) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([agendamentoData])
        .select(`
          *,
          clientes(nome_completo),
          profissionais(nome),
          servicos(nome),
          salas(nome)
        `)
        .single();

      if (error) throw error;
      
      setAgendamentos(prev => [...prev, data as any]);
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAgendamento = async (id: string, agendamentoData: any) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(agendamentoData)
        .eq('id', id)
        .select(`
          *,
          clientes(nome_completo),
          profissionais(nome),
          servicos(nome),
          salas(nome)
        `)
        .single();

      if (error) throw error;
      
      setAgendamentos(prev => prev.map(a => a.id === id ? data as any : a));
      toast({
        title: "Sucesso",
        description: "Agendamento atualizado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAgendamentoStatus = async (id: string, status: any) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          clientes(nome_completo),
          profissionais(nome),
          servicos(nome),
          salas(nome)
        `)
        .single();

      if (error) throw error;
      
      setAgendamentos(prev => prev.map(a => a.id === id ? data as any : a));
      toast({
        title: "Sucesso",
        description: "Status do agendamento atualizado!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAgendamentos(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Sucesso",
        description: "Agendamento cancelado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar agendamento: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  return {
    agendamentos,
    loading,
    createAgendamento,
    updateAgendamento,
    updateAgendamentoStatus,
    deleteAgendamento,
    refetch: fetchAgendamentos,
  };
};