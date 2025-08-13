import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AttendanceTable } from '@/components/AttendanceTable';
import { StatsCards } from '@/components/StatsCards';
import { FilterPanel } from '@/components/FilterPanel';
import { AddAttendanceDialog } from '@/components/AddAttendanceDialog';
import { NewTicketNotification } from '@/components/NewTicketNotification';
import { useAttendances } from '@/hooks/useAttendances';
import { useAttendanceFilters } from '@/hooks/useAttendanceFilters';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import type { Attendance } from '@/types/attendance';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';

const Index = () => {
  const { data: attendances = [], isLoading, error } = useAttendances();

  // Hook de sincronização em tempo real com notificações
  const { activeNotifications, removeNotification, markUserInteraction } = useRealtimeSync();

  // Marcar interação do usuário ao clicar em qualquer lugar da página
  useEffect(() => {
    const handleUserInteraction = () => {
      markUserInteraction();
    };

    // Adiciona listeners para diferentes tipos de interação
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('scroll', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('scroll', handleUserInteraction);
    };
  }, [markUserInteraction]);

  // Hook de filtros com comportamento inteligente para chamados finalizados
  const {
    filters,
    setSearchTerm,
    setSelectedTeam,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedResponsible,
    filteredData,
    showingFinalized,
    activeAttendances,
    finalizedAttendances,
  } = useAttendanceFilters(attendances);

  const chartData = useMemo(() => {
    const teams = ['São Paulo', 'Sul', 'Cuiabá', 'Projetos'];
    return teams.map(team => {
      const teamAttendances = filteredData.filter(a => a.team === team);
      return {
        team,
        total: teamAttendances.length,
        finalizados: teamAttendances.filter(a => a.status === 'Finalizado').length,
        emAndamento: teamAttendances.filter(a => a.status === 'Em andamento').length,
        pendentes: teamAttendances.filter(a => a.status === 'Pendente').length,
      };
    });
  }, [filteredData]);

  const statusData = useMemo(() => {
    const statusCount = filteredData.reduce((acc, attendance) => {
      acc[attendance.status] = (acc[attendance.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [filteredData]);

  const COLORS = {
    'Finalizado': '#22c55e',
    'Em andamento': '#f59e0b',
    'Pendente': '#ef4444'
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Equipe', 'Status', 'Responsável', 'Data Abertura', 'Data Conclusão', 'Prioridade', 'Ticks Concluídos', 'Descrição'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id,
        row.team,
        row.status,
        ResponsibleUtils.getDisplayString(row.responsible),
        row.open_date,
        row.close_date || 'N/A',
        row.priority,
        `${row.ticks_completed}/${row.total_ticks}`,
        row.description
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'atendimentos-ti.csv';
    a.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando atendimentos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Erro ao carregar atendimentos</p>
              <p className="text-slate-600">Por favor, tente novamente mais tarde.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-32 w-32 object-contain"
              />
            </div>
            <div className="flex gap-3">
              <AddAttendanceDialog />
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards 
          data={attendances} 
          onFilterClick={(status) => setSelectedStatus(status)} 
        />

        {/* Attendance Table */}
        <AttendanceTable data={filteredData} />

        {/* Filters */}
        <FilterPanel
          searchTerm={filters.searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTeam={filters.selectedTeam}
          setSelectedTeam={setSelectedTeam}
          selectedStatus={filters.selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedPriority={filters.selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedResponsible={filters.selectedResponsible}
          setSelectedResponsible={setSelectedResponsible}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Atendimentos por Equipe
              </CardTitle>
              <CardDescription>Volume de atendimentos distribuído por status</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="team" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="finalizados" fill="#22c55e" name="Finalizados" />
                  <Bar dataKey="emAndamento" fill="#f59e0b" name="Em Andamento" />
                  <Bar dataKey="pendentes" fill="#ef4444" name="Pendentes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Distribuição por Status
              </CardTitle>
              <CardDescription>Proporção geral dos status dos atendimentos</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notificações de novos tickets */}
      {activeNotifications.map((ticket) => (
        <NewTicketNotification
          key={ticket.id}
          ticket={ticket}
          onClose={() => removeNotification(ticket.id)}
          autoCloseDelay={8000}
        />
      ))}
    </div>
  );
};

export default Index;