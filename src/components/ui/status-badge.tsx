import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusLabels: Record<string, string> = {
  'confirmado': 'Confirmado',
  'solicitado': 'Solicitado',
  'concluido': 'Concluído',
  'cancelado': 'Cancelado',
};

const statusVariants: Record<string, string> = {
  'confirmado': 'status-badge-confirmado',
  'solicitado': 'status-badge-solicitado',
  'concluido': 'status-badge-concluido',
  'cancelado': 'status-badge-cancelado',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className,
}) => {
  const label = statusLabels[status] || status;
  const variant = statusVariants[status] || 'status-badge-solicitado';

  return (
    <Badge
      variant="outline"
      className={cn(
        variant,
        {
          'text-xs px-2 py-0.5': size === 'sm',
          'text-sm px-3 py-1': size === 'md',
          'text-base px-4 py-1.5': size === 'lg',
        },
        className
      )}
    >
      {label}
    </Badge>
  );
};