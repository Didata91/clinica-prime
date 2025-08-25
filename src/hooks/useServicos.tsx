import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Servico {
  id: string;
  nome: string;
  categoria: any;
  duracao_minutos: number;
  preco_base: number;
  exige_avaliacao_previa: boolean;
  ativo: boolean;
  contra_indicacoes?: string;
  cuidados_pre?: string;
  cuidados_pos?: string;
  created_at?: string;
  updated_at?: string;
}

export const useServicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setServicos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createServico = async (servicoData: any) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([servicoData])
        .select()
        .single();

      if (error) throw error;
      
      setServicos(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Serviço cadastrado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar serviço: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateServico = async (id: string, servicoData: any) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update(servicoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setServicos(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar serviço: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleServicoStatus = async (id: string, ativo: boolean) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setServicos(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Sucesso",
        description: `Serviço ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do serviço: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  return {
    servicos,
    loading,
    createServico,
    updateServico,
    toggleServicoStatus,
    refetch: fetchServicos,
  };
};