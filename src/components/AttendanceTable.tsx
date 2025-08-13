import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckSquare, Calendar, Eye, Edit } from 'lucide-react';
import { AttendanceDetails } from './AttendanceDetails';
import { StatusUpdateDialog } from './StatusUpdateDialog';
import type { Attendance } from '@/types/attendance';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';

interface AttendanceTableProps {
  data: Attendance[];
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ data }) => {
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Em andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Aguardando':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    return PriorityUtils.getColor(priority as 'ALTA' | 'MEDIA' | 'BAIXA');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="shadow-lg border-0 mb-8">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          Lista de Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Equipe</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Responsável</TableHead>
                <TableHead className="font-semibold">Prioridade</TableHead>
                <TableHead className="font-semibold">Data Abertura</TableHead>
                <TableHead className="font-semibold">Data Conclusão</TableHead>
                <TableHead className="font-semibold">Progresso Ticks</TableHead>
                <TableHead className="font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((attendance, index) => (
                <React.Fragment key={attendance.id}>
                  {/* Linha principal do chamado */}
                  <TableRow className="hover:bg-slate-50 transition-colors border-b-0 group">
                    <TableCell className="font-medium">{attendance.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {attendance.team}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(attendance.status)}>
                        {attendance.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ResponsibleUtils.getDisplayString(attendance.responsible)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(attendance.priority)}>
                        {attendance.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(attendance.open_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {attendance.close_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(attendance.close_date)}
                        </div>
                      ) : (
                        <span className="text-slate-400">Em aberto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{attendance.ticks_completed}/{attendance.total_ticks}</span>
                          <span>{Math.round((attendance.ticks_completed / attendance.total_ticks) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(attendance.ticks_completed / attendance.total_ticks) * 100} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAttendance(attendance);
                            setIsDetailsOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Detalhes
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAttendance(attendance);
                            setIsStatusUpdateOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Status
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Linha de descrição integrada */}
                  <TableRow className={`border-b-0 group-hover:bg-slate-50 ${index < data.length - 1 ? 'border-b-2 border-b-slate-300' : ''}`}>
                    <TableCell colSpan={8} className="py-2 px-4 bg-slate-50/50 border-l-4 border-l-blue-300">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-700">Atendimento:</span> 
                        <span className="text-slate-600 ml-1">{attendance.description}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Espaçamento entre chamados diferentes */}
                  {index < data.length - 1 && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0 h-3 bg-slate-100/30"></TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          {data.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <CheckSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhum atendimento encontrado com os filtros aplicados.</p>
            </div>
          )}
        </div>
      </CardContent>

      <AttendanceDetails
        attendance={selectedAttendance}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      
      <StatusUpdateDialog
        attendance={selectedAttendance}
        isOpen={isStatusUpdateOpen}
        onClose={() => setIsStatusUpdateOpen(false)}
      />
    </Card>
  );
};