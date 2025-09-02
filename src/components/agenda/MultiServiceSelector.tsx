import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Servico {
  id: string;
  nome: string;
  duracao_minutos: number;
  preco_padrao?: number;
}

interface ServicoComPreco extends Servico {
  valor_padrao: number;
  valor_aplicado: number;
  desconto_motivo?: string;
}

interface MultiServiceSelectorProps {
  servicos: Servico[];
  selectedServices: ServicoComPreco[];
  onSelectionChange: (services: ServicoComPreco[]) => void;
}

export const MultiServiceSelector: React.FC<MultiServiceSelectorProps> = ({
  servicos,
  selectedServices,
  onSelectionChange,
}) => {
  const handleServiceToggle = (servico: Servico) => {
    const isSelected = selectedServices.some(s => s.id === servico.id);
    
    if (isSelected) {
      // Remove service
      const newSelection = selectedServices.filter(s => s.id !== servico.id);
      onSelectionChange(newSelection);
    } else {
      // Add service with default values
      const newService: ServicoComPreco = {
        ...servico,
        valor_padrao: servico.preco_padrao || 0,
        valor_aplicado: servico.preco_padrao || 0,
        desconto_motivo: undefined,
      };
      onSelectionChange([...selectedServices, newService]);
    }
  };

  const removeService = (servicoId: string) => {
    onSelectionChange(selectedServices.filter(s => s.id !== servicoId));
  };

  const updateServicePrice = (servicoId: string, field: 'valor_aplicado' | 'desconto_motivo', value: number | string) => {
    const newSelection = selectedServices.map(s => {
      if (s.id === servicoId) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onSelectionChange(newSelection);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, servico) => total + servico.duracao_minutos, 0);
  };

  const getTotalValue = () => {
    return selectedServices.reduce((total, servico) => total + servico.valor_aplicado, 0);
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
                  checked={selectedServices.some(s => s.id === servico.id)}
                  onCheckedChange={() => handleServiceToggle(servico)}
                />
                <Label
                  htmlFor={`servico-${servico.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {servico.nome} ({servico.duracao_minutos}min) - R$ {(servico.preco_padrao || 0).toFixed(2)}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Detalhes dos serviços selecionados com preços */}
      {selectedServices.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">
              Serviços Selecionados ({getTotalDuration()}min total)
            </Label>
            <div className="text-lg font-semibold text-primary">
              Total: R$ {getTotalValue().toFixed(2)}
            </div>
          </div>
          
          <div className="space-y-4">
            {selectedServices.map((servico) => (
              <div key={servico.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{servico.nome}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {servico.duracao_minutos}min
                    </span>
                  </div>
                  <X
                    className="h-4 w-4 cursor-pointer hover:text-destructive"
                    onClick={() => removeService(servico.id)}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Valor Padrão</Label>
                    <div className="text-sm font-medium">
                      R$ {servico.valor_padrao.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`valor-${servico.id}`} className="text-xs">
                      Valor Aplicado *
                    </Label>
                    <Input
                      id={`valor-${servico.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={servico.valor_aplicado}
                      onChange={(e) => updateServicePrice(servico.id, 'valor_aplicado', parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {servico.valor_aplicado < servico.valor_padrao && (
                  <div>
                    <Label htmlFor={`motivo-${servico.id}`} className="text-xs">
                      Motivo do Desconto *
                    </Label>
                    <Textarea
                      id={`motivo-${servico.id}`}
                      value={servico.desconto_motivo || ''}
                      onChange={(e) => updateServicePrice(servico.id, 'desconto_motivo', e.target.value)}
                      placeholder="Informe o motivo do desconto..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                )}
                
                <div className="text-right">
                  <span className="text-sm font-medium">
                    Subtotal: R$ {servico.valor_aplicado.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};