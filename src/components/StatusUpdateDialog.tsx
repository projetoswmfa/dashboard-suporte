import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, Clock, XCircle, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUpdateAttendance } from '@/hooks/useAttendances';
import type { Attendance } from '@/types/attendance';
import { toast } from 'sonner';

interface StatusUpdateDialogProps {
  attendance: Attendance | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  attendance,
  isOpen,
  onClose,
}) => {
  const [newStatus, setNewStatus] = useState<string>('');
  const [closeDate, setCloseDate] = useState<Date | undefined>(undefined);
  const updateAttendance = useUpdateAttendance();

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen && attendance) {
      setNewStatus(attendance.status);
      setCloseDate(attendance.close_date ? new Date(attendance.close_date) : undefined);
    }
  }, [isOpen, attendance]);

  if (!attendance) return null;

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error('Selecione um status');
      return;
    }

    const updates: Partial<Attendance> = {
      status: newStatus as 'Pendente' | 'Em andamento' | 'Aguardando' | 'Finalizado',
    };

    // Se mudou para "Finalizado", definir data de fechamento se não existir
    if (newStatus === 'Finalizado' && !closeDate) {
      updates.close_date = new Date().toISOString().split('T')[0];
    } else if (newStatus === 'Finalizado' && closeDate) {
      updates.close_date = format(closeDate, 'yyyy-MM-dd');
    } else if (newStatus !== 'Finalizado') {
      // Se não é finalizado, remover data de fechamento
      updates.close_date = null;
    }

    updateAttendance.mutate(
      { id: attendance.id, updates },
      {
        onSuccess: () => {
          toast.success('Status atualizado com sucesso!');
          onClose();
        },
        onError: () => {
          toast.error('Erro ao atualizar status');
        },
      }
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Finalizado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Em andamento':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'Aguardando':
        return <Pause className="h-4 w-4 text-orange-600" />;
      case 'Pendente':
        return <XCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(attendance.status)}
            Atualizar Status do Atendimento
          </DialogTitle>
          <DialogDescription>
            Altere o status do atendimento #{attendance.id} - {attendance.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Novo Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-yellow-600" />
                    Pendente
                  </div>
                </SelectItem>
                <SelectItem value="Em andamento">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Em andamento
                  </div>
                </SelectItem>
                <SelectItem value="Aguardando">
                  <div className="flex items-center gap-2">
                    <Pause className="h-4 w-4 text-orange-600" />
                    Aguardando
                  </div>
                </SelectItem>
                <SelectItem value="Finalizado">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Finalizado
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newStatus === 'Finalizado' && (
            <div className="space-y-2">
              <Label>Data de Conclusão</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !closeDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {closeDate ? format(closeDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={closeDate}
                    onSelect={setCloseDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Informações Atuais:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Status atual:</strong> {attendance.status}</p>
              <p><strong>Responsável:</strong> {attendance.responsible}</p>
              <p><strong>Equipe:</strong> {attendance.team}</p>
              <p><strong>Prioridade:</strong> 
                {attendance.priority === 'ALTA' && '🔥 ALTA'}
                {attendance.priority === 'MEDIA' && '⚡ MÉDIA'}
                {attendance.priority === 'BAIXA' && '🟢 BAIXA'}
              </p>
              {attendance.close_date && (
                <p><strong>Data de conclusão:</strong> {format(new Date(attendance.close_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleStatusUpdate}
            disabled={updateAttendance.isPending || !newStatus}
          >
            {updateAttendance.isPending ? 'Atualizando...' : 'Atualizar Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};