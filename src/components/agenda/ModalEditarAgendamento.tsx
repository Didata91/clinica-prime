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
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useProfissionais } from '@/hooks/useProfissionais';
import { useServicos } from '@/hooks/useServicos';
import { useAgenda } from '@/hooks/useAgenda';
import { Calendar, Clock, User, Stethoscope, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModalEditarAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento: any;
  onUpdate: (id: string, data: any) => Promise<any>;
  config?: any;
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

export const ModalEditarAgendamento: React.FC<ModalEditarAgendamentoProps> = ({
  isOpen,
  onClose,
  agendamento,
  onUpdate,
  config,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profissional_id: '',
    servico_id: '',
    data_hora_inicio: '',
    observacoes: '',
  });

  const { profissionais } = useProfissionais();
  const { servicos } = useServicos();

  // Inicializar form com dados do agendamento
  useEffect(() => {
    if (agendamento && isOpen) {
      setFormData({
        profissional_id: agendamento.profissional_id || '',
        servico_id: agendamento.servico_id || '',
        data_hora_inicio: agendamento.data_hora_inicio ? 
          format(parseISO(agendamento.data_hora_inicio), "yyyy-MM-dd'T'HH:mm") : '',
        observacoes: agendamento.observacoes || '',
      });
    }
  }, [agendamento, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profissional_id || !formData.servico_id || !formData.data_hora_inicio) {
      return;
    }

    setLoading(true);
    
    try {
      const servico = servicos.find(s => s.id === formData.servico_id);
      
      // Calcular data_hora_fim baseado na duração do serviço
      let dataHoraFim = null;
      if (servico?.duracao_minutos) {
        const dataInicio = new Date(formData.data_hora_inicio);
        const dataFim = new Date(dataInicio);
        dataFim.setMinutes(dataFim.getMinutes() + servico.duracao_minutos);
        dataHoraFim = dataFim.toISOString();
      }

      const updateData = {
        profissional_id: formData.profissional_id,
        servico_id: formData.servico_id,
        data_hora_inicio: new Date(formData.data_hora_inicio).toISOString(),
        data_hora_fim: dataHoraFim,
        observacoes: formData.observacoes || null,
      };

      await onUpdate(agendamento.id, updateData);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!agendamento) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Agendamento
          </DialogTitle>
          <DialogDescription>
            Modifique os dados do agendamento conforme necessário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do cliente (readonly) */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{agendamento.cliente_nome}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(parseISO(agendamento.data_hora_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(parseISO(agendamento.data_hora_inicio), 'HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(agendamento.status)}>
                {agendamento.status}
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-3 w-3" />
                          {profissional.nome}
                        </div>
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

              {/* Data e Hora */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="data_hora">Data e Hora *</Label>
                <Input
                  id="data_hora"
                  type="datetime-local"
                  value={formData.data_hora_inicio}
                  onChange={(e) => setFormData({ ...formData, data_hora_inicio: e.target.value })}
                  required
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
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};