import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useClientes } from '@/hooks/useClientes';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useServicos } from '@/hooks/useServicos';

interface ModalAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSubmit: (data: any) => Promise<boolean>;
}

export const ModalAgendamento: React.FC<ModalAgendamentoProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    servico_id: '',
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
        servico_id: '',
        profissional_id: '',
        sala_id: '',
        observacoes: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_id || !formData.servico_id || !formData.profissional_id) {
      return;
    }

    setLoading(true);
    
    try {
      const servico = servicos.find(s => s.id === formData.servico_id);
      
      // Calcular data_hora_fim baseado na duração do serviço
      let dataHoraFim = null;
      if (servico?.duracao_minutos && selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const dataHora = new Date(selectedDate);
        dataHora.setHours(hours, minutes, 0, 0);
        
        const dataFim = new Date(dataHora);
        dataFim.setMinutes(dataFim.getMinutes() + servico.duracao_minutos);
        dataHoraFim = dataFim.toISOString();
      }

      const agendamentoData = {
        cliente_id: formData.cliente_id,
        servico_id: formData.servico_id,
        profissional_id: formData.profissional_id,
        sala_id: formData.sala_id || null,
        observacoes: formData.observacoes || null,
        data_hora_fim: dataHoraFim,
        status: 'solicitado',
        origem: 'recepcao',
        politica_cancelamento_aceita: false,
      };

      await onSubmit(agendamentoData);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = () => {
    if (!selectedDate || !selectedTime) return '';
    return `${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Agendamento para {formatDateTime()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Serviço */}
            <div className="space-y-2">
              <Label htmlFor="servico">Serviço *</Label>
              <Select
                value={formData.servico_id}
                onValueChange={(value) => setFormData({ ...formData, servico_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome} ({servico.duracao_minutos}min)
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

            {/* Data e Hora (readonly) */}
            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <Input
                value={formatDateTime()}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Observações */}
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};