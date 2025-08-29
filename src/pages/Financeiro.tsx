import React, { useState } from "react";
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
  Check,
  Loader2
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
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useClientes } from "@/hooks/useClientes";
import { useServicos } from "@/hooks/useServicos";

const statusMap = {
  pago: { label: "Pago", color: "default" as const, icon: CheckCircle },
  pendente: { label: "Pendente", color: "secondary" as const, icon: Clock },
  estornado: { label: "Estornado", color: "destructive" as const, icon: AlertTriangle },
};

const formaMap = {
  cartao: { label: "Cartão", icon: CreditCard },
  pix: { label: "PIX", icon: Banknote },
  dinheiro: { label: "Dinheiro", icon: Banknote },
  transferencia: { label: "Transferência", icon: PiggyBank }
};

export default function Financeiro() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedPeriodo, setSelectedPeriodo] = useState("mes_atual");
  const [isRegistrarPagamentoOpen, setIsRegistrarPagamentoOpen] = useState(false);
  const [isEditando, setIsEditando] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<any>(null);
  const [novoPagamentoData, setNovoPagamentoData] = useState({
    agendamento_id: "",
    valor: "",
    forma: "",
    parcelas: "1",
    observacoes: ""
  });

  const { pagamentos, stats, loading: financeiroLoading, confirmarPagamento } = useFinanceiro();
  const { clientes, loading: clientesLoading } = useClientes();
  const { servicos, loading: servicosLoading } = useServicos();

  const { toast } = useToast();

  const loading = financeiroLoading || clientesLoading || servicosLoading;

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

  const handleConfirmarPagamento = async (id: string) => {
    try {
      await confirmarPagamento(id);
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  const exportarExcel = () => {
    const dadosExport = filteredPagamentos.map(p => ({
      'Cliente': p.clienteNome,
      'Serviço': p.servico,
      'Valor': p.valor,
      'Forma Pagamento': formaMap[p.forma as keyof typeof formaMap]?.label || p.forma,
      'Status': statusMap[p.status as keyof typeof statusMap]?.label || p.status,
      'Data Pagamento': p.dataPagamento ? new Date(p.dataPagamento).toLocaleDateString('pt-BR') : '-',
      'Observações': p.observacoes || ''
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

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
          <Dialog open={isRegistrarPagamentoOpen} onOpenChange={setIsRegistrarPagamentoOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsRegistrarPagamentoOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Registrar Novo Pagamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Funcionalidade em desenvolvimento. Use o sistema de agendamentos para gerar pagamentos automaticamente.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.totalRecebido)}
            </div>
            <p className="text-xs text-muted-foreground">pagamentos confirmados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatPrice(stats.totalPendente)}
            </div>
            <p className="text-xs text-muted-foreground">aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pagamentos.length}</div>
            <p className="text-xs text-muted-foreground">registros de pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {pagamentos.length > 0 ? formatPrice(stats.totalRecebido / pagamentos.filter(p => p.status === 'pago').length || 1) : formatPrice(0)}
            </div>
            <p className="text-xs text-muted-foreground">valor médio por pagamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Pagamentos</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="todos">Todos os Status</option>
                <option value="pago">Pagos</option>
                <option value="pendente">Pendentes</option>
                <option value="estornado">Estornados</option>
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
          {filteredPagamentos.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {pagamentos.length === 0 
                  ? "Nenhum pagamento registrado" 
                  : "Nenhum pagamento encontrado com os filtros aplicados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Forma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPagamentos.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell className="font-medium">{pagamento.clienteNome}</TableCell>
                      <TableCell>{pagamento.servico}</TableCell>
                      <TableCell>{formatPrice(pagamento.valor)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {React.createElement(formaMap[pagamento.forma as keyof typeof formaMap]?.icon || CreditCard, { 
                            className: "h-4 w-4" 
                          })}
                          <span>{formaMap[pagamento.forma as keyof typeof formaMap]?.label || pagamento.forma}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[pagamento.status as keyof typeof statusMap]?.color || "outline"}>
                          {statusMap[pagamento.status as keyof typeof statusMap]?.label || pagamento.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(pagamento.dataPagamento)}</TableCell>
                      <TableCell>
                        {pagamento.status === 'pendente' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirmarPagamento(pagamento.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}