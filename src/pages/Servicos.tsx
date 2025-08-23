import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const mockServicos = [
  {
    id: 1,
    nome: "Botox 30U",
    categoria: "Toxina Botulínica",
    duracaoMinutos: 45,
    precoBase: 500.00,
    exigeAvaliacaoPrevia: false,
    ativo: true,
    contraIndicacoes: "Gravidez, amamentação, alergia à toxina botulínica",
    cuidadosPre: "Não consumir álcool 24h antes, evitar anticoagulantes",
    cuidadosPos: "Não deitar por 4h, evitar atividade física intensa"
  },
  {
    id: 2,
    nome: "Harmonização Facial Completa",
    categoria: "Preenchimento",
    duracaoMinutos: 120,
    precoBase: 1200.00,
    exigeAvaliacaoPrevia: true,
    ativo: true,
    contraIndicacoes: "Gravidez, processos inflamatórios ativos, alergia ao ácido hialurônico",
    cuidadosPre: "Evitar antiinflamatórios, não consumir álcool",
    cuidadosPos: "Aplicar gelo, evitar maquiagem por 24h"
  },
  {
    id: 3,
    nome: "Preenchimento Labial",
    categoria: "Preenchimento", 
    duracaoMinutos: 60,
    precoBase: 800.00,
    exigeAvaliacaoPrevia: false,
    ativo: true,
    contraIndicacoes: "Herpes labial ativo, gravidez, amamentação",
    cuidadosPre: "Profilaxia para herpes se histórico positivo",
    cuidadosPos: "Evitar beijos, canudo e alimentos quentes por 48h"
  },
  {
    id: 4,
    nome: "Rinomodelação",
    categoria: "Preenchimento",
    duracaoMinutos: 90,
    precoBase: 1000.00,
    exigeAvaliacaoPrevia: true,
    ativo: true,
    contraIndicacoes: "Cirurgia nasal prévia, processos infecciosos",
    cuidadosPre: "Avaliação médica obrigatória, exames se necessário",
    cuidadosPos: "Evitar trauma, não usar óculos por 48h"
  },
  {
    id: 5,
    nome: "Avaliação Inicial",
    categoria: "Avaliação",
    duracaoMinutos: 30,
    precoBase: 0.00,
    exigeAvaliacaoPrevia: false,
    ativo: true,
    contraIndicacoes: "Nenhuma",
    cuidadosPre: "Vir sem maquiagem",
    cuidadosPos: "Seguir orientações médicas"
  }
];

const categorias = ["Todas", "Toxina Botulínica", "Preenchimento", "Avaliação", "Peeling", "Skinbooster"];

export default function Servicos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    duracao: "",
    preco: "",
    exigeAvaliacao: false,
    contraIndicacoes: "",
    cuidadosPre: "",
    cuidadosPos: ""
  });
  const { toast } = useToast();
  
  const filteredServicos = mockServicos.filter(servico => {
    const matchSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servico.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = selectedCategoria === "Todas" || servico.categoria === selectedCategoria;
    return matchSearch && matchCategoria;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim() || !formData.categoria || !formData.duracao || !formData.preco) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Sucesso",
      description: "Serviço cadastrado com sucesso!",
    });
    
    setFormData({
      nome: "",
      categoria: "",
      duracao: "",
      preco: "",
      exigeAvaliacao: false,
      contraIndicacoes: "",
      cuidadosPre: "",
      cuidadosPos: ""
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o catálogo de procedimentos da clínica
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Serviço</DialogTitle>
              <DialogDescription>
                Adicione um novo procedimento ao catálogo de serviços
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Serviço *</label>
                  <Input 
                    placeholder="Ex: Botox 30U"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Categoria *</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Toxina Botulínica">Toxina Botulínica</option>
                    <option value="Preenchimento">Preenchimento</option>
                    <option value="Avaliação">Avaliação</option>
                    <option value="Peeling">Peeling</option>
                    <option value="Skinbooster">Skinbooster</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duração (minutos) *</label>
                  <Input 
                    type="number" 
                    placeholder="60"
                    value={formData.duracao}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracao: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preço Base (R$) *</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="500.00"
                    value={formData.preco}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="avaliacao-previa"
                    checked={formData.exigeAvaliacao}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, exigeAvaliacao: checked as boolean }))
                    }
                  />
                  <label htmlFor="avaliacao-previa" className="text-sm font-medium cursor-pointer">
                    Exige avaliação prévia
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Marque se o procedimento requer uma consulta de avaliação antes do agendamento
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraindicações</label>
                  <Textarea 
                    placeholder="Liste as principais contraindicações do procedimento..."
                    rows={3}
                    value={formData.contraIndicacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, contraIndicacoes: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cuidados Pré-Procedimento</label>
                  <Textarea 
                    placeholder="Orientações para antes do procedimento..."
                    rows={3}
                    value={formData.cuidadosPre}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuidadosPre: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cuidados Pós-Procedimento</label>
                  <Textarea 
                    placeholder="Orientações para após o procedimento..."
                    rows={3}
                    value={formData.cuidadosPos}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuidadosPos: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Salvar Serviço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Catálogo de Serviços</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <select 
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar serviços..."
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
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Requisitos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServicos.map((servico) => (
                  <TableRow key={servico.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{servico.nome}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{servico.categoria}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{servico.duracaoMinutos} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatPrice(servico.precoBase)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {servico.exigeAvaliacaoPrevia ? (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Avaliação prévia</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Agendamento direto</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={servico.ativo ? "default" : "secondary"}>
                        {servico.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm">
                          {servico.ativo ? "Desativar" : "Ativar"}
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

      {/* Cards com detalhes dos serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServicos.slice(0, 6).map(servico => (
          <Card key={servico.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{servico.nome}</CardTitle>
                  <Badge variant="outline" className="mt-1">{servico.categoria}</Badge>
                </div>
                <Badge variant={servico.ativo ? "default" : "secondary"}>
                  {servico.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{servico.duracaoMinutos} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatPrice(servico.precoBase)}</span>
                  </div>
                </div>

                {servico.exigeAvaliacaoPrevia && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Requer avaliação prévia</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cuidados Pós-Procedimento</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {servico.cuidadosPos}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm">
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}