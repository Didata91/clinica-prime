import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useDashboard, useAgendas, type AgendaFilters } from '@/hooks/useAgendas';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardAgendas() {
  const [periodo, setPeriodo] = useState(() => {
    const hoje = new Date();
    const inicio = startOfMonth(hoje);
    const fim = endOfMonth(hoje);
    
    return {
      data_inicio: format(inicio, 'yyyy-MM-dd'),
      data_fim: format(fim, 'yyyy-MM-dd')
    };
  });

  const {
    metricas,
    isLoadingMetricas,
    graficoDiario,
    topProcedimentos,
    porPagamento,
    porStatus
  } = useDashboard(periodo);

  const { agendas } = useAgendas(periodo);

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const setPeriodoPreset = (preset: string) => {
    const hoje = new Date();
    let inicio: Date;
    let fim: Date = hoje;

    switch (preset) {
      case 'hoje':
        inicio = hoje;
        break;
      case 'semana':
        inicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        inicio = startOfMonth(hoje);
        fim = endOfMonth(hoje);
        break;
      case 'trimestre':
        inicio = new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3, 1);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setPeriodo({
      data_inicio: format(inicio, 'yyyy-MM-dd'),
      data_fim: format(fim, 'yyyy-MM-dd')
    });
  };

  // Preparar dados para gráfico diário
  const dadosGraficoDiario = graficoDiario?.map(item => ({
    data: format(new Date(item.data), 'dd/MM', { locale: ptBR }),
    faturamento: item.faturamento_liquido || 0,
    procedimentos: item.procedimentos || 0
  })) || [];

  // Preparar dados para gráfico de procedimentos
  const dadosProcedimentos = topProcedimentos?.slice(0, 8).map(item => ({
    nome: item.procedimento.length > 20 
      ? item.procedimento.substring(0, 20) + '...' 
      : item.procedimento,
    faturamento: item.faturamento_liquido || 0
  })) || [];

  // Preparar dados para gráfico de pagamento (pizza)
  const dadosPagamento = porPagamento?.map((item, index) => ({
    nome: item.forma_pagamento || 'Não Definido',
    valor: item.faturamento_liquido || 0,
    cor: COLORS[index % COLORS.length]
  })) || [];

  // Preparar dados para gráfico de status
  const dadosStatus = porStatus?.map(item => ({
    status: item.status,
    faturamento: item.faturamento_liquido || 0,
    qtd: item.qtd || 0
  })) || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe o faturamento e performance das suas agendas
          </p>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período de Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPeriodoPreset('hoje')}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPeriodoPreset('semana')}
              >
                7 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPeriodoPreset('mes')}
              >
                Este Mês
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPeriodoPreset('trimestre')}
              >
                Trimestre
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPeriodoPreset('ano')}
              >
                Este Ano
              </Button>
            </div>

            <div className="flex gap-4">
              <div>
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={periodo.data_inicio}
                  onChange={(e) => setPeriodo(prev => ({ 
                    ...prev, 
                    data_inicio: e.target.value 
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={periodo.data_fim}
                  onChange={(e) => setPeriodo(prev => ({ 
                    ...prev, 
                    data_fim: e.target.value 
                  }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Faturamento Bruto
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(metricas?.faturamento_bruto)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Descontos
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metricas?.descontos)}
                </p>
              </div>
              <Percent className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Faturamento Líquido
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(metricas?.faturamento_liquido)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ticket Médio
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(metricas?.ticket_medio)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nº Procedimentos
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {metricas?.num_procedimentos || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento Diário */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Diário</CardTitle>
            <CardDescription>
              Evolução do faturamento líquido por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosGraficoDiario}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="faturamento" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Procedimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Procedimentos</CardTitle>
            <CardDescription>
              Procedimentos que mais faturam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProcedimentos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nome" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
                />
                <Bar dataKey="faturamento" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Forma de Pagamento</CardTitle>
            <CardDescription>
              Distribuição por método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPagamento}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, percent }) => 
                    `${nome} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {dadosPagamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Faturamento']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status das Agendas */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Status</CardTitle>
            <CardDescription>
              Faturamento e quantidade por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      notation: 'compact',
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value)
                  }
                />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'faturamento' 
                      ? formatCurrency(Number(value))
                      : value,
                    name === 'faturamento' ? 'Faturamento' : 'Quantidade'
                  ]}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="faturamento" 
                  fill="#3b82f6" 
                  name="faturamento"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="qtd" 
                  fill="#f59e0b" 
                  name="qtd"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Período</CardTitle>
          <CardDescription>
            Últimas 20 agendas do período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Procedimento</th>
                  <th className="text-right p-2">Valor Bruto</th>
                  <th className="text-right p-2">Desconto</th>
                  <th className="text-right p-2">Valor Líquido</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {agendas.slice(0, 20).map((agenda: any) => (
                  <tr key={agenda.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      {format(new Date(agenda.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="p-2">{agenda.nome}</td>
                    <td className="p-2">{agenda.procedimento}</td>
                    <td className="p-2 text-right">
                      {formatCurrency(
                        agenda.valor_cobrado || agenda.valor_procedimento_padrao
                      )}
                    </td>
                    <td className="p-2 text-right text-red-600">
                      {formatCurrency(agenda.desconto_aplicado)}
                    </td>
                    <td className="p-2 text-right font-bold">
                      {formatCurrency(agenda.faturamento_liquido)}
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agenda.status === 'concluido' ? 'bg-green-100 text-green-800' :
                        agenda.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                        agenda.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {agenda.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}