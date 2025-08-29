import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pagamento {
  id: string;
  clienteNome: string;
  servico: string;
  valor: number;
  forma: 'pix' | 'cartao' | 'dinheiro' | 'transferencia';
  status: 'pendente' | 'pago' | 'estornado';
  dataPagamento: string | null;
  dataVencimento: string | null;
  observacoes: string | null;
  agendamentoId: string;
  transacaoExternaId: string | null;
}

export interface FinanceiroStats {
  totalRecebido: number;
  totalPendente: number;
  totalTaxas: number;
  totalDescontos: number;
}

export const useFinanceiro = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [stats, setStats] = useState<FinanceiroStats>({
    totalRecebido: 0,
    totalPendente: 0,
    totalTaxas: 0,
    totalDescontos: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPagamentos = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          id,
          valor,
          forma,
          status,
          data_pagamento,
          transacao_externa_id,
          agendamentos(
            id,
            clientes(nome_completo),
            servicos(nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar dados dos pagamentos
      const pagamentosProcessados = (data || []).map(p => ({
        id: p.id,
        clienteNome: p.agendamentos?.clientes?.nome_completo || 'N/A',
        servico: p.agendamentos?.servicos?.nome || 'N/A',
        valor: p.valor || 0,
        forma: (p.forma || 'cartao') as 'pix' | 'cartao' | 'dinheiro' | 'transferencia',
        status: (p.status || 'pendente') as 'pendente' | 'pago' | 'estornado',
        dataPagamento: p.data_pagamento,
        dataVencimento: p.data_pagamento, // Por enquanto usando a mesma data
        observacoes: '',
        agendamentoId: p.agendamentos?.id || '',
        transacaoExternaId: p.transacao_externa_id,
      }));

      // Calcular estatísticas
      const totalRecebido = pagamentosProcessados
        .filter(p => p.status === 'pago')
        .reduce((acc, p) => acc + p.valor, 0);
      
      const totalPendente = pagamentosProcessados
        .filter(p => p.status === 'pendente')
        .reduce((acc, p) => acc + p.valor, 0);

      setPagamentos(pagamentosProcessados);
      setStats({
        totalRecebido,
        totalPendente,
        totalTaxas: 0, // Será calculado baseado na forma de pagamento
        totalDescontos: 0, // Adicionar campo de desconto se necessário
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pagamentos: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPagamento = async (agendamentoId: string, data: {
    valor: number;
    forma: 'pix' | 'cartao' | 'dinheiro' | 'transferencia';
    status?: 'pendente' | 'pago' | 'estornado';
  }) => {
    try {
      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .insert({
          agendamento_id: agendamentoId,
          valor: data.valor,
          forma: data.forma,
          status: data.status || 'pendente',
          data_pagamento: data.status === 'pago' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso!",
      });

      fetchPagamentos();
      return pagamento;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao registrar pagamento: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePagamento = async (id: string, updates: Partial<{
    valor: number;
    forma: 'pix' | 'cartao' | 'dinheiro' | 'transferencia';
    status: 'pendente' | 'pago' | 'estornado';
    data_pagamento: string;
  }>) => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso!",
      });

      fetchPagamentos();
      return data;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar pagamento: " + error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const confirmarPagamento = async (id: string) => {
    return updatePagamento(id, {
      status: 'pago',
      data_pagamento: new Date().toISOString(),
    });
  };

  useEffect(() => {
    fetchPagamentos();

    // Setup realtime subscription
    const channel = supabase
      .channel('pagamentos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagamentos'
        },
        () => {
          fetchPagamentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pagamentos,
    stats,
    loading,
    createPagamento,
    updatePagamento,
    confirmarPagamento,
    refetch: fetchPagamentos,
  };
};