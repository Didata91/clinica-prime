import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, UserCheck, Clock, Calendar } from "lucide-react";
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

const mockProfissionais = [
  {
    id: 1,
    nome: "Dra. Maria Santos",
    conselhoRegistro: "CRM-SP 123456",
    especialidades: ["Toxina Botulínica", "Preenchimento", "Harmonização Facial"],
    email: "maria.santos@clinica.com",
    telefone: "(11) 99999-1111",
    ativo: true,
    agendamentosHoje: 6,
    horariosAtendimento: {
      segunda: "08:00-18:00",
      terca: "08:00-18:00", 
      quarta: "08:00-18:00",
      quinta: "08:00-18:00",
      sexta: "08:00-16:00",
      sabado: "08:00-12:00"
    }
  },
  {
    id: 2,
    nome: "Dra. Carla Lima",
    conselhoRegistro: "CRM-SP 789012",
    especialidades: ["Rinomodelação", "Skinbooster", "Peeling"],
    email: "carla.lima@clinica.com", 
    telefone: "(11) 99999-2222",
    ativo: true,
    agendamentosHoje: 4,
    horariosAtendimento: {
      segunda: "09:00-17:00",
      terca: "09:00-17:00",
      quarta: "09:00-17:00", 
      quinta: "09:00-17:00",
      sexta: "09:00-15:00",
      sabado: "Não atende"
    }
  }
];

const especialidadesDisponiveis = [
  "Toxina Botulínica",
  "Preenchimento", 
  "Harmonização Facial",
  "Rinomodelação",
  "Skinbooster",
  "Peeling",
  "Microagulhamento"
];

export default function Profissionais() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProfissionais = mockProfissionais.filter(profissional =>
    profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.conselhoRegistro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.especialidades.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a equipe médica da clínica
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Profissional</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <Input placeholder="Dr(a). Nome Completo" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registro Conselho</label>
                  <Input placeholder="CRM-SP 123456" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="email@clinica.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input placeholder="(11) 99999-9999" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {especialidadesDisponiveis.map(especialidade => (
                    <label key={especialidade} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{especialidade}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Horários de Atendimento</h3>
                <div className="grid grid-cols-1 gap-3">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map(dia => (
                    <div key={dia} className="flex items-center gap-4">
                      <div className="w-20 text-sm">{dia}</div>
                      <Input type="time" className="w-24" placeholder="08:00" />
                      <span className="text-sm">às</span>
                      <Input type="time" className="w-24" placeholder="18:00" />
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        <span className="text-sm">Não atende</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button>Salvar Profissional</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Profissionais</CardTitle>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, registro ou especialidade..."
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
                  <TableHead>Profissional</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead>Agenda Hoje</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfissionais.map((profissional) => (
                  <TableRow key={profissional.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profissional.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {profissional.conselhoRegistro}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {profissional.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {profissional.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {profissional.telefone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {profissional.especialidades.slice(0, 2).map(esp => (
                          <Badge key={esp} variant="secondary" className="text-xs">
                            {esp}
                          </Badge>
                        ))}
                        {profissional.especialidades.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{profissional.especialidades.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profissional.agendamentosHoje} agendamentos</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profissional.ativo ? "default" : "secondary"}>
                        {profissional.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Clock className="h-3 w-3 mr-1" />
                          Agenda
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

      {/* Cards com resumo dos profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfissionais.map(profissional => (
          <Card key={profissional.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{profissional.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">{profissional.conselhoRegistro}</p>
                </div>
                <Badge variant={profissional.ativo ? "default" : "secondary"}>
                  {profissional.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-1">
                    {profissional.especialidades.map(esp => (
                      <Badge key={esp} variant="outline" className="text-xs">
                        {esp}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Agenda de Hoje</h4>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profissional.agendamentosHoje} pacientes agendados</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Ver Agenda
                  </Button>
                  <Button variant="ghost" size="sm">
                    Editar
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