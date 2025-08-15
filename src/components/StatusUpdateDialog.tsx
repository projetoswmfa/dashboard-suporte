import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Users } from 'lucide-react';
import { useUpdateAttendance } from '@/hooks/useAttendances';
import type { Attendance } from '@/types/attendance';
import { toast } from 'sonner';

interface StatusUpdateDialogProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  attendance,
  open,
  onOpenChange,
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [closedDate, setClosedDate] = useState('');
  
  const { updateAttendance, isUpdating } = useUpdateAttendance();

  const statuses = [
    'Aberto',
    'Em Andamento',
    'Aguardando',
    'Finalizado',
    'Pendente'
  ];

  useEffect(() => {
    if (attendance) {
      setNewStatus(attendance.status);
      // Se já tem data de fechamento, usar ela, senão usar data atual se status for Finalizado
      if (attendance.closed_at) {
        setClosedDate(new Date(attendance.closed_at).toISOString().slice(0, 16));
      } else if (attendance.status === 'Finalizado') {
        setClosedDate(new Date().toISOString().slice(0, 16));
      } else {
        setClosedDate('');
      }
    }
  }, [attendance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attendance || !newStatus) {
      toast.error('Status é obrigatório');
      return;
    }

    if (newStatus === 'Finalizado' && !closedDate) {
      toast.error('Data de conclusão é obrigatória para status "Finalizado"');
      return;
    }

    try {
      const updateData: any = {
        id: attendance.id,
        status: newStatus,
      };

      // Se o status for "Finalizado", incluir a data de fechamento
      if (newStatus === 'Finalizado') {
        updateData.closed_at = new Date(closedDate).toISOString();
      } else {
        // Se não for finalizado, remover a data de fechamento
        updateData.closed_at = null;
      }

      await updateAttendance(updateData);
      
      onOpenChange(false);
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status. Tente novamente.');
    }
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!attendance) return null;

  const responsibleArray = Array.isArray(attendance.responsible) 
    ? attendance.responsible 
    : [attendance.responsible].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant="outline">#{attendance.id}</Badge>
            Atualizar Status
          </DialogTitle>
          <DialogDescription>
            Altere o status do atendimento e defina a data de conclusão se necessário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações atuais do atendimento */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{attendance.client_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{attendance.team}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Aberto em: {formatDate(attendance.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Status atual:</span>
              <Badge className={getStatusColor(attendance.status)}>
                {attendance.status}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-gray-500">Responsável(is): </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {responsibleArray.map((responsible) => (
                  <Badge key={responsible} variant="secondary" className="text-xs">
                    {responsible}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Novo Status *</Label>
              <Select value={newStatus} onValueChange={setNewStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge className={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'Finalizado' && (
              <div className="space-y-2">
                <Label htmlFor="closed-date">Data de Conclusão *</Label>
                <Input
                  id="closed-date"
                  type="datetime-local"
                  value={closedDate}
                  onChange={(e) => setClosedDate(e.target.value)}
                  required
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Atualizando...' : 'Atualizar Status'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};