import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { generateTimeSlots, isDateAllowed } from '@/lib/scheduleUtils';
import { ScheduleWindow } from '@/hooks/useAppConfig';

interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string | null) => void;
  scheduleWindows: ScheduleWindow[];
  intervalMinutes?: number;
  occupiedSlots?: string[];
  profissionalId?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  scheduleWindows,
  intervalMinutes = 30,
  occupiedSlots = [],
  profissionalId,
}) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Gerar slots de tempo quando a data muda
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate, scheduleWindows, intervalMinutes);
      const availableSlots = slots
        .filter(slot => slot.available && !occupiedSlots.includes(slot.time))
        .map(slot => slot.time);
      
      setAvailableTimeSlots(availableSlots);
      
      // Se o horário selecionado não está mais disponível, limpar
      if (selectedTime && !availableSlots.includes(selectedTime)) {
        onTimeChange(null);
      }
    } else {
      setAvailableTimeSlots([]);
      onTimeChange(null);
    }
  }, [selectedDate, scheduleWindows, intervalMinutes, occupiedSlots, selectedTime, onTimeChange]);

  const formatDateTime = () => {
    if (!selectedDate || !selectedTime) return 'Selecionar data e hora';
    return `${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })} às ${selectedTime}`;
  };

  return (
    <div className="space-y-4">
      {/* Seletor de Data */}
      <div className="space-y-2">
        <Label>Data do Agendamento *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={(date) => !isDateAllowed(date, scheduleWindows)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Seletor de Hora */}
      <div className="space-y-2">
        <Label>Horário *</Label>
        <Select 
          value={selectedTime || ''} 
          onValueChange={(value) => onTimeChange(value || null)}
          disabled={!selectedDate || availableTimeSlots.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              !selectedDate 
                ? "Selecione uma data primeiro"
                : availableTimeSlots.length === 0
                  ? "Nenhum horário disponível"
                  : "Selecionar horário"
            } />
          </SelectTrigger>
          <SelectContent>
            {availableTimeSlots.map((time) => (
              <SelectItem key={time} value={time}>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {time}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resumo da seleção */}
      {selectedDate && selectedTime && (
        <div className="p-3 bg-muted rounded-md">
          <Label className="text-sm font-medium">Agendamento marcado para:</Label>
          <p className="text-sm mt-1">{formatDateTime()}</p>
        </div>
      )}
    </div>
  );
};