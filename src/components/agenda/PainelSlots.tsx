import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, Plus, Users, Edit, User, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgenda } from '@/hooks/useAgenda';
import { ModalEditarAgendamento } from './ModalEditarAgendamento';

interface PainelSlotsProps {
  selectedDate: Date | null;
  onNovoAgendamento: (slotDateTime?: { date: Date; time: string }) => void;
  scheduleWindows: any[];
}

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

export const PainelSlots: React.FC<PainelSlotsProps> = ({
  selectedDate,
  onNovoAgendamento,
  scheduleWindows,
}) => {
  const { daySlots, dayAppointments } = useAgenda(new Date(), selectedDate);
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSlotClick = (slot: any) => {
    if (slot.occupied) {
      // Abrir modal de edição para agendamento existente
      setSelectedAgendamento(slot.agendamento);
      setIsEditModalOpen(true);
      return;
    }
    
    if (!slot.available) return;
    
    // Chamar callback para novo agendamento com data/hora do slot
    onNovoAgendamento({ 
      date: selectedDate!, 
      time: slot.time 
    });
  };


  if (!selectedDate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                Selecione uma data no calendário
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Para visualizar os horários disponíveis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (daySlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horários de {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-center">
            <div>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">
                Nenhuma janela configurada para este dia
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Configure as janelas de agendamento em Configurações
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários de {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {dayAppointments.length} agendamento(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {daySlots.map((slot) => {
              const isOccupied = slot.occupied;
              const isAvailable = slot.available;
              const agendamento = slot.agendamento;
              
              return (
                <div
                  key={slot.time}
                  className={`
                    flex items-start gap-3 p-3 border rounded-lg transition-all
                    ${isAvailable ? 'cursor-pointer hover:bg-muted/50' : 'cursor-not-allowed opacity-60'}
                    ${isOccupied ? 'bg-muted/20' : 'hover:shadow-sm'}
                  `}
                  onClick={() => isAvailable && handleSlotClick(slot)}
                >
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded min-w-[4rem] text-center">
                    {slot.time}
                  </div>
                  
                  {slot.agendamento ? (
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{slot.agendamento.cliente_nome}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(slot.agendamento.status)}>
                            {slot.agendamento.status}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={() => handleSlotClick(slot)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Stethoscope className="h-3 w-3" />
                         <div className="flex flex-wrap gap-1">
                           {/* Exibir múltiplos serviços se disponível no novo campo */}
                           {slot.agendamento.servicos_nomes && Array.isArray(slot.agendamento.servicos_nomes) && slot.agendamento.servicos_nomes.length > 0 ? (
                             slot.agendamento.servicos_nomes.map((servicoNome: string, index: number) => (
                               <span key={index} className="inline-flex">
                                 {servicoNome}
                                 {index < slot.agendamento.servicos_nomes.length - 1 && ', '}
                               </span>
                             ))
                           ) : slot.agendamento.servico_nome ? (
                             <span>{slot.agendamento.servico_nome}</span>
                           ) : (
                             <span>Serviço não especificado</span>
                           )}
                         </div>
                        <span>•</span>
                        <span>{slot.agendamento.profissional_nome}</span>
                       </div>
                       {slot.agendamento.valor_total && slot.agendamento.valor_total > 0 && (
                         <div className="text-xs text-primary font-medium mt-1">
                           Total: R$ {slot.agendamento.valor_total.toFixed(2)}
                         </div>
                       )}
                       {slot.agendamento.observacoes && (
                        <p className="text-xs text-muted-foreground italic">
                          {slot.agendamento.observacoes}
                        </p>
                      )}
                    </div>
                   ) : (
                     <div className="flex-1 flex items-center justify-between">
                       <span className="text-muted-foreground text-sm">
                         Horário disponível
                       </span>
                       <Plus className="h-4 w-4 text-muted-foreground" />
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
           
           {/* Legenda */}
           <div className="mt-4 pt-4 border-t">
             <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded border bg-background"></div>
                 <span>Disponível</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded bg-muted/20"></div>
                 <span>Ocupado</span>
               </div>
             </div>
           </div>
         </CardContent>
       </Card>

        <ModalEditarAgendamento
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAgendamento(null);
          }}
          agendamento={selectedAgendamento}
          onUpdate={async () => {}}
          config={{}}
        />
     </>
   );
 };