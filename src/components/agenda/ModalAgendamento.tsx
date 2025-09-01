import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClientes } from '@/hooks/useClientes';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useServicos } from '@/hooks/useServicos';
import { MultiServiceSelector } from './MultiServiceSelector';
import { DateTimePicker } from './DateTimePicker';
import { useAgenda } from '@/hooks/useAgenda';
import { ScheduleWindow } from '@/hooks/useAppConfig';

interface ModalAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<boolean>;
  scheduleWindows: ScheduleWindow[];
  selectedDateTime?: { date: Date; time: string } | null;
}

export const ModalAgendamento: React.FC<ModalAgendamentoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scheduleWindows,
  selectedDateTime,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(selectedDateTime?.date || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(selectedDateTime?.time || null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    profissional_id: '',
    sala_id: '',
    observacoes: '',
  });

  const { clientes } = useClientes();
  const { profissionais } = useProfissionais();
  const { servicos } = useServicos();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        cliente_id: '',
        profissional_id: '',
        sala_id: '',
        observacoes: '',
      });
      setSelectedDate(selectedDateTime?.date || null);
      setSelectedTime(selectedDateTime?.time || null);
      setSelectedServices([]);
      setIsEditingDateTime(false);
    } else if (selectedDateTime) {
      setSelectedDate(selectedDateTime.date);
      setSelectedTime(selectedDateTime.time);
    }
  }, [isOpen, selectedDateTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_id || !formData.profissional_id || 
        selectedServices.length === 0 || !selectedDate || !selectedTime) {
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados dos serviços selecionados
      const selectedServicesData = servicos
        .filter(s => selectedServices.includes(s.id))
        .map(s => ({
          id: s.id,
          nome: s.nome,
          duracao_minutos: s.duracao_minutos,
        }));

      // Calcular duração total
      const duracaoTotal = selectedServicesData.reduce(
        (total, servico) => total + servico.duracao_minutos, 
        0
      );

      // Calcular data_hora_inicio e data_hora_fim
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dataHoraInicio = new Date(selectedDate);
      dataHoraInicio.setHours(hours, minutes, 0, 0);
      
      const dataHoraFim = new Date(dataHoraInicio);
      dataHoraFim.setMinutes(dataHoraFim.getMinutes() + duracaoTotal);

      const agendamentoData = {
        cliente_id: formData.cliente_id,
        profissional_id: formData.profissional_id,
        sala_id: formData.sala_id || null,
        observacoes: formData.observacoes || null,
        data_hora_inicio: dataHoraInicio.toISOString(),
        data_hora_fim: dataHoraFim.toISOString(),
        selectedServices: selectedServices, // Send service IDs for pivot table
        servico_id: selectedServices[0] || null, // Compatibility field
        status: 'solicitado',
        origem: 'recepcao',
        politica_cancelamento_aceita: false,
      };

      const success = await onSubmit(agendamentoData);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profissional */}
              <div className="space-y-2">
                <Label htmlFor="profissional">Profissional *</Label>
                <Select
                  value={formData.profissional_id}
                  onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais.map((profissional) => (
                      <SelectItem key={profissional.id} value={profissional.id}>
                        {profissional.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Serviços */}
              <MultiServiceSelector
                servicos={servicos}
                selectedServices={selectedServices}
                onSelectionChange={setSelectedServices}
              />
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              {/* Data e Hora */}
              {!isEditingDateTime && selectedDateTime ? (
                <div className="space-y-2">
                  <Label>Agendamento marcado para:</Label>
                  <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {selectedDate && selectedTime && 
                          `${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime}`
                        }
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDateTime(true)}
                    >
                      Alterar
                    </Button>
                  </div>
                </div>
              ) : (
                <DateTimePicker
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  scheduleWindows={scheduleWindows}
                  profissionalId={formData.profissional_id}
                />
              )}
            </div>
          </div>

          {/* Observações - Largura completa */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.cliente_id || !formData.profissional_id || 
                        selectedServices.length === 0 || !selectedDate || !selectedTime}
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};