import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarioMensalProps {
  currentMonth: Date;
  selectedDate: Date | null;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
  isDateEnabled: (date: Date) => boolean;
  getDateCount: (date: Date) => number;
}

export const CalendarioMensal: React.FC<CalendarioMensalProps> = ({
  currentMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
  isDateEnabled,
  getDateCount,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = [];
  let day = startDate;

  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const previousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(today);
    onDateSelect(today);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Cabeçalho dos dias da semana */}
          {weekDays.map(weekDay => (
            <div
              key={weekDay}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {weekDay}
            </div>
          ))}
          
          {/* Células dos dias */}
          {days.map(day => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const enabled = isDateEnabled(day);
            const count = getDateCount(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  relative p-2 min-h-[3.5rem] border rounded-md cursor-pointer transition-all
                  ${!isCurrentMonth ? 'text-muted-foreground/50 bg-muted/20' : ''}
                  ${!enabled ? 'opacity-50 cursor-default bg-muted/50' : 'hover:bg-muted/50'}
                  ${isSelected ? 'ring-2 ring-primary bg-primary/10' : ''}
                  ${isToday ? 'border-primary' : 'border-border'}
                `}
                onClick={() => enabled && isCurrentMonth && onDateSelect(day)}
              >
                <div className="flex flex-col items-center">
                  <span className={`
                    text-sm font-medium
                    ${isToday ? 'text-primary font-bold' : ''}
                    ${isSelected ? 'text-primary' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Badge de contagem */}
                  {count > 0 && enabled && isCurrentMonth && (
                    <Badge 
                      variant="secondary" 
                      className="mt-1 px-1.5 py-0.5 text-xs min-w-[1.25rem] h-5"
                    >
                      {count}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legenda */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border border-border bg-background"></div>
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted/50 opacity-50"></div>
            <span>Não configurado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded ring-2 ring-primary bg-primary/10"></div>
            <span>Selecionado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};