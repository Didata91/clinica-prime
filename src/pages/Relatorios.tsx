import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Target
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

const mockDadosFinanceiros = {
  faturamentoMensal: [
    { mes: "Jul", valor: 8500 },
    { mes: "Ago", valor: 9200 },
    { mes: "Set", valor: 7800 },
    { mes: "Out", valor: 11500 },
    { mes: "Nov", valor: 12300 },
    { mes: "Dez", valor: 15600 },
    { mes: "Jan", valor: 13400 }
  ],
  servicosMaisRealizados: [
    { servico: "Botox", quantidade: 45, faturamento: 22500 },
    { servico: "Preenchimento Labial", quantidade: 32, faturamento: 25600 },
    { servico: "Harmonização Facial", quantidade: 18, faturamento: 21600 },
    { servico: "Rinomodelação", quantidade: 12, faturamento: 12000 },
    { servico: "Skinbooster", quantidade: 8, faturamento: 6400 }
  ],
  clientesMaisAtivos: [
    { cliente: "Ana Silva", procedimentos: 8, gasto: 4200 },
    { cliente: "Beatriz Costa", procedimentos: 6, gasto: 3800 },
    { cliente: "Carla Oliveira", procedimentos: 5, gasto: 5500 },
    { cliente: "Diana Rocha", procedimentos: 4, gasto: 2800 },
    { cliente: "Eva Santos", procedimentos: 3, gasto: 3200 }
  ]
};

const mockDadosOperacionais = {
  agendamentosPorDia: [
    { dia: "Seg", agendamentos: 12, taxa_ocupacao: 75 },
    { dia: "Ter", agendamentos: 15, taxa_ocupacao: 94 },
    { dia: "Qua", agendamentos: 11, taxa_ocupacao: 69 },
    { dia: "Qui", agendamentos: 14, taxa_ocupacao: 88 },
    { dia: "Sex", agendamentos: 16, taxa_ocupacao: 100 },
    { dia: "Sab", agendamentos: 8, taxa_ocupacao: 67 }
  ],
  profissionaisPerformance: [
    { profissional: "Dra. Maria Santos", atendimentos: 85, faturamento: 42500, avaliacaoMedia: 4.9 },
    { profissional: "Dr. João Silva", atendimentos: 67, faturamento: 33500, avaliacaoMedia: 4.7 },
    { profissional: "Dra. Paula Costa", atendimentos: 23, faturamento: 11500, avaliacaoMedia: 4.8 }
  ]
};

export default function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("mes_atual");
  const [tipoRelatorio, setTipoRelatorio] = useState("financeiro");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const calcularTotalFaturamento = () => {
    return mockDadosFinanceiros.servicosMaisRealizados.reduce((acc, curr) => acc + curr.faturamento, 0);
  };

  const calcularTotalAtendimentos = () => {
    return mockDadosFinanceiros.servicosMaisRealizados.reduce((acc, curr) => acc + curr.quantidade, 0);
  };

  const calcularTaxaCrescimento = () => {
    const faturamento = mockDadosFinanceiros.faturamentoMensal;
    if (faturamento.length < 2) return 0;
    
    const atual = faturamento[faturamento.length - 1].valor;
    const anterior = faturamento[faturamento.length - 2].valor;
    return ((atual - anterior) / anterior) * 100;
  };

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
            // Simular exportação
            const dataStr = JSON.stringify({
              periodo: periodoSelecionado,
              financeiro: mockDadosFinanceiros,
              operacional: mockDadosOperacionais,
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
              {formatPrice(calcularTotalFaturamento())}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {calcularTaxaCrescimento() > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={calcularTaxaCrescimento() > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(calcularTaxaCrescimento()).toFixed(1)}% vs mês anterior
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
            <div className="text-2xl font-bold text-blue-600">{calcularTotalAtendimentos()}</div>
            <p className="text-xs text-muted-foreground">+8% em relação ao mês anterior</p>
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
            <div className="text-2xl font-bold text-purple-600">87</div>
            <p className="text-xs text-muted-foreground">23 novos clientes este mês</p>
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
            <div className="text-2xl font-bold text-amber-600">82%</div>
            <p className="text-xs text-muted-foreground">Meta: 85%</p>
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
                <div className="space-y-4">
                  {mockDadosFinanceiros.faturamentoMensal.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.mes}</span>
                        <span className="text-sm text-muted-foreground">{formatPrice(item.valor)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{width: `${(item.valor / 16000) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {mockDadosFinanceiros.servicosMaisRealizados.map((servico, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{servico.servico}</p>
                        <p className="text-sm text-muted-foreground">{servico.quantidade} procedimentos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatPrice(servico.faturamento)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(servico.faturamento / servico.quantidade)} /proc.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Taxa de Ocupação por Dia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Ocupação Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDadosOperacionais.agendamentosPorDia.map((dia, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{dia.dia}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">{dia.agendamentos} agend.</span>
                          <Badge variant={dia.taxa_ocupacao >= 90 ? "default" : dia.taxa_ocupacao >= 70 ? "secondary" : "outline"}>
                            {dia.taxa_ocupacao}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            dia.taxa_ocupacao >= 90 ? 'bg-green-500' : 
                            dia.taxa_ocupacao >= 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{width: `${dia.taxa_ocupacao}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance dos Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance dos Profissionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDadosOperacionais.profissionaisPerformance.map((prof, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{prof.profissional}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-sm">{prof.avaliacaoMedia}</span>
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
                  {mockDadosFinanceiros.clientesMaisAtivos.map((cliente, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{cliente.cliente}</TableCell>
                      <TableCell>{cliente.procedimentos}</TableCell>
                      <TableCell>{formatPrice(cliente.gasto)}</TableCell>
                      <TableCell>{formatPrice(cliente.gasto / cliente.procedimentos)}</TableCell>
                      <TableCell>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          {index < 3 ? "VIP" : "Regular"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                  {mockDadosFinanceiros.servicosMaisRealizados.map((servico, index) => {
                    const totalFaturamento = calcularTotalFaturamento();
                    const participacao = (servico.faturamento / totalFaturamento) * 100;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-amber-100 text-amber-800' :
                              'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{servico.servico}</TableCell>
                        <TableCell>{servico.quantidade}</TableCell>
                        <TableCell>{formatPrice(servico.faturamento)}</TableCell>
                        <TableCell>{formatPrice(servico.faturamento / servico.quantidade)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{width: `${participacao}%`}}
                              ></div>
                            </div>
                            <span className="text-sm">{participacao.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}