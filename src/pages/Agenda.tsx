import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Filter, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAgendamentos } from "@/hooks/useAgendamentos";
import { useClientes } from "@/hooks/useClientes";
import { useProfissionais } from "@/hooks/useProfissionais";
import { useServicos } from "@/hooks/useServicos";
import { useAppConfig } from "@/hooks/useAppConfig";
import { generateTimeSlots, isDateAllowed } from "@/lib/scheduleUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfissional, setSelectedProfissional] = useState("Todas");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { agendamentos, loading, createAgendamento, updateAgendamentoStatus } = useAgendamentos();
  const { clientes } = useClientes();
  const { profissionais } = useProfissionais();
  const { servicos } = useServicos();
  const { config, scheduleWindows, loading: configLoading } = useAppConfig();
  
  const [agendamentoData, setAgendamentoData] = useState({
    cliente_id: "",
    servico_id: "",
    profissional_id: "",
    sala_id: "",
    data_hora_inicio: "",
    data_hora_fim: ""
  });
  const { toast } = useToast();

  // Verificar se a data atual é permitida
  const isCurrentDateAllowed = isDateAllowed(currentDate, scheduleWindows);
  
  // Gerar horários baseados nas janelas de configuração
  const horarios = isCurrentDateAllowed 
    ? generateTimeSlots(currentDate, scheduleWindows, config?.agenda_interval_minutes || 30)
    : [];

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const agendamentoDate = new Date(agendamento.data_hora_inicio);
    const agendamentoDateStr = agendamentoDate.toISOString().split('T')[0];
    const matchDate = agendamentoDateStr === currentDateStr;
    const matchProfissional = selectedProfissional === "Todas" || 
      (agendamento.profissionais && agendamento.profissionais.nome === selectedProfissional);
    return matchDate && matchProfissional;
  });

  const handleCreateAgendamento = async () => {
    if (!agendamentoData.cliente_id || !agendamentoData.servico_id || !agendamentoData.profissional_id || !agendamentoData.data_hora_inicio) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      await createAgendamento({
        cliente_id: agendamentoData.cliente_id,
        servico_id: agendamentoData.servico_id,
        profissional_id: agendamentoData.profissional_id,
        sala_id: agendamentoData.sala_id || null,
        data_hora_inicio: agendamentoData.data_hora_inicio,
        data_hora_fim: agendamentoData.data_hora_fim,
        status: 'solicitado',
        origem: 'recepcao',
        politica_cancelamento_aceita: false
      });

      setAgendamentoData({
        cliente_id: "",
        servico_id: "",
        profissional_id: "",
        sala_id: "",
        data_hora_inicio: "",
        data_hora_fim: ""
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error already handled by hook
    }
  };

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

  if (loading || configLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground mt-2">Carregando agendamentos...</p>
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
                <select 
                  className="w-full p-2 border rounded-md"
                  value={agendamentoData.cliente_id}
                  onChange={(e) => setAgendamentoData({...agendamentoData, cliente_id: e.target.value})}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome_completo}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Serviço *</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={agendamentoData.servico_id}
                  onChange={(e) => setAgendamentoData({...agendamentoData, servico_id: e.target.value})}
                >
                  <option value="">Selecione um serviço</option>
                  {servicos.map(servico => (
                    <option key={servico.id} value={servico.id}>{servico.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Profissional *</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={agendamentoData.profissional_id}
                  onChange={(e) => setAgendamentoData({...agendamentoData, profissional_id: e.target.value})}
                >
                  <option value="">Selecione um profissional</option>
                  {profissionais.map(profissional => (
                    <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
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
                    setAgendamentoData({
                      ...agendamentoData, 
                      data_hora_inicio: inicio,
                      data_hora_fim: fim
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAgendamento}>
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
                <option value="Todas">Todas</option>
                {profissionais.map(prof => (
                  <option key={prof.id} value={prof.nome}>{prof.nome}</option>
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
              {!isCurrentDateAllowed ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Nenhuma janela de atendimento configurada para este dia
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Configure as janelas de agendamento em Configurações
                    </p>
                  </div>
                </div>
              ) : horarios.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">
                      Este dia está bloqueado
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Verifique as configurações de agenda
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {horarios.map((slot) => {
                    const agendamento = filteredAgendamentos.find(a => {
                      const agendamentoTime = new Date(a.data_hora_inicio);
                      const timeString = `${agendamentoTime.getHours().toString().padStart(2, '0')}:${agendamentoTime.getMinutes().toString().padStart(2, '0')}`;
                      return timeString === slot.time;
                    });
                    
                    return (
                      <div key={slot.time} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="font-mono text-sm bg-muted px-2 py-1 rounded min-w-16 text-center">
                          {slot.time}
                        </div>
                        {agendamento ? (
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{agendamento.clientes?.nome_completo}</p>
                              <Badge className={getStatusColor(agendamento.status)}>
                                {agendamento.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {agendamento.servicos?.nome} • {agendamento.profissionais?.nome}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {agendamento.salas?.nome || 'Sala não definida'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updateAgendamentoStatus(agendamento.id, 'compareceu')}
                              >
                                Check-in
                              </Button>
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
              )}
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
                            <span className="font-medium text-sm">
                              {new Date(agendamento.data_hora_inicio).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <Badge className={getStatusColor(agendamento.status)}>
                              {agendamento.status}
                            </Badge>
                          </div>
                          <p className="text-sm">{agendamento.clientes?.nome_completo}</p>
                          <p className="text-xs text-muted-foreground">{agendamento.servicos?.nome}</p>
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