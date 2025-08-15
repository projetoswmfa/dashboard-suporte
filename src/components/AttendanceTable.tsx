import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Edit, Calendar, User, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { AttendanceDetails } from './AttendanceDetails';
import { StatusUpdateDialog } from './StatusUpdateDialog';
import type { Attendance } from '@/types/attendance';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';

interface AttendanceTableProps {
  attendances: Attendance[];
  isLoading?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  attendances, 
  isLoading = false 
}) => {
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [statusUpdateAttendance, setStatusUpdateAttendance] = useState<Attendance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aberto':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aguardando':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'finalizado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    return PriorityUtils.getColor(priority);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = (attendance: Attendance) => {
    setStatusUpdateAttendance(attendance);
    setIsStatusUpdateOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aberto':
        return <AlertCircle className="h-4 w-4" />;
      case 'em andamento':
        return <Clock className="h-4 w-4" />;
      case 'aguardando':
        return <Clock className="h-4 w-4" />;
      case 'finalizado':
        return <CheckCircle className="h-4 w-4" />;
      case 'pendente':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atendimentos</CardTitle>
          <CardDescription>Lista de todos os atendimentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Atendimentos
          </CardTitle>
          <CardDescription>
            Lista de todos os atendimentos ({attendances.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum atendimento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendances.map((attendance, index) => {
                const progress = attendance.total_ticks && attendance.total_ticks > 0 
                  ? Math.round(((attendance.completed_ticks || 0) / attendance.total_ticks) * 100)
                  : 0;

                return (
                  <div key={attendance.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{attendance.id}
                          </Badge>
                          <Badge className={getStatusColor(attendance.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(attendance.status)}
                              {attendance.status}
                            </div>
                          </Badge>
                          <Badge className={`text-white ${getPriorityColor(attendance.priority)}`}>
                            {attendance.priority}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{attendance.client_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>{attendance.team}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(attendance.created_at)}</span>
                          </div>
                          {attendance.closed_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">
                                Fechado: {formatDate(attendance.closed_at)}
                              </span>
                            </div>
                          )}
                        </div>

                        {attendance.total_ticks && attendance.total_ticks > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>Progresso</span>
                              <span>{attendance.completed_ticks || 0}/{attendance.total_ticks} ({progress}%)</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(attendance)}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(attendance)}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Status
                        </Button>
                      </div>
                    </div>
                    
                    {/* Descrição integrada */}
                    {attendance.description && (
                      <div className="ml-4 pl-4 border-l-2 border-gray-200">
                        <p className="text-sm text-gray-600 italic">
                          {attendance.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Espaçamento entre chamados */}
                    {index < attendances.length - 1 && (
                      <div className="border-b border-gray-100 my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AttendanceDetails
        attendance={selectedAttendance}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
      
      <StatusUpdateDialog
        attendance={statusUpdateAttendance}
        open={isStatusUpdateOpen}
        onOpenChange={setIsStatusUpdateOpen}
      />
    </>
  );
};