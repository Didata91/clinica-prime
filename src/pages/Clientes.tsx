import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, Calendar, UserCheck, AlertCircle } from "lucide-react";
import { useClientes, Cliente } from "@/hooks/useClientes";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useProfissionais } from "@/hooks/useProfissionais";
import { useServicos } from "@/hooks/useServicos";
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

export default function Clientes() {
  const { clientes, loading, createCliente, updateCliente } = useClientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAgendarDialogOpen, setIsAgendarDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: "",
    telefone: "",
    email: "",
    data_nascimento: "",
    cpf_cnpj: "",
    sexo: "",
    consentimento_lgpd: false,
  });
  
  const filteredClientes = clientes.filter(cliente =>
    cliente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome_completo.trim() || !formData.telefone.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createCliente({
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''), // Remove non-digits
        consentimento_lgpd: formData.consentimento_lgpd,
      });
      
      setFormData({
        nome_completo: "",
        telefone: "",
        email: "",
        data_nascimento: "",
        cpf_cnpj: "",
        sexo: "",
        consentimento_lgpd: false,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome_completo: cliente.nome_completo || "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      data_nascimento: cliente.data_nascimento || "",
      cpf_cnpj: cliente.cpf_cnpj || "",
      sexo: cliente.sexo || "",
      consentimento_lgpd: cliente.consentimento_lgpd || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCliente || !formData.nome_completo.trim() || !formData.telefone.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCliente(editingCliente.id, {
        ...formData,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''), // Remove non-digits
      });
      
      setIsEditDialogOpen(false);
      setEditingCliente(null);
      setFormData({
        nome_completo: "",
        telefone: "",
        email: "",
        data_nascimento: "",
        cpf_cnpj: "",
        sexo: "",
        consentimento_lgpd: false,
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgendar = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsAgendarDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o cadastro dos seus pacientes
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <Input 
                    placeholder="Digite o nome completo" 
                    value={formData.nome_completo}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone *</label>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="email@exemplo.com" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Nascimento</label>
                  <Input 
                    type="date" 
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CPF/CNPJ</label>
                  <Input 
                    placeholder="000.000.000-00" 
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sexo</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={formData.sexo}
                    onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value }))}
                  >
                    <option value="">Selecione</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro</option>
                    <option value="nao_informar">Não informar</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                 <Button 
                   type="submit" 
                   disabled={isSubmitting}
                 >
                   {isSubmitting ? "Salvando..." : "Salvar Cliente"}
                 </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Informações</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cliente.nome_completo}</p>
                        <p className="text-sm text-muted-foreground">
                          {cliente.sexo && `${cliente.sexo} • `}
                          {cliente.data_nascimento && `${new Date().getFullYear() - new Date(cliente.data_nascimento).getFullYear()} anos`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {cliente.telefone}
                        </div>
                        {cliente.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {cliente.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cliente.alergias && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-sm text-red-600">Alergias</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Cadastrado: {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Cliente ativo</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={cliente.consentimento_lgpd ? "default" : "destructive"}>
                          {cliente.consentimento_lgpd ? "LGPD OK" : "Pendente LGPD"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleAgendar(cliente)}
                         >
                           <Calendar className="h-3 w-3 mr-1" />
                           Agendar
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm"
                           onClick={() => handleEdit(cliente)}
                         >
                           Editar
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

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input 
                  placeholder="Digite o nome completo" 
                  value={formData.nome_completo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input 
                  placeholder="(11) 99999-9999" 
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Nascimento</label>
                <Input 
                  type="date" 
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CPF/CNPJ</label>
                <Input 
                  placeholder="000.000.000-00" 
                  value={formData.cpf_cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={formData.sexo}
                  onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value }))}
                >
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informar">Não informar</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Agendamento */}
      <AgendarDialog 
        open={isAgendarDialogOpen}
        onOpenChange={setIsAgendarDialogOpen}
        cliente={selectedCliente}
      />
    </div>
  );
}

// Componente para Dialog de Agendamento
interface AgendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
}

function AgendarDialog({ open, onOpenChange, cliente }: AgendarDialogProps) {
  const { createAgendamento } = useAgendamentos();
  const { profissionais } = useProfissionais();
  const { servicos } = useServicos();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState({
    profissional_id: "",
    servico_id: "",
    data_hora_inicio: "",
    data_hora_fim: "",
  });

  const handleCreateAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cliente || !agendamentoData.profissional_id || !agendamentoData.servico_id || !agendamentoData.data_hora_inicio) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createAgendamento({
        cliente_id: cliente.id,
        profissional_id: agendamentoData.profissional_id,
        servico_id: agendamentoData.servico_id,
        data_hora_inicio: agendamentoData.data_hora_inicio,
        data_hora_fim: agendamentoData.data_hora_fim,
        status: 'solicitado',
        origem: 'recepcao',
        politica_cancelamento_aceita: false
      });
      
      setAgendamentoData({
        profissional_id: "",
        servico_id: "",
        data_hora_inicio: "",
        data_hora_fim: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Agendar para {cliente?.nome_completo}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateAgendamento}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Profissional *</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={agendamentoData.profissional_id}
                onChange={(e) => setAgendamentoData(prev => ({ ...prev, profissional_id: e.target.value }))}
                required
              >
                <option value="">Selecione um profissional</option>
                {profissionais.map(profissional => (
                  <option key={profissional.id} value={profissional.id}>
                    {profissional.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Serviço *</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={agendamentoData.servico_id}
                onChange={(e) => setAgendamentoData(prev => ({ ...prev, servico_id: e.target.value }))}
                required
              >
                <option value="">Selecione um serviço</option>
                {servicos.map(servico => (
                  <option key={servico.id} value={servico.id}>
                    {servico.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Data e Hora *</label>
              <Input 
                type="datetime-local" 
                value={agendamentoData.data_hora_inicio}
                onChange={(e) => {
                  const inicio = e.target.value;
                  const servico = servicos.find(s => s.id === agendamentoData.servico_id);
                  let fim = "";
                  if (inicio && servico) {
                    const inicioDate = new Date(inicio);
                    inicioDate.setMinutes(inicioDate.getMinutes() + servico.duracao_minutos);
                    fim = inicioDate.toISOString().slice(0, 16);
                  }
                  setAgendamentoData(prev => ({ 
                    ...prev, 
                    data_hora_inicio: inicio,
                    data_hora_fim: fim
                  }));
                }}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}