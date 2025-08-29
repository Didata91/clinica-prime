import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  FileText,
  PieChart,
  Activity,
  Clock,
  Star,
  Target,
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRelatorios } from "@/hooks/useRelatorios";

export default function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  const { dadosFinanceiros, dadosOperacionais, stats, loading } = useRelatorios(periodoSelecionado);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calcularTaxaCrescimento = () => {
    const faturamento = dadosFinanceiros.faturamentoMensal;
    if (faturamento.length < 2) return 0;
    
    const atual = faturamento[faturamento.length - 1]?.valor || 0;
    const anterior = faturamento[faturamento.length - 2]?.valor || 0;
    return anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Análises e métricas de desempenho da clínica
          </p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="semana">Esta Semana</option>
            <option value="mes_atual">Este Mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="semestre">Semestre</option>
            <option value="ano">Este Ano</option>
          </select>
          <Button variant="outline" onClick={() => {
            const dataStr = JSON.stringify({
              periodo: periodoSelecionado,
              financeiro: dadosFinanceiros,
              operacional: dadosOperacionais,
              exportadoEm: new Date().toISOString()
            }, null, 2);
            
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-${periodoSelecionado}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.faturamentoTotal)}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {calcularTaxaCrescimento() > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={calcularTaxaCrescimento() > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(calcularTaxaCrescimento()).toFixed(1)}% vs período anterior
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Atendimentos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAtendimentos}</div>
            <p className="text-xs text-muted-foreground">procedimentos realizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">clientes com atendimentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.taxaOcupacao}%</div>
            <p className="text-xs text-muted-foreground">ocupação média</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financeiro" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Faturamento Mensal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evolução do Faturamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dadosFinanceiros.faturamentoMensal.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum dado de faturamento encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dadosFinanceiros.faturamentoMensal.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.mes}</span>
                          <span className="text-sm text-muted-foreground">{formatPrice(item.valor)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{width: `${Math.max((item.valor / Math.max(...dadosFinanceiros.faturamentoMensal.map(f => f.valor))) * 100, 5)}%`}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Serviços */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Serviços Mais Rentáveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dadosFinanceiros.servicosMaisRealizados.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum serviço encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dadosFinanceiros.servicosMaisRealizados.map((servico, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{servico.servico}</p>
                          <p className="text-sm text-muted-foreground">{servico.quantidade} procedimentos</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(servico.faturamento)}</p>
                          <p className="text-sm text-muted-foreground">
                            {servico.quantidade > 0 ? formatPrice(servico.faturamento / servico.quantidade) : formatPrice(0)} /proc.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Performance dos Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance dos Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dadosOperacionais.profissionaisPerformance.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum dado de performance encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dadosOperacionais.profissionaisPerformance.map((prof, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{prof.profissional}</p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{prof.avaliacaoMedia.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Atendimentos:</p>
                            <p className="font-medium">{prof.atendimentos}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Faturamento:</p>
                            <p className="font-medium">{formatPrice(prof.faturamento)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Mais Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosFinanceiros.clientesMaisAtivos.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cliente ativo encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Procedimentos</TableHead>
                      <TableHead>Valor Investido</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosFinanceiros.clientesMaisAtivos.map((cliente, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cliente.cliente}</TableCell>
                        <TableCell>{cliente.procedimentos}</TableCell>
                        <TableCell>{formatPrice(cliente.gasto)}</TableCell>
                        <TableCell>{cliente.procedimentos > 0 ? formatPrice(cliente.gasto / cliente.procedimentos) : formatPrice(0)}</TableCell>
                        <TableCell>
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            {index < 3 ? "VIP" : "Regular"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Ranking de Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dadosFinanceiros.servicosMaisRealizados.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum serviço encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Faturamento</TableHead>
                      <TableHead>Valor Médio</TableHead>
                      <TableHead>Participação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosFinanceiros.servicosMaisRealizados.map((servico, index) => {
                      const participacao = stats.faturamentoTotal > 0 ? (servico.faturamento / stats.faturamentoTotal) * 100 : 0;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{servico.servico}</TableCell>
                          <TableCell>{servico.quantidade}</TableCell>
                          <TableCell>{formatPrice(servico.faturamento)}</TableCell>
                          <TableCell>{servico.quantidade > 0 ? formatPrice(servico.faturamento / servico.quantidade) : formatPrice(0)}</TableCell>
                          <TableCell>{participacao.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}