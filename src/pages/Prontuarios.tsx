import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Plus, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  Image as ImageIcon,
  Download,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useProntuarios } from "@/hooks/useProntuarios";
import { useClientes } from "@/hooks/useClientes";
import { useProfissionais } from "@/hooks/useProfissionais";
import { useServicos } from "@/hooks/useServicos";

const statusMap = {
  finalizado: { label: "Finalizado", color: "default" as const },
  em_andamento: { label: "Em Andamento", color: "secondary" as const },
  pendente: { label: "Pendente", color: "outline" as const }
};

export default function Prontuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedProntuario, setSelectedProntuario] = useState<any>(null);
  const [isNewProntuarioOpen, setIsNewProntuarioOpen] = useState(false);
  const [novoProntuarioData, setNovoProntuarioData] = useState({
    agendamento_id: "",
    medicamentos: "",
    alergias: "",
    historico: "",
    expectativas: "",
    produtos_utilizados: "",
    quantidade_unidades: "",
    observacoes: ""
  });

  const { prontuarios, stats, loading: prontuariosLoading } = useProntuarios();
  const { clientes, loading: clientesLoading } = useClientes();
  const { profissionais, loading: profissionaisLoading } = useProfissionais();
  const { servicos, loading: servicosLoading } = useServicos();
  
  const { toast } = useToast();

  const loading = prontuariosLoading || clientesLoading || profissionaisLoading || servicosLoading;

  const filteredProntuarios = prontuarios.filter(prontuario => {
    const matchSearch = prontuario.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prontuario.servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prontuario.clienteId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "todos" || prontuario.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando prontuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os prontuários médicos e registros de procedimentos
          </p>
        </div>
        
        <Dialog open={isNewProntuarioOpen} onOpenChange={setIsNewProntuarioOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsNewProntuarioOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prontuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Prontuário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente *</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={novoProntuarioData.agendamento_id}
                    onChange={(e) => setNovoProntuarioData({...novoProntuarioData, agendamento_id: e.target.value})}
                  >
                    <option value="">Selecione o agendamento</option>
                    {/* Aqui deveríamos listar agendamentos disponíveis para criação de prontuário */}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Selecione um agendamento para criar o prontuário
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Medicamentos em uso</label>
                  <Textarea 
                    placeholder="Liste os medicamentos que o paciente está utilizando..."
                    value={novoProntuarioData.medicamentos}
                    onChange={(e) => setNovoProntuarioData({...novoProntuarioData, medicamentos: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alergias conhecidas</label>
                  <Textarea 
                    placeholder="Descreva alergias ou reações conhecidas..."
                    value={novoProntuarioData.alergias}
                    onChange={(e) => setNovoProntuarioData({...novoProntuarioData, alergias: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produtos utilizados</label>
                  <Input 
                    placeholder="Ex: Botox Allergan 100U - Lote ABC123"
                    value={novoProntuarioData.produtos_utilizados}
                    onChange={(e) => setNovoProntuarioData({...novoProntuarioData, produtos_utilizados: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantidade (unidades/ml)</label>
                  <Input 
                    type="number" 
                    placeholder="30"
                    value={novoProntuarioData.quantidade_unidades}
                    onChange={(e) => setNovoProntuarioData({...novoProntuarioData, quantidade_unidades: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observações do procedimento</label>
                  <Textarea 
                    placeholder="Descreva o procedimento realizado, técnicas utilizadas, intercorrências..." 
                    rows={4}
                    value={novoProntuarioData.observacoes}
                    onChange={(e) => setNovoProntuarioData({...novoProntuarioData, observacoes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsNewProntuarioOpen(false)}>
                  Cancelar
                </Button>
                <Button disabled>
                  Criar Prontuário
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Prontuários</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">prontuários registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.finalizados}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.finalizados / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emAndamento}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.emAndamento / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.pendentes / stats.total) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Prontuários</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="todos">Todos os Status</option>
                <option value="finalizado">Finalizados</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="pendente">Pendentes</option>
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
          {filteredProntuarios.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {prontuarios.length === 0 
                  ? "Nenhum prontuário cadastrado" 
                  : "Nenhum prontuário encontrado com os filtros aplicados"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Data Atendimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProntuarios.map((prontuario) => (
                    <TableRow key={prontuario.id}>
                      <TableCell className="font-medium">{prontuario.clienteNome}</TableCell>
                      <TableCell>{prontuario.servico}</TableCell>
                      <TableCell>{prontuario.profissional}</TableCell>
                      <TableCell>
                        {prontuario.dataAtendimento ? formatDateTime(prontuario.dataAtendimento) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[prontuario.status as keyof typeof statusMap]?.color || "outline"}>
                          {statusMap[prontuario.status as keyof typeof statusMap]?.label || prontuario.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedProntuario(prontuario)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedProntuario(prontuario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
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