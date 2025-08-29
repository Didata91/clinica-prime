import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Prontuario {
  id: string;
  clienteNome: string;
  clienteId: string;
  servico: string;
  profissional: string;
  dataAtendimento: string;
  status: string;
  produtosUtilizados: string | null;
  quantidadeUnidades: number | null;
  observacoes: string | null;
  anamnese: any;
  fotosAntes: string[];
  fotosDepois: string[];
  assinaturaDigital: string | null;
  dataFinalizacao: string | null;
}

export interface ProntuarioStats {
  total: number;
  finalizados: number;
  emAndamento: number;
  pendentes: number;
}

export const useProntuarios = () => {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [stats, setStats] = useState<ProntuarioStats>({
    total: 0,
    finalizados: 0,
    emAndamento: 0,
    pendentes: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProntuarios = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('prontuarios')
        .select(`
          id,
          produtos_utilizados,
          quantidade_unidades,
          observacoes,
          anamnese,
          fotos_antes,
          fotos_depois,
          assinatura_digital_paciente,
          data_finalizacao,
          agendamentos(
            id,
            data_hora_inicio,
            status,
            clientes(id, nome_completo),
            servicos(nome),
            profissionais(nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados dos prontuários
      const prontuariosProcessados = (data || []).map(p => ({
        id: p.id,
        clienteNome: p.agendamentos?.clientes?.nome_completo || 'N/A',
        clienteId: p.agendamentos?.clientes?.id || 'N/A',
        servico: p.agendamentos?.servicos?.nome || 'N/A',
        profissional: p.agendamentos?.profissionais?.nome || 'N/A',
        dataAtendimento: p.agendamentos?.data_hora_inicio || '',
        status: p.data_finalizacao ? 'finalizado' : 'em_andamento',
        produtosUtilizados: p.produtos_utilizados,
        quantidadeUnidades: p.quantidade_unidades,
        observacoes: p.observacoes,
        anamnese: p.anamnese || {},
        fotosAntes: p.fotos_antes || [],
        fotosDepois: p.fotos_depois || [],
        assinaturaDigital: p.assinatura_digital_paciente,
        dataFinalizacao: p.data_finalizacao,
      }));

      // Calcular estatísticas
      const total = prontuariosProcessados.length;
      const finalizados = prontuariosProcessados.filter(p => p.status === 'finalizado').length;
      const emAndamento = prontuariosProcessados.filter(p => p.status === 'em_andamento').length;

      setProntuarios(prontuariosProcessados);
      setStats({
        total,
        finalizados,
        emAndamento,
        pendentes: total - finalizados - emAndamento,
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar prontuários: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProntuario = async (agendamentoId: string, data: {
    produtos_utilizados?: string;
    quantidade_unidades?: number;
    observacoes?: string;
    anamnese?: any;
  }) => {
    try {
      const { data: prontuario, error } = await supabase
        .from('prontuarios')
        .insert([{
          agendamento_id: agendamentoId,
          ...data,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Prontuário criado com sucesso!",
      });

      fetchProntuarios();
      return prontuario;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar prontuário: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProntuario = async (id: string, updates: Partial<{
    produtos_utilizados: string;
    quantidade_unidades: number;
    observacoes: string;
    anamnese: any;
    fotos_antes: string[];
    fotos_depois: string[];
    assinatura_digital_paciente: string;
    data_finalizacao: string;
  }>) => {
    try {
      const { data, error } = await supabase
        .from('prontuarios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Prontuário atualizado com sucesso!",
      });

      fetchProntuarios();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar prontuário: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProntuarios();

    // Setup realtime subscription
    const channel = supabase
      .channel('prontuarios_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prontuarios'
        },
        () => {
          fetchProntuarios();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    prontuarios,
    stats,
    loading,
    createProntuario,
    updateProntuario,
    refetch: fetchProntuarios,
  };
};