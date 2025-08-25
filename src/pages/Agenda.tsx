import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const mockAgendamentos = [
  {
    id: 1,
    data: "2024-01-22",
    horario: "09:00",
    cliente: "Ana Silva",
    servico: "Botox 30U",
    profissional: "Dra. Maria Santos",
    sala: "Sala 1",
    status: "confirmado",
    duracao: 45
  },
  {
    id: 2,
    data: "2024-01-22", 
    horario: "10:30",
    cliente: "João Santos",
    servico: "Harmonização Facial",
    profissional: "Dra. Carla Lima",
    sala: "Sala 2",
    status: "solicitado",
    duracao: 90
  },
  {
    id: 3,
    data: "2024-01-22",
    horario: "14:00",
    cliente: "Maria Oliveira",
    servico: "Preenchimento Labial", 
    profissional: "Dra. Maria Santos",
    sala: "Sala 1",
    status: "compareceu",
    duracao: 60
  },
  {
    id: 4,
    data: "2024-01-22",
    horario: "15:30",
    cliente: "Pedro Costa",
    servico: "Rinomodelação",
    profissional: "Dra. Carla Lima", 
    sala: "Sala 2",
    status: "confirmado",
    duracao: 75
  }
];

const horarios = Array.from({ length: 18 }, (_, i) => {
  const hour = Math.floor(8 + i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

const profissionais = ["Todas", "Dra. Maria Santos", "Dra. Carla Lima"];

const getStatusColor = (status: string) => {
  const colors = {
    confirmado: "bg-blue-100 text-blue-800 border-blue-200",
    solicitado: "bg-yellow-100 text-yellow-800 border-yellow-200",
    compareceu: "bg-green-100 text-green-800 border-green-200", 
    cancelado: "bg-red-100 text-red-800 border-red-200",
    faltou: "bg-gray-100 text-gray-800 border-gray-200"
  };
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
};

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date("2024-01-22"));
  const [selectedProfissional, setSelectedProfissional] = useState("Todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState({
    cliente: "",
    servico: "",
    profissional: "",
    sala: "",
    data: "",
    horario: ""
  });
  const [agendamentos, setAgendamentos] = useState(mockAgendamentos);
  const { toast } = useToast();

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const agendamentoDateStr = agendamento.data;
    const matchDate = agendamentoDateStr === currentDateStr;
    const matchProfissional = selectedProfissional === "Todas" || agendamento.profissional === selectedProfissional;
    return matchDate && matchProfissional;
  });

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os agendamentos da clínica
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Agende um novo atendimento para um cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente *</label>
                <Input 
                  placeholder="Buscar ou criar cliente..." 
                  value={agendamentoData.cliente}
                  onChange={(e) => setAgendamentoData({...agendamentoData, cliente: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Serviço *</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={agendamentoData.servico}
                  onChange={(e) => setAgendamentoData({...agendamentoData, servico: e.target.value})}
                >
                  <option value="">Selecione um serviço</option>
                  <option value="Botox 30U">Botox 30U</option>
                  <option value="Harmonização Facial">Harmonização Facial</option>
                  <option value="Preenchimento Labial">Preenchimento Labial</option>
                  <option value="Rinomodelação">Rinomodelação</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Profissional *</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={agendamentoData.profissional}
                  onChange={(e) => setAgendamentoData({...agendamentoData, profissional: e.target.value})}
                >
                  <option value="">Selecione um profissional</option>
                  <option value="Dra. Maria Santos">Dra. Maria Santos</option>
                  <option value="Dra. Carla Lima">Dra. Carla Lima</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sala</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={agendamentoData.sala}
                  onChange={(e) => setAgendamentoData({...agendamentoData, sala: e.target.value})}
                >
                  <option value="">Automática</option>
                  <option value="Sala 1">Sala 1</option>
                  <option value="Sala 2">Sala 2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data *</label>
                <Input 
                  type="date" 
                  value={agendamentoData.data}
                  onChange={(e) => setAgendamentoData({...agendamentoData, data: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Horário *</label>
                <Input 
                  type="time" 
                  value={agendamentoData.horario}
                  onChange={(e) => setAgendamentoData({...agendamentoData, horario: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                if (!agendamentoData.cliente || !agendamentoData.servico || !agendamentoData.profissional || !agendamentoData.data || !agendamentoData.horario) {
                  toast({
                    title: "Erro",
                    description: "Preencha todos os campos obrigatórios",
                    variant: "destructive",
                  });
                  return;
                }
                const novoAgendamento = {
                  id: agendamentos.length + 1,
                  data: agendamentoData.data,
                  horario: agendamentoData.horario,
                  cliente: agendamentoData.cliente,
                  servico: agendamentoData.servico,
                  profissional: agendamentoData.profissional,
                  sala: agendamentoData.sala || "Automática",
                  status: "solicitado",
                  duracao: 60
                };
                setAgendamentos([...agendamentos, novoAgendamento]);
                toast({
                  title: "Sucesso", 
                  description: "Agendamento criado com sucesso!"
                });
                setAgendamentoData({
                  cliente: "",
                  servico: "",
                  profissional: "",
                  sala: "",
                  data: "",
                  horario: ""
                });
                setIsDialogOpen(false);
              }}>
                Agendar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4">
                <CalendarIcon className="h-4 w-4" />
                <span className="font-semibold">
                  {currentDate.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={nextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select 
                value={selectedProfissional}
                onChange={(e) => setSelectedProfissional(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                {profissionais.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visualização em Timeline */}
            <div>
              <h3 className="font-semibold mb-4">Timeline do Dia</h3>
              <div className="space-y-2">
                {horarios.map((horario) => {
                  const agendamento = filteredAgendamentos.find(a => a.horario === horario);
                  
                  return (
                    <div key={horario} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="font-mono text-sm bg-muted px-2 py-1 rounded min-w-16 text-center">
                        {horario}
                      </div>
                      {agendamento ? (
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{agendamento.cliente}</p>
                            <Badge className={getStatusColor(agendamento.status)}>
                              {agendamento.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {agendamento.servico} • {agendamento.profissional}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {agendamento.sala} • {agendamento.duracao} min
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">Check-in</Button>
                            <Button variant="ghost" size="sm">Editar</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 text-muted-foreground text-sm">
                          Horário disponível
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumo do Dia */}
            <div>
              <h3 className="font-semibold mb-4">Resumo do Dia</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{filteredAgendamentos.length}</p>
                        <p className="text-sm text-muted-foreground">Agendamentos</p>
                      </div>
                      <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <h4 className="font-medium">Por Status</h4>
                  <div className="space-y-2">
                    {["confirmado", "solicitado", "compareceu"].map(status => {
                      const count = filteredAgendamentos.filter(a => a.status === status).length;
                      return count > 0 ? (
                        <div key={status} className="flex items-center justify-between">
                          <Badge className={getStatusColor(status)}>{status}</Badge>
                          <span className="text-sm">{count}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Próximos Agendamentos</h4>
                  <div className="space-y-2">
                    {filteredAgendamentos
                      .filter(a => a.status === "confirmado" || a.status === "solicitado")
                      .slice(0, 3)
                      .map(agendamento => (
                        <div key={agendamento.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{agendamento.horario}</span>
                            <Badge className={getStatusColor(agendamento.status)}>
                              {agendamento.status}
                            </Badge>
                          </div>
                          <p className="text-sm">{agendamento.cliente}</p>
                          <p className="text-xs text-muted-foreground">{agendamento.servico}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}