import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Phone, Mail, Calendar, UserCheck, AlertCircle } from "lucide-react";
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

const mockClientes = [
  {
    id: 1,
    nomeCompleto: "Ana Silva Santos",
    telefone: "(11) 99999-9999",
    email: "ana.silva@email.com",
    dataNascimento: "1985-05-15",
    sexo: "feminino",
    alergias: "Ácido hialurônico",
    ultimoAtendimento: "2024-01-15",
    totalAtendimentos: 8,
    consentimentoLGPD: true
  },
  {
    id: 2,
    nomeCompleto: "João Santos Lima", 
    telefone: "(11) 88888-8888",
    email: "joao.santos@email.com",
    dataNascimento: "1990-08-22",
    sexo: "masculino",
    alergias: null,
    ultimoAtendimento: "2024-01-10",
    totalAtendimentos: 3,
    consentimentoLGPD: true
  },
  {
    id: 3,
    nomeCompleto: "Maria Oliveira Costa",
    telefone: "(11) 77777-7777", 
    email: "maria.oliveira@email.com",
    dataNascimento: "1978-12-03",
    sexo: "feminino",
    alergias: "Lidocaína",
    ultimoAtendimento: "2024-01-20",
    totalAtendimentos: 15,
    consentimentoLGPD: false
  }
];

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredClientes = mockClientes.filter(cliente =>
    cliente.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie o cadastro dos seus pacientes
          </p>
        </div>
        
        <Dialog>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome Completo *</label>
                <Input placeholder="Digite o nome completo" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone *</label>
                <Input placeholder="(11) 99999-9999" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Nascimento</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CPF/CNPJ</label>
                <Input placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sexo</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informar">Não informar</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Cliente</Button>
            </div>
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
                        <p className="font-medium">{cliente.nomeCompleto}</p>
                        <p className="text-sm text-muted-foreground">
                          {cliente.sexo} • {new Date().getFullYear() - new Date(cliente.dataNascimento).getFullYear()} anos
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
                          Último: {new Date(cliente.ultimoAtendimento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{cliente.totalAtendimentos} atendimentos</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={cliente.consentimentoLGPD ? "default" : "destructive"}>
                          {cliente.consentimentoLGPD ? "LGPD OK" : "Pendente LGPD"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          Agendar
                        </Button>
                        <Button variant="ghost" size="sm">
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
    </div>
  );
}