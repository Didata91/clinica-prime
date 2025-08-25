import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, UserCheck, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Checkbox } from "@/components/ui/checkbox";

const mockProfissionaisInitial = [
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [profissionais, setProfissionais] = useState(mockProfissionaisInitial);
  const [formData, setFormData] = useState({
    nome: "",
    registro: "",
    email: "",
    telefone: "",
    especialidades: [] as string[],
    horarios: {
      segunda: { inicio: "", fim: "", naoAtende: false },
      terca: { inicio: "", fim: "", naoAtende: false },
      quarta: { inicio: "", fim: "", naoAtende: false },
      quinta: { inicio: "", fim: "", naoAtende: false },
      sexta: { inicio: "", fim: "", naoAtende: false },
      sabado: { inicio: "", fim: "", naoAtende: false },
      domingo: { inicio: "", fim: "", naoAtende: false }
    }
  });
  const { toast } = useToast();
  
  const filteredProfissionais = profissionais.filter(profissional =>
    profissional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.conselhoRegistro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profissional.especialidades.some(esp => esp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEspecialidadeChange = (especialidade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      especialidades: checked 
        ? [...prev.especialidades, especialidade]
        : prev.especialidades.filter(esp => esp !== especialidade)
    }));
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }
    
    const novoProfissional = {
      id: profissionais.length + 1,
      nome: formData.nome,
      conselhoRegistro: formData.registro,
      especialidades: formData.especialidades,
      email: formData.email,
      telefone: formData.telefone,
      ativo: true,
      agendamentosHoje: 0,
      horariosAtendimento: Object.entries(formData.horarios).reduce((acc, [dia, horario]) => {
        if (horario.naoAtende) {
          acc[dia] = "Não atende";
        } else if (horario.inicio && horario.fim) {
          acc[dia] = `${horario.inicio}-${horario.fim}`;
        }
        return acc;
      }, {} as any)
    };
    
    setProfissionais([...profissionais, novoProfissional]);
    
    toast({
      title: "Sucesso",
      description: "Profissional cadastrado com sucesso!",
    });
    
    setFormData({
      nome: "",
      registro: "",
      email: "",
      telefone: "",
      especialidades: [],
      horarios: {
        segunda: { inicio: "", fim: "", naoAtende: false },
        terca: { inicio: "", fim: "", naoAtende: false },
        quarta: { inicio: "", fim: "", naoAtende: false },
        quinta: { inicio: "", fim: "", naoAtende: false },
        sexta: { inicio: "", fim: "", naoAtende: false },
        sabado: { inicio: "", fim: "", naoAtende: false },
        domingo: { inicio: "", fim: "", naoAtende: false }
      }
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profissionais</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a equipe médica da clínica
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Profissional</DialogTitle>
              <DialogDescription>
                Adicione um novo profissional à equipe médica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <Input 
                    placeholder="Dr(a). Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Registro Conselho</label>
                  <Input 
                    placeholder="CRM-SP 123456"
                    value={formData.registro}
                    onChange={(e) => setFormData(prev => ({ ...prev, registro: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    placeholder="email@clinica.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input 
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {especialidadesDisponiveis.map(especialidade => (
                    <div key={especialidade} className="flex items-center space-x-2">
                      <Checkbox 
                        id={especialidade}
                        checked={formData.especialidades.includes(especialidade)}
                        onCheckedChange={(checked) => 
                          handleEspecialidadeChange(especialidade, checked as boolean)
                        }
                      />
                      <label htmlFor={especialidade} className="text-sm cursor-pointer">
                        {especialidade}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Horários de Atendimento</h3>
                <div className="grid grid-cols-1 gap-3">
                  {["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"].map((dia, index) => {
                    const diaLabel = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"][index];
                    return (
                      <div key={dia} className="flex items-center gap-4">
                        <div className="w-20 text-sm">{diaLabel}</div>
                        <Input 
                          type="time" 
                          className="w-24" 
                          placeholder="08:00"
                          value={formData.horarios[dia]?.inicio || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            horarios: {
                              ...prev.horarios,
                              [dia]: { ...prev.horarios[dia], inicio: e.target.value }
                            }
                          }))}
                          disabled={formData.horarios[dia]?.naoAtende || false}
                        />
                        <span className="text-sm">às</span>
                        <Input 
                          type="time" 
                          className="w-24" 
                          placeholder="18:00"
                          value={formData.horarios[dia]?.fim || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            horarios: {
                              ...prev.horarios,
                              [dia]: { ...prev.horarios[dia], fim: e.target.value }
                            }
                          }))}
                          disabled={formData.horarios[dia]?.naoAtende || false}
                        />
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={formData.horarios[dia]?.naoAtende || false}
                            onCheckedChange={(checked) => setFormData(prev => ({
                              ...prev,
                              horarios: {
                                ...prev.horarios,
                                [dia]: { ...prev.horarios[dia], naoAtende: checked as boolean }
                              }
                            }))}
                          />
                          <span className="text-sm">Não atende</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                Salvar Profissional
              </Button>
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