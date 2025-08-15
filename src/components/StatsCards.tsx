import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CheckCircle, AlertTriangle, Pause } from 'lucide-react';
import type { Attendance } from '@/types/attendance';

interface StatsCardsProps {
  attendances: Attendance[];
  onFilterChange?: (filter: { status?: string }) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ attendances, onFilterChange }) => {
  const totalAttendances = attendances.length;
  const inProgressAttendances = attendances.filter(a => a.status?.toLowerCase() === 'em andamento').length;
  const waitingAttendances = attendances.filter(a => a.status?.toLowerCase() === 'aguardando').length;
  const completedAttendances = attendances.filter(a => a.status?.toLowerCase() === 'finalizado').length;
  const pendingAttendances = attendances.filter(a => a.status?.toLowerCase() === 'pendente').length;

  const handleCardClick = (status?: string) => {
    if (onFilterChange) {
      onFilterChange({ status });
    }
  };

  const stats = [
    {
      title: 'Total de Atendimentos',
      value: totalAttendances,
      description: 'Todos os atendimentos',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      onClick: () => handleCardClick(),
    },
    {
      title: 'Em Andamento',
      value: inProgressAttendances,
      description: 'Atendimentos ativos',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      onClick: () => handleCardClick('Em Andamento'),
    },
    {
      title: 'Aguardando',
      value: waitingAttendances,
      description: 'Aguardando resposta',
      icon: Pause,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      onClick: () => handleCardClick('Aguardando'),
    },
    {
      title: 'Finalizados',
      value: completedAttendances,
      description: 'Atendimentos concluídos',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      onClick: () => handleCardClick('Finalizado'),
    },
    {
      title: 'Pendentes',
      value: pendingAttendances,
      description: 'Requerem atenção',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      onClick: () => handleCardClick('Pendente'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={stat.title} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${stat.bgColor} border-0`}
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <CardDescription className="text-xs text-gray-600 mt-1">
                {stat.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};