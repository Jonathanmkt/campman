import * as React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    novo: {
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      icon: AlertCircle,
      label: 'Novo'
    },
    agendado: {
      color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
      icon: CheckCircle,
      label: 'Agendado'
    },
    comunicado: {
      color: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      icon: CheckCircle,
      label: 'Comunicado'
    }
  };

  const defaultConfig = {
    color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    icon: AlertCircle,
    label: 'Desconhecido'
  };

  const config = statusConfig[status as keyof typeof statusConfig] || defaultConfig;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border-0`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {config.label}
    </Badge>
  );
}