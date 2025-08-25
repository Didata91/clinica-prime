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
  Download
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

const mockProntuarios = [
  {
    id: 1,
    clienteNome: "Ana Silva",
    clienteId: "C001",
    servico: "Botox 30U",
    profissional: "Dra. Maria Santos",
    dataAtendimento: "2024-01-15T14:30:00",
    status: "finalizado",
    produtosUtilizados: "Botox Allergan 100U - Lote ABC123",
    quantidadeUnidades: 30,
    observacoes: "Paciente respondeu bem ao procedimento. Aplicação na testa e região periocular.",
    anamnese: {
      medicamentos: "Nenhum",
      alergias: "Nenhuma conhecida", 
      historico: "Primeira aplicação de toxina botulínica",
      expectativas: "Redução de linhas de expressão"
    },
    fotosAntes: ["foto1.jpg", "foto2.jpg"],
    fotosDepois: [],
    assinaturaDigital: true,
    dataFinalizacao: "2024-01-15T15:15:00"
  },
  {
    id: 2,
    clienteNome: "Carla Oliveira", 
    clienteId: "C005",
    servico: "Harmonização Facial Completa",
    profissional: "Dra. Maria Santos",
    dataAtendimento: "2024-01-14T10:00:00",
    status: "em_andamento",
    produtosUtilizados: "Ácido Hialurônico Juvederm 2ml",
    quantidadeUnidades: 2,
    observacoes: "Sessão 1/2 da harmonização. Preenchimento de zigomático realizado.",
    anamnese: {
      medicamentos: "Anticoncepcional",
      alergias: "Nenhuma",
      historico: "Já fez preenchimento labial há 1 ano",
      expectativas: "Harmonização geral do rosto"
    },
    fotosAntes: ["foto3.jpg"],
    fotosDepois: [],
    assinaturaDigital: false,
    dataFinalizacao: null
  },
  {
    id: 3,
    clienteNome: "Beatriz Costa",
    clienteId: "C003",
    servico: "Preenchimento Labial", 
    profissional: "Dr. João Silva",
    dataAtendimento: "2024-01-13T16:00:00",
    status: "finalizado",
    produtosUtilizados: "Ácido Hialurônico Restylane 1ml",
    quantidadeUnidades: 1,
    observacoes: "Preenchimento sutil conforme solicitado. Excelente resultado.",
    anamnese: {
      medicamentos: "Vitamina D",
      alergias: "Nenhuma",
      historico: "Primeira vez fazendo preenchimento",
      expectativas: "Lábios mais definidos e volumosos"
    },
    fotosAntes: ["foto4.jpg"],
    fotosDepois: ["foto5.jpg"],
    assinaturaDigital: true,
    dataFinalizacao: "2024-01-13T17:30:00"
  }
];

const statusMap = {
  finalizado: { label: "Finalizado", color: "default" as const },
  em_andamento: { label: "Em Andamento", color: "secondary" as const },
  pendente: { label: "Pendente", color: "outline" as const }
};

export default function Prontuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todos");
  const [selectedProntuario, setSelectedProntuario] = useState<any>(null);
  const [prontuarios, setProntuarios] = useState(mockProntuarios);
  const [isNewProntuarioOpen, setIsNewProntuarioOpen] = useState(false);
  const [novoProntuarioData, setNovoProntuarioData] = useState({
    cliente: "",
    servico: "",
    profissional: "",
    dataAtendimento: "",
    medicamentos: "",
    alergias: "",
    historico: "",
    expectativas: "",
    produtosUtilizados: "",
    quantidade: "",
    observacoes: ""
  });

  const filteredProntuarios = prontuarios.filter(prontuario => {
    const matchSearch = prontuario.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prontuario.servico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prontuario.clienteId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "todos" || prontuario.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const { toast } = useToast();

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleSaveProntuario = (status: 'rascunho' | 'finalizado') => {
    if (!novoProntuarioData.cliente || !novoProntuarioData.servico || !novoProntuarioData.profissional || !novoProntuarioData.dataAtendimento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const novoProntuario = {
      id: prontuarios.length + 1,
      clienteNome: novoProntuarioData.cliente,
      clienteId: `C${String(prontuarios.length + 1).padStart(3, '0')}`,
      servico: novoProntuarioData.servico,
      profissional: novoProntuarioData.profissional,
      dataAtendimento: novoProntuarioData.dataAtendimento,
      status: status === 'finalizado' ? 'finalizado' : 'em_andamento',
      produtosUtilizados: novoProntuarioData.produtosUtilizados,
      quantidadeUnidades: parseInt(novoProntuarioData.quantidade) || 0,
      observacoes: novoProntuarioData.observacoes,
      anamnese: {
        medicamentos: novoProntuarioData.medicamentos,
        alergias: novoProntuarioData.alergias,
        historico: novoProntuarioData.historico,
        expectativas: novoProntuarioData.expectativas
      },
      fotosAntes: [],
      fotosDepois: [],
      assinaturaDigital: status === 'finalizado',
      dataFinalizacao: status === 'finalizado' ? new Date().toISOString() : null
    };

    setProntuarios([...prontuarios, novoProntuario]);
    toast({
      title: "Sucesso",
      description: `Prontuário ${status === 'finalizado' ? 'finalizado' : 'salvo como rascunho'} com sucesso!`,
    });

    setNovoProntuarioData({
      cliente: "",
      servico: "",
      profissional: "",
      dataAtendimento: "",
      medicamentos: "",
      alergias: "",
      historico: "",
      expectativas: "",
      produtosUtilizados: "",
      quantidade: "",
      observacoes: ""
    });
    setIsNewProntuarioOpen(false);
  };

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
            
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
                <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
                <TabsTrigger value="procedimento">Procedimento</TabsTrigger>
                <TabsTrigger value="fotos">Fotos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dados" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente *</label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={novoProntuarioData.cliente}
                      onChange={(e) => setNovoProntuarioData({...novoProntuarioData, cliente: e.target.value})}
                    >
                      <option value="">Selecione o cliente</option>
                      <option value="Ana Silva">Ana Silva</option>
                      <option value="Beatriz Costa">Beatriz Costa</option>
                      <option value="Carla Oliveira">Carla Oliveira</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Serviço *</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="">Selecione o serviço</option>
                      <option value="botox">Botox 30U</option>
                      <option value="preenchimento">Preenchimento Labial</option>
                      <option value="harmonizacao">Harmonização Facial</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profissional *</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="">Selecione o profissional</option>
                      <option value="dra-maria">Dra. Maria Santos</option>
                      <option value="dr-joao">Dr. João Silva</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data/Hora do Atendimento *</label>
                    <Input type="datetime-local" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="anamnese" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Medicamentos em uso</label>
                    <Textarea placeholder="Liste os medicamentos que o paciente está utilizando..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alergias conhecidas</label>
                    <Textarea placeholder="Descreva alergias ou reações conhecidas..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Histórico de procedimentos</label>
                    <Textarea placeholder="Histórico de procedimentos estéticos anteriores..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expectativas do cliente</label>
                    <Textarea placeholder="Objetivos e expectativas com o procedimento..." />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="procedimento" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Produtos utilizados</label>
                      <Input placeholder="Ex: Botox Allergan 100U - Lote ABC123" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantidade (unidades/ml)</label>
                      <Input type="number" placeholder="30" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações do procedimento</label>
                    <Textarea 
                      placeholder="Descreva o procedimento realizado, técnicas utilizadas, intercorrências..." 
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fotos" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Fotos Antes</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Clique para adicionar fotos do antes
                      </p>
                      <Button variant="outline" className="mt-2">
                        Selecionar Fotos
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-medium">Fotos Depois</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Clique para adicionar fotos do depois
                      </p>
                      <Button variant="outline" className="mt-2">
                        Selecionar Fotos
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => handleSaveProntuario('rascunho')}>Salvar Rascunho</Button>
              <Button onClick={() => handleSaveProntuario('finalizado')}>Finalizar Prontuário</Button>
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
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12 este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98</div>
            <p className="text-xs text-muted-foreground">77% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">14% do total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">11</div>
            <p className="text-xs text-muted-foreground">9% do total</p>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProntuarios.map((prontuario) => (
                  <TableRow key={prontuario.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{prontuario.clienteNome}</p>
                          <p className="text-xs text-muted-foreground">{prontuario.clienteId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{prontuario.servico}</TableCell>
                    <TableCell>{prontuario.profissional}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(prontuario.dataAtendimento)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[prontuario.status as keyof typeof statusMap].color}>
                        {statusMap[prontuario.status as keyof typeof statusMap].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedProntuario(prontuario)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar prontuário */}
      <Dialog open={!!selectedProntuario} onOpenChange={() => setSelectedProntuario(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProntuario && (
            <>
              <DialogHeader>
                <DialogTitle>Prontuário - {selectedProntuario.clienteNome}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Dados do Atendimento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Cliente:</p>
                        <p className="text-sm text-muted-foreground">{selectedProntuario.clienteNome} ({selectedProntuario.clienteId})</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Serviço:</p>
                        <p className="text-sm text-muted-foreground">{selectedProntuario.servico}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Profissional:</p>
                        <p className="text-sm text-muted-foreground">{selectedProntuario.profissional}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Data do Atendimento:</p>
                        <p className="text-sm text-muted-foreground">{formatDateTime(selectedProntuario.dataAtendimento)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Anamnese</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Medicamentos:</p>
                        <p className="text-sm text-muted-foreground">{selectedProntuario.anamnese.medicamentos}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Alergias:</p>
                        <p className="text-sm text-muted-foreground">{selectedProntuario.anamnese.alergias}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Histórico:</p>
                        <p className="text-sm text-muted-foreground">{selectedProntuario.anamnese.historico}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Procedimento Realizado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Produtos Utilizados:</p>
                      <p className="text-sm text-muted-foreground">{selectedProntuario.produtosUtilizados}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quantidade:</p>
                      <p className="text-sm text-muted-foreground">{selectedProntuario.quantidadeUnidades} unidades</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Observações:</p>
                      <p className="text-sm text-muted-foreground">{selectedProntuario.observacoes}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fotos Antes ({selectedProntuario.fotosAntes.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProntuario.fotosAntes.map((foto: string, index: number) => (
                          <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                            <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="text-xs text-muted-foreground mt-1">{foto}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fotos Depois ({selectedProntuario.fotosDepois.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProntuario.fotosDepois.length > 0 ? (
                          selectedProntuario.fotosDepois.map((foto: string, index: number) => (
                            <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                              <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                              <p className="text-xs text-muted-foreground mt-1">{foto}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground col-span-2 text-center py-4">
                            Ainda não há fotos pós-procedimento
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}