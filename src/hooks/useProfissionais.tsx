import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profissional {
  id: string;
  nome: string;
  conselho_registro?: string;
  especialidades: any[];
  email?: string;
  telefone?: string;
  ativo: boolean;
  horarios_atendimento?: any;
  bloqueios_agenda?: any;
  created_at?: string;
  updated_at?: string;
}

export const useProfissionais = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfissionais = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProfissionais(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar profissionais: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfissional = async (profissionalData: any) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert([profissionalData])
        .select()
        .single();

      if (error) throw error;
      
      setProfissionais(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Profissional cadastrado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar profissional: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfissional = async (id: string, profissionalData: any) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .update(profissionalData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProfissionais(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso!",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar profissional: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleProfissionalStatus = async (id: string, ativo: boolean) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProfissionais(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Sucesso",
        description: `Profissional ${ativo ? 'ativado' : 'desativado'} com sucesso!`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do profissional: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProfissionais();
  }, []);

  return {
    profissionais,
    loading,
    createProfissional,
    updateProfissional,
    toggleProfissionalStatus,
    refetch: fetchProfissionais,
  };
};