import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  CreditCard,
  Banknote,
  PiggyBank,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Calendar,
  Download,
  Edit,
  FileText,
  Check
} from "lucide-react";
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const mockPagamentos = [
  {
    id: 1,
    clienteNome: "Ana Silva",
    servico: "Botox 30U",
    valor: 500.00,
    forma: "cartao_credito",
    status: "pago",
    dataPagamento: "2024-01-15T15:30:00",
    dataVencimento: "2024-01-15T15:30:00",
    parcelas: "1x",
    desconto: 0,
    taxa: 15.00,
    valorLiquido: 485.00,
    observacoes: "Pagamento realizado no momento do procedimento"
  },
  {
    id: 2,
    clienteNome: "Beatriz Costa",
    servico: "Preenchimento Labial",
    valor: 800.00,
    forma: "pix",
    status: "pago",
    dataPagamento: "2024-01-13T17:45:00",
    dataVencimento: "2024-01-13T17:45:00",
    parcelas: "À vista",
    desconto: 80.00,
    taxa: 0,
    valorLiquido: 720.00,
    observacoes: "Desconto de 10% para pagamento à vista"
  },
  {
    id: 3,
    clienteNome: "Carla Oliveira",
    servico: "Harmonização Facial Completa",
    valor: 1200.00,
    forma: "cartao_credito",
    status: "pendente",
    dataPagamento: null,
    dataVencimento: "2024-01-20T18:00:00",
    parcelas: "3x",
    desconto: 0,
    taxa: 45.00,
    valorLiquido: 1155.00,
    observacoes: "Parcelamento em 3x sem juros"
  },
  {
    id: 4,
    clienteNome: "Diana Rocha",
    servico: "Avaliação Inicial",
    valor: 0.00,
    forma: "cortesia",
    status: "isento",
    dataPagamento: "2024-01-12T14:00:00",
    dataVencimento: "2024-01-12T14:00:00",
    parcelas: "N/A",
    desconto: 0,
    taxa: 0,
    valorLiquido: 0,
    observacoes: "Consulta de avaliação gratuita"
  },
  {
    id: 5,
    clienteNome: "Eva Santos",
    servico: "Rinomodelação",
    valor: 1000.00,
    forma: "cartao_debito",
    status: "cancelado",
    dataPagamento: null,
    dataVencimento: "2024-01-10T16:00:00",
    parcelas: "À vista",
    desconto: 0,
    taxa: 20.00,
    valorLiquido: 980.00,
    observacoes: "Pagamento cancelado - procedimento reagendado"
  }
];

const statusMap = {
  pago: { label: "Pago", color: "default" as const, icon: CheckCircle },
  pendente: { label: "Pendente", color: "secondary" as const, icon: Clock },
  cancelado: { label: "Cancelado", color: "destructive" as const, icon: AlertTriangle },
  isento: { label: "Isento", color: "outline" as const, icon: CheckCircle }
};

const formaMap = {
  cartao_credito: { label: "Cartão de Crédito", icon: CreditCard },
  cartao_debito: { label: "Cartão de Débito", icon: CreditCard },
  pix: { label: "PIX", icon: Banknote },
  dinheiro: { label: "Dinheiro", icon: Banknote },
  cortesia: { label: "Cortesia", icon: PiggyBank }
};

export default function Financeiro() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState("mes_atual");
  const [pagamentos, setPagamentos] = useState(mockPagamentos);
  const [isRegistrarPagamentoOpen, setIsRegistrarPagamentoOpen] = useState(false);
  const [isEditando, setIsEditando] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<any>(null);
  const [novoPagamentoData, setNovoPagamentoData] = useState({
    cliente: "",
    servico: "",
    valor: "",
    forma: "",
    parcelas: "1",
    desconto: "",
    observacoes: ""
  });

  const { toast } = useToast();

  const filteredPagamentos = pagamentos.filter(pagamento => {
    const matchSearch = pagamento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       pagamento.servico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "todos" || pagamento.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleRegistrarPagamento = () => {
    if (!novoPagamentoData.cliente || !novoPagamentoData.servico || !novoPagamentoData.valor || !novoPagamentoData.forma) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const valor = parseFloat(novoPagamentoData.valor);
    const desconto = parseFloat(novoPagamentoData.desconto) || 0;
    const taxa = novoPagamentoData.forma === 'cartao_credito' ? valor * 0.035 : 
                 novoPagamentoData.forma === 'cartao_debito' ? valor * 0.02 : 0;
    
    if (isEditando && pagamentoEditando) {
      const pagamentoAtualizado = {
        ...pagamentoEditando,
        clienteNome: novoPagamentoData.cliente,
        servico: novoPagamentoData.servico,
        valor: valor,
        forma: novoPagamentoData.forma,
        parcelas: novoPagamentoData.parcelas === "1" ? "À vista" : `${novoPagamentoData.parcelas}x`,
        desconto: desconto,
        taxa: taxa,
        valorLiquido: valor - desconto - taxa,
        observacoes: novoPagamentoData.observacoes || "Pagamento editado"
      };

      setPagamentos(pagamentos.map(p => p.id === pagamentoEditando.id ? pagamentoAtualizado : p));
      toast({
        title: "Sucesso",
        description: "Pagamento atualizado com sucesso!",
      });
    } else {
      const novoPagamento = {
        id: pagamentos.length + 1,
        clienteNome: novoPagamentoData.cliente,
        servico: novoPagamentoData.servico,
        valor: valor,
        forma: novoPagamentoData.forma,
        status: "pago" as const,
        dataPagamento: new Date().toISOString(),
        dataVencimento: new Date().toISOString(),
        parcelas: novoPagamentoData.parcelas === "1" ? "À vista" : `${novoPagamentoData.parcelas}x`,
        desconto: desconto,
        taxa: taxa,
        valorLiquido: valor - desconto - taxa,
        observacoes: novoPagamentoData.observacoes || "Pagamento registrado manualmente"
      };

      setPagamentos([...pagamentos, novoPagamento]);
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso!",
      });
    }

    setNovoPagamentoData({
      cliente: "",
      servico: "",
      valor: "",
      forma: "",
      parcelas: "1",
      desconto: "",
      observacoes: ""
    });
    setIsRegistrarPagamentoOpen(false);
    setIsEditando(false);
    setPagamentoEditando(null);
  };

  const handleEditarPagamento = (pagamento: any) => {
    setNovoPagamentoData({
      cliente: pagamento.clienteNome,
      servico: pagamento.servico,
      valor: pagamento.valor.toString(),
      forma: pagamento.forma,
      parcelas: pagamento.parcelas === "À vista" ? "1" : pagamento.parcelas.replace('x', ''),
      desconto: pagamento.desconto.toString(),
      observacoes: pagamento.observacoes
    });
    setPagamentoEditando(pagamento);
    setIsEditando(true);
    setIsRegistrarPagamentoOpen(true);
  };

  const handleConfirmarPagamento = (id: number) => {
    setPagamentos(pagamentos.map(p => 
      p.id === id ? { ...p, status: "pago" as const, dataPagamento: new Date().toISOString() } : p
    ));
    toast({
      title: "Sucesso",
      description: "Pagamento confirmado!",
    });
  };

  const exportarExcel = () => {
    const dadosExport = filteredPagamentos.map(p => ({
      'Cliente': p.clienteNome,
      'Serviço': p.servico,
      'Valor Bruto': p.valor,
      'Desconto': p.desconto,
      'Taxa': p.taxa,
      'Valor Líquido': p.valorLiquido,
      'Forma Pagamento': formaMap[p.forma as keyof typeof formaMap].label,
      'Status': statusMap[p.status as keyof typeof statusMap].label,
      'Parcelas': p.parcelas,
      'Data Pagamento': p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-BR') : '-',
      'Observações': p.observacoes
    }));

    const ws = XLSX.utils.json_to_sheet(dadosExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagamentos");
    
    const fileName = `financeiro_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Sucesso",
      description: "Relatório exportado em Excel!",
    });
  };

  const gerarPDF = () => {
    const dadosRelatorio = {
      titulo: 'Relatório Financeiro',
      periodo: selectedPeriodo,
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      totalRecebido,
      totalPendente,
      totalTaxas,
      totalDescontos,
      pagamentos: filteredPagamentos
    };

    // Criar conteúdo HTML para impressão
    const conteudoHTML = `
      <html>
        <head>
          <title>Relatório Financeiro</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: flex; justify-content: space-around; margin: 20px 0; }
            .summary-item { text-align: center; padding: 10px; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Financeiro</h1>
            <p>Período: ${selectedPeriodo} | Data: ${dadosRelatorio.dataGeracao}</p>
          </div>
          
          <div class="summary">
            <div class="summary-item">
              <h3>Recebido</h3>
              <p class="total">${formatPrice(totalRecebido)}</p>
            </div>
            <div class="summary-item">
              <h3>Pendente</h3>
              <p class="total">${formatPrice(totalPendente)}</p>
            </div>
            <div class="summary-item">
              <h3>Taxas</h3>
              <p class="total">${formatPrice(totalTaxas)}</p>
            </div>
            <div class="summary-item">
              <h3>Descontos</h3>
              <p class="total">${formatPrice(totalDescontos)}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Forma</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPagamentos.map(p => `
                <tr>
                  <td>${p.clienteNome}</td>
                  <td>${p.servico}</td>
                  <td>${formatPrice(p.valor)}</td>
                  <td>${statusMap[p.status as keyof typeof statusMap].label}</td>
                  <td>${formaMap[p.forma as keyof typeof formaMap].label}</td>
                  <td>${p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-BR') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Abrir em nova janela para impressão/salvar como PDF
    const novaJanela = window.open('', '_blank');
    if (novaJanela) {
      novaJanela.document.write(conteudoHTML);
      novaJanela.document.close();
      novaJanela.focus();
      setTimeout(() => {
        novaJanela.print();
      }, 500);
    }

    toast({
      title: "Sucesso",
      description: "PDF gerado! Use Ctrl+P para salvar como PDF.",
    });
  };

  // Cálculos do resumo financeiro
  const totalRecebido = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((acc, p) => acc + p.valorLiquido, 0);
  
  const totalPendente = pagamentos
    .filter(p => p.status === 'pendente')
    .reduce((acc, p) => acc + p.valor, 0);
  
  const totalTaxas = pagamentos
    .filter(p => p.status === 'pago')
    .reduce((acc, p) => acc + p.taxa, 0);
  
  const totalDescontos = pagamentos
    .reduce((acc, p) => acc + p.desconto, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie pagamentos, recebimentos e relatórios financeiros
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={gerarPDF}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Dialog open={isRegistrarPagamentoOpen} onOpenChange={setIsRegistrarPagamentoOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsRegistrarPagamentoOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{isEditando ? 'Editar Pagamento' : 'Registrar Novo Pagamento'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente *</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={novoPagamentoData.cliente}
                      onChange={(e) => setNovoPagamentoData({...novoPagamentoData, cliente: e.target.value})}
                    >
                      <option value="">Selecione o cliente</option>
                      <option value="Ana Silva">Ana Silva</option>
                      <option value="Beatriz Costa">Beatriz Costa</option>
                      <option value="Carla Oliveira">Carla Oliveira</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serviço *</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={novoPagamentoData.servico}
                      onChange={(e) => setNovoPagamentoData({...novoPagamentoData, servico: e.target.value})}
                    >
                      <option value="">Selecione o serviço</option>
                      <option value="Botox 30U">Botox 30U - R$ 500,00</option>
                      <option value="Preenchimento Labial">Preenchimento Labial - R$ 800,00</option>
                      <option value="Harmonização Facial Completa">Harmonização Facial - R$ 1.200,00</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$) *</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0,00"
                      value={novoPagamentoData.valor}
                      onChange={(e) => setNovoPagamentoData({...novoPagamentoData, valor: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Forma de Pagamento *</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={novoPagamentoData.forma}
                      onChange={(e) => setNovoPagamentoData({...novoPagamentoData, forma: e.target.value})}
                    >
                      <option value="">Selecione a forma</option>
                      <option value="cartao_credito">Cartão de Crédito</option>
                      <option value="cartao_debito">Cartão de Débito</option>
                      <option value="pix">PIX</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cortesia">Cortesia</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Parcelas</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={novoPagamentoData.parcelas}
                      onChange={(e) => setNovoPagamentoData({...novoPagamentoData, parcelas: e.target.value})}
                    >
                      <option value="1">À vista</option>
                      <option value="2">2x</option>
                      <option value="3">3x</option>
                      <option value="4">4x</option>
                      <option value="6">6x</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Desconto (R$)</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0,00"
                      value={novoPagamentoData.desconto}
                      onChange={(e) => setNovoPagamentoData({...novoPagamentoData, desconto: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações</label>
                  <Input 
                    placeholder="Informações adicionais sobre o pagamento..."
                    value={novoPagamentoData.observacoes}
                    onChange={(e) => setNovoPagamentoData({...novoPagamentoData, observacoes: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsRegistrarPagamentoOpen(false);
                  setIsEditando(false);
                  setPagamentoEditando(null);
                  setNovoPagamentoData({
                    cliente: "",
                    servico: "",
                    valor: "",
                    forma: "",
                    parcelas: "1",
                    desconto: "",
                    observacoes: ""
                  });
                }}>Cancelar</Button>
                <Button onClick={handleRegistrarPagamento}>
                  {isEditando ? 'Atualizar Pagamento' : 'Registrar Pagamento'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de resumo financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido no Mês</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(totalRecebido)}</div>
            <p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatPrice(totalPendente)}</div>
            <p className="text-xs text-muted-foreground">3 pagamentos em aberto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxas e Comissões</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatPrice(totalTaxas)}</div>
            <p className="text-xs text-muted-foreground">Taxas de cartão e outros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descontos Dados</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(totalDescontos)}</div>
            <p className="text-xs text-muted-foreground">Promoções e cortesias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pagamentos" className="w-full">
        <TabsList>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
          <TabsTrigger value="resumo">Resumo do Período</TabsTrigger>
          <TabsTrigger value="formas">Por Forma de Pagamento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pagamentos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <select 
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="hoje">Hoje</option>
                    <option value="semana">Esta Semana</option>
                    <option value="mes_atual">Este Mês</option>
                    <option value="mes_anterior">Mês Anterior</option>
                    <option value="trimestre">Trimestre</option>
                    <option value="ano">Este Ano</option>
                  </select>
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="pago">Pagos</option>
                    <option value="pendente">Pendentes</option>
                    <option value="cancelado">Cancelados</option>
                    <option value="isento">Isentos</option>
                  </select>
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por cliente, serviço..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPagamentos.map((pagamento) => {
                      const StatusIcon = statusMap[pagamento.status as keyof typeof statusMap].icon;
                      const FormaIcon = formaMap[pagamento.forma as keyof typeof formaMap].icon;
                      
                      return (
                        <TableRow key={pagamento.id}>
                          <TableCell className="font-medium">{pagamento.clienteNome}</TableCell>
                          <TableCell>{pagamento.servico}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{formatPrice(pagamento.valor)}</p>
                              {pagamento.desconto > 0 && (
                                <p className="text-xs text-green-600">
                                  Desc: {formatPrice(pagamento.desconto)}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Líquido: {formatPrice(pagamento.valorLiquido)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FormaIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{formaMap[pagamento.forma as keyof typeof formaMap].label}</p>
                                <p className="text-xs text-muted-foreground">{pagamento.parcelas}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon className="h-4 w-4" />
                              <Badge variant={statusMap[pagamento.status as keyof typeof statusMap].color}>
                                {statusMap[pagamento.status as keyof typeof statusMap].label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatDateTime(pagamento.dataPagamento)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditarPagamento(pagamento)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {pagamento.status === 'pendente' && (
                                <Button variant="default" size="sm" onClick={() => handleConfirmarPagamento(pagamento.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Faturamento Bruto:</span>
                  <span className="font-medium">{formatPrice(2300.00)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Descontos:</span>
                  <span className="text-red-600">-{formatPrice(totalDescontos)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taxas:</span>
                  <span className="text-red-600">-{formatPrice(totalTaxas)}</span>
                </div>
                <div className="h-px bg-border"></div>
                <div className="flex justify-between items-center font-medium">
                  <span>Faturamento Líquido:</span>
                  <span className="text-green-600">{formatPrice(totalRecebido)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativo Mensal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Este Mês:</span>
                    <span className="font-medium">{formatPrice(totalRecebido)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mês Anterior:</span>
                    <span className="font-medium">{formatPrice(950.00)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-400 h-2 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <span className="text-sm text-green-600 font-medium">↗ +15% de crescimento</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(formaMap).map(([key, forma]) => {
              const pagamentosForma = mockPagamentos.filter(p => p.forma === key && p.status === 'pago');
              const totalForma = pagamentosForma.reduce((acc, p) => acc + p.valorLiquido, 0);
              const quantidadeForma = pagamentosForma.length;
              
              if (totalForma === 0) return null;
              
              return (
                <Card key={key}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{forma.label}</CardTitle>
                    <forma.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(totalForma)}</div>
                    <p className="text-xs text-muted-foreground">
                      {quantidadeForma} transação{quantidadeForma !== 1 ? 'ões' : ''}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}