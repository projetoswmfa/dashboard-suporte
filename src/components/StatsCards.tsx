import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, CheckCircle, AlertTriangle, Pause } from 'lucide-react';
import type { Attendance } from '@/types/attendance';

interface StatsCardsProps {
  data: Attendance[];
  onFilterClick?: (status: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ data, onFilterClick }) => {
  const totalAttendances = data.length;
  const pendingAttendances = data.filter(a => a.status === 'Pendente').length;
  const inProgressAttendances = data.filter(a => a.status === 'Em andamento').length;
  const waitingAttendances = data.filter(a => a.status === 'Aguardando').length;
  const completedAttendances = data.filter(a => a.status === 'Finalizado').length;
  
  // Estatísticas básicas apenas

  const stats = [
    {
      title: 'Total de Atendimentos',
      value: totalAttendances,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      clickable: true,
      filterStatus: 'active', // Mudança aqui: 'active' exclui finalizados ao filtrar
    },
    {
      title: 'Em Andamento',
      value: inProgressAttendances,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      clickable: true,
      filterStatus: 'Em andamento',
    },
    {
      title: 'Aguardando',
      value: waitingAttendances,
      icon: Pause,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      clickable: true,
      filterStatus: 'Aguardando',
    },
    {
      title: 'Finalizados',
      value: completedAttendances,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      clickable: true,
      filterStatus: 'Finalizado',
    },
    {
      title: 'Pendentes',
      value: pendingAttendances,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      clickable: true,
      filterStatus: 'Pendente',
    },
  ];

  const handleCardClick = (stat: any) => {
    if (onFilterClick) {
      onFilterClick(stat.filterStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className="shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer hover:ring-2 hover:ring-blue-200"
          onClick={() => handleCardClick(stat)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">Clique para filtrar</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor} shadow-md`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};