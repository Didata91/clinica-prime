import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Settings } from "lucide-react";
import { useAgenda } from "@/hooks/useAgenda";
import { useProfissionais } from "@/hooks/useProfissionais";
import { useServicos } from "@/hooks/useServicos";
import { useAppConfig } from "@/hooks/useAppConfig";
import { CalendarioMensal } from "@/components/agenda/CalendarioMensal";
import { PainelSlots } from "@/components/agenda/PainelSlots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedProfissional, setSelectedProfissional] = useState<string>("todos");
  const [selectedServico, setSelectedServico] = useState<string>("todos");
  
  const { profissionais } = useProfissionais();
  const { servicos } = useServicos();
  const { scheduleWindows } = useAppConfig();
  
  const {
    config,
    isLoading,
    isDateEnabled,
    getDateCount,
    daySlots,
    dayAppointments,
    createAgendamento,
    updateAgendamento,
  } = useAgenda(currentMonth, selectedDate);

  // Filtrar agendamentos do dia por profissional/serviço
  const filteredDayAppointments = dayAppointments.filter(agendamento => {
    const matchProfissional = selectedProfissional === "todos" || 
      agendamento.profissional_id === selectedProfissional;
    const matchServico = selectedServico === "todos" || 
      agendamento.servico_id === selectedServico;
    return matchProfissional && matchServico;
  });

  if (isLoading) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-2">
            Calendário de agendamentos da clínica
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">Profissional:</span>
                <Select value={selectedProfissional} onValueChange={setSelectedProfissional}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {profissionais.map(prof => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Serviço:</span>
                <Select value={selectedServico} onValueChange={setSelectedServico}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {servicos.map(servico => (
                      <SelectItem key={servico.id} value={servico.id}>
                        {servico.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendário e Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarioMensal
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onMonthChange={setCurrentMonth}
          onDateSelect={setSelectedDate}
          isDateEnabled={isDateEnabled}
          getDateCount={getDateCount}
        />
        
        <PainelSlots
          selectedDate={selectedDate}
          daySlots={daySlots}
          dayAppointments={filteredDayAppointments}
          onCreateAgendamento={createAgendamento}
          onUpdateAgendamento={updateAgendamento}
          allowOverbooking={config?.allow_overbooking || false}
          config={{ ...config, scheduleWindows }}
        />
      </div>
    </div>
  );
}