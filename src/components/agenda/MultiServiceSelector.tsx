import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
}

interface MultiServiceSelectorProps {
  servicos: Servico[];
  selectedServices: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const MultiServiceSelector: React.FC<MultiServiceSelectorProps> = ({
  servicos,
  selectedServices,
  onSelectionChange,
}) => {
  const handleServiceToggle = (servicoId: string) => {
    const newSelection = selectedServices.includes(servicoId)
      ? selectedServices.filter(id => id !== servicoId)
      : [...selectedServices, servicoId];
    
    onSelectionChange(newSelection);
  };

  const removeService = (servicoId: string) => {
    onSelectionChange(selectedServices.filter(id => id !== servicoId));
  };

  const getSelectedServicesInfo = () => {
    return servicos.filter(s => selectedServices.includes(s.id));
  };

  const getTotalDuration = () => {
    return getSelectedServicesInfo().reduce((total, servico) => total + servico.duracao_minutos, 0);
  };

  return (
    <div className="space-y-4">
      {/* Lista de serviços com checkboxes */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Selecionar Serviços *</Label>
        <ScrollArea className="max-h-48 border rounded-md p-4">
          <div className="space-y-3">
            {servicos.map((servico) => (
              <div key={servico.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`servico-${servico.id}`}
                  checked={selectedServices.includes(servico.id)}
                  onCheckedChange={() => handleServiceToggle(servico.id)}
                />
                <Label
                  htmlFor={`servico-${servico.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {servico.nome} ({servico.duracao_minutos}min)
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chips dos serviços selecionados */}
      {selectedServices.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Serviços Selecionados ({getTotalDuration()}min total)
          </Label>
          <div className="flex flex-wrap gap-2">
            {getSelectedServicesInfo().map((servico) => (
              <Badge
                key={servico.id}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1"
              >
                <span className="text-xs">
                  {servico.nome} ({servico.duracao_minutos}min)
                </span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeService(servico.id)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};