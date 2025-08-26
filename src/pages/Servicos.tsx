import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useServicos } from "@/hooks/useServicos";
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

const categorias = ["Todas", "toxina_botulinica", "preenchimento", "avaliacao", "peeling", "skinbooster"];

export default function Servicos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<any>(null);
  const { servicos, loading, createServico, updateServico } = useServicos();
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    duracao_minutos: "",
    preco_base: "",
    exige_avaliacao_previa: false,
    contra_indicacoes: "",
    cuidados_pre: "",
    cuidados_pos: ""
  });
  const { toast } = useToast();
  
  const filteredServicos = servicos.filter(servico => {
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

  const handleSubmit = async () => {
    if (!formData.nome.trim() || !formData.categoria || !formData.duracao_minutos || !formData.preco_base) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const servicoData = {
        nome: formData.nome,
        categoria: formData.categoria as any,
        duracao_minutos: parseInt(formData.duracao_minutos),
        preco_base: parseFloat(formData.preco_base),
        exige_avaliacao_previa: formData.exige_avaliacao_previa,
        ativo: true,
        contra_indicacoes: formData.contra_indicacoes,
        cuidados_pre: formData.cuidados_pre,
        cuidados_pos: formData.cuidados_pos
      };

      if (editingServico) {
        await updateServico(editingServico.id, servicoData);
      } else {
        await createServico(servicoData);
      }
      
      setFormData({
        nome: "",
        categoria: "",
        duracao_minutos: "",
        preco_base: "",
        exige_avaliacao_previa: false,
        contra_indicacoes: "",
        cuidados_pre: "",
        cuidados_pos: ""
      });
      setEditingServico(null);
      setIsDialogOpen(false);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleEdit = (servico: any) => {
    setEditingServico(servico);
    setFormData({
      nome: servico.nome,
      categoria: servico.categoria,
      duracao_minutos: servico.duracao_minutos.toString(),
      preco_base: servico.preco_base.toString(),
      exige_avaliacao_previa: servico.exige_avaliacao_previa,
      contra_indicacoes: servico.contra_indicacoes || "",
      cuidados_pre: servico.cuidados_pre || "",
      cuidados_pos: servico.cuidados_pos || ""
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Serviços</h1>
            <p className="text-muted-foreground mt-2">Carregando serviços...</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleServicoStatus = async (servicoId: string) => {
    try {
      const servico = servicos.find(s => s.id === servicoId);
      if (servico) {
        await updateServico(servicoId, { ativo: !servico.ativo });
      }
    } catch (error) {
      // Error already handled by hook
    }
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
              <DialogTitle>{editingServico ? "Editar Serviço" : "Cadastrar Novo Serviço"}</DialogTitle>
              <DialogDescription>
                {editingServico ? "Atualize as informações do serviço" : "Adicione um novo procedimento ao catálogo de serviços"}
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
                    <option value="toxina_botulinica">Toxina Botulínica</option>
                    <option value="preenchimento">Preenchimento</option>
                    <option value="avaliacao">Avaliação</option>
                    <option value="peeling">Peeling</option>
                    <option value="skinbooster">Skinbooster</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duração (minutos) *</label>
                  <Input 
                    type="number" 
                    placeholder="60"
                    value={formData.duracao_minutos}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracao_minutos: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preço Base (R$) *</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="500.00"
                    value={formData.preco_base}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco_base: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="avaliacao-previa"
                    checked={formData.exige_avaliacao_previa}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, exige_avaliacao_previa: checked as boolean }))
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
                    value={formData.contra_indicacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, contra_indicacoes: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cuidados Pré-Procedimento</label>
                  <Textarea 
                    placeholder="Orientações para antes do procedimento..."
                    rows={3}
                    value={formData.cuidados_pre}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuidados_pre: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cuidados Pós-Procedimento</label>
                  <Textarea 
                    placeholder="Orientações para após o procedimento..."
                    rows={3}
                    value={formData.cuidados_pos}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuidados_pos: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingServico(null);
                setFormData({
                  nome: "",
                  categoria: "",
                  duracao_minutos: "",
                  preco_base: "",
                  exige_avaliacao_previa: false,
                  contra_indicacoes: "",
                  cuidados_pre: "",
                  cuidados_pos: ""
                });
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingServico ? "Atualizar Serviço" : "Salvar Serviço"}
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
                        <span>{servico.duracao_minutos} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatPrice(servico.preco_base)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {servico.exige_avaliacao_previa ? (
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
                        <Button variant="outline" size="sm" onClick={() => handleEdit(servico)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleServicoStatus(servico.id)}>
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
                    <span className="text-sm">{servico.duracao_minutos} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{formatPrice(servico.preco_base)}</span>
                  </div>
                </div>

                {servico.exige_avaliacao_previa && (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Requer avaliação prévia</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cuidados Pós-Procedimento</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {servico.cuidados_pos}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(servico)}>
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleServicoStatus(servico.id)}>
                    {servico.ativo ? "Desativar" : "Ativar"}
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