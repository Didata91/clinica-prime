import { ScheduleWindow } from '@/hooks/useAppConfig';
import { format, parseISO, getDay } from 'date-fns';

export interface TimeSlot {
  time: string;
  available: boolean;
  blocked?: boolean;
}

export const generateTimeSlots = (
  date: Date,
  scheduleWindows: ScheduleWindow[],
  intervalMinutes: number = 30
): TimeSlot[] => {
  const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday
  const dateString = format(date, 'yyyy-MM-dd');
  
  // Check for specific date blocks
  const specificDateBlock = scheduleWindows.find(
    w => w.specific_date === dateString && w.is_blocked
  );
  
  if (specificDateBlock) {
    return []; // Entire day is blocked
  }
  
  // Find applicable schedule windows for this day
  const dayWindows = scheduleWindows.filter(w => {
    // Check for specific date (non-blocked)
    if (w.specific_date === dateString && !w.is_blocked) {
      return true;
    }
    // Check for regular weekday and no specific date
    if (!w.specific_date && w.weekday === dayOfWeek && !w.is_blocked) {
      return true;
    }
    return false;
  });
  
  if (dayWindows.length === 0) {
    return []; // No windows defined for this day
  }
  
  const slots: TimeSlot[] = [];
  
  dayWindows.forEach(window => {
    const startTime = parseTimeString(window.start_time);
    const endTime = parseTimeString(window.end_time);
    
    let currentTime = startTime;
    
    while (currentTime < endTime) {
      const timeString = formatTimeMinutes(currentTime);
      slots.push({
        time: timeString,
        available: true,
      });
      currentTime += intervalMinutes;
    }
  });
  
  // Remove duplicates and sort
  const uniqueSlots = Array.from(
    new Map(slots.map(slot => [slot.time, slot])).values()
  ).sort((a, b) => a.time.localeCompare(b.time));
  
  return uniqueSlots;
};

export const isDateAllowed = (
  date: Date,
  scheduleWindows: ScheduleWindow[]
): boolean => {
  const dayOfWeek = getDay(date);
  const dateString = format(date, 'yyyy-MM-dd');
  
  // Check for specific date blocks
  const specificDateBlock = scheduleWindows.find(
    w => w.specific_date === dateString && w.is_blocked
  );
  
  if (specificDateBlock) {
    return false;
  }
  
  // Check if there are any windows for this day
  const hasWindows = scheduleWindows.some(w => {
    // Specific date (non-blocked)
    if (w.specific_date === dateString && !w.is_blocked) {
      return true;
    }
    // Regular weekday
    if (!w.specific_date && w.weekday === dayOfWeek && !w.is_blocked) {
      return true;
    }
    return false;
  });
  
  return hasWindows;
};

export const isTimeSlotAllowed = (
  date: Date,
  time: string,
  scheduleWindows: ScheduleWindow[]
): boolean => {
  const slots = generateTimeSlots(date, scheduleWindows);
  return slots.some(slot => slot.time === time && slot.available);
};

// Helper functions
const parseTimeString = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTimeMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const getWeekdayName = (weekday: number): string => {
  const names = [
    'Domingo',
    'Segunda-feira', 
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];
  return names[weekday] || '';
};