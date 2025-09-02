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
import { useUserRole } from '@/hooks/useUserRole';
import { MultiServiceSelector } from './MultiServiceSelector';
import { DateTimePicker } from './DateTimePicker';
import { ScheduleWindow } from '@/hooks/useAppConfig';

interface ServicoComPreco {
  id: string;
  nome: string;
  duracao_minutos: number;
  preco_padrao?: number;
  valor_padrao: number;
  valor_aplicado: number;
  desconto_motivo?: string;
}

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
  const [selectedServices, setSelectedServices] = useState<ServicoComPreco[]>([]);
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
  const { isAdmin, isProfissional } = useUserRole();

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

    // Validation: check if discount reason is required
    const hasInvalidDiscount = selectedServices.some(s => 
      s.valor_aplicado < s.valor_padrao && !s.desconto_motivo?.trim()
    );
    
    if (hasInvalidDiscount) {
      return; // Validation will be handled by the form
    }

    setLoading(true);
    
    try {
      // Calcular duração total
      const duracaoTotal = selectedServices.reduce(
        (total, servico) => total + servico.duracao_minutos, 
        0
      );

      // Calcular data_hora_inicio e data_hora_fim
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dataHoraInicio = new Date(selectedDate);
      dataHoraInicio.setHours(hours, minutes, 0, 0);
      
      const dataHoraFim = new Date(dataHoraInicio);
      dataHoraFim.setMinutes(dataHoraFim.getMinutes() + duracaoTotal);

      // Determine status based on user role
      const status_id = (isAdmin || isProfissional) ? 'confirmado' : 'solicitado';

      const agendamentoData = {
        cliente_id: formData.cliente_id,
        profissional_id: formData.profissional_id,
        sala_id: formData.sala_id || null,
        observacoes: formData.observacoes || null,
        data_hora_inicio: dataHoraInicio.toISOString(),
        data_hora_fim: dataHoraFim.toISOString(),
        selectedServices: selectedServices, // Send full service data
        servico_id: selectedServices[0]?.id || null, // Compatibility field
        status_id,
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
      <DialogContent className="max-w-4xl h-[90vh] sm:h-auto flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
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
          </form>
        </div>

        {/* Footer - Sticky em mobile */}
        <div className="border-t bg-background p-6 pb-[env(safe-area-inset-bottom)] sm:pb-6">
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="order-2 sm:order-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || !formData.cliente_id || !formData.profissional_id || 
                        selectedServices.length === 0 || !selectedDate || !selectedTime ||
                        selectedServices.some(s => s.valor_aplicado < s.valor_padrao && !s.desconto_motivo?.trim())}
              className="order-1 sm:order-2"
            >
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};