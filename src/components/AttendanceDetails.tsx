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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, Users, Clock, CheckCircle, Edit, Save, X } from 'lucide-react';
import { ChecklistComponent } from './ChecklistComponent';
import { useUpdateAttendance } from '@/hooks/useAttendances';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';
import type { Attendance } from '@/types/attendance';
import { toast } from 'sonner';

interface AttendanceDetailsProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AttendanceDetails: React.FC<AttendanceDetailsProps> = ({
  attendance,
  open,
  onOpenChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    client_name: '',
    team: '',
    responsible: [] as string[],
    status: '',
    priority: '',
    description: '',
  });

  const { updateAttendance, isUpdating } = useUpdateAttendance();

  const teams = [
    'Suporte Técnico',
    'Desenvolvimento',
    'Infraestrutura',
    'Segurança',
    'Qualidade',
    'Comercial'
  ];

  const statuses = [
    'Aberto',
    'Em Andamento',
    'Aguardando',
    'Finalizado',
    'Pendente'
  ];

  useEffect(() => {
    if (attendance) {
      setEditForm({
        client_name: attendance.client_name,
        team: attendance.team,
        responsible: Array.isArray(attendance.responsible) 
          ? attendance.responsible 
          : [attendance.responsible].filter(Boolean),
        status: attendance.status,
        priority: attendance.priority,
        description: attendance.description || '',
      });
    }
  }, [attendance]);

  const handleSave = async () => {
    if (!attendance) return;

    if (!editForm.client_name.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    if (!editForm.team) {
      toast.error('Equipe é obrigatória');
      return;
    }

    if (editForm.responsible.length === 0) {
      toast.error('Pelo menos um responsável deve ser selecionado');
      return;
    }

    if (!editForm.status) {
      toast.error('Status é obrigatório');
      return;
    }

    if (!editForm.priority) {
      toast.error('Prioridade é obrigatória');
      return;
    }

    try {
      await updateAttendance({
        id: attendance.id,
        client_name: editForm.client_name.trim(),
        team: editForm.team,
        responsible: editForm.responsible,
        status: editForm.status,
        priority: editForm.priority,
        description: editForm.description.trim() || null,
      });

      setIsEditing(false);
      toast.success('Atendimento atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar atendimento:', error);
      toast.error('Erro ao atualizar atendimento. Tente novamente.');
    }
  };

  const handleCancel = () => {
    if (attendance) {
      setEditForm({
        client_name: attendance.client_name,
        team: attendance.team,
        responsible: Array.isArray(attendance.responsible) 
          ? attendance.responsible 
          : [attendance.responsible].filter(Boolean),
        status: attendance.status,
        priority: attendance.priority,
        description: attendance.description || '',
      });
    }
    setIsEditing(false);
  };

  const handleResponsibleChange = (responsible: string, checked: boolean) => {
    if (checked) {
      setEditForm(prev => ({
        ...prev,
        responsible: [...prev.responsible, responsible]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        responsible: prev.responsible.filter(r => r !== responsible)
      }));
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

  if (!attendance) return null;

  const progress = attendance.total_ticks && attendance.total_ticks > 0 
    ? Math.round(((attendance.completed_ticks || 0) / attendance.total_ticks) * 100)
    : 0;

  const responsibleArray = Array.isArray(attendance.responsible) 
    ? attendance.responsible 
    : [attendance.responsible].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="outline">#{attendance.id}</Badge>
                Detalhes do Atendimento
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Editando informações do atendimento' : 'Visualizando informações do atendimento'}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            /* Modo de Edição */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-client-name">Nome do Cliente *</Label>
                  <Input
                    id="edit-client-name"
                    value={editForm.client_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, client_name: e.target.value }))}
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-team">Equipe *</Label>
                  <Select 
                    value={editForm.team} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, team: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Responsáveis *</Label>
                <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {ResponsibleUtils.getAllResponsibles().map((responsible) => (
                    <div key={responsible} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${responsible}`}
                        checked={editForm.responsible.includes(responsible)}
                        onCheckedChange={(checked) => 
                          handleResponsibleChange(responsible, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`edit-${responsible}`} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {responsible}
                      </Label>
                    </div>
                  ))}
                </div>
                {editForm.responsible.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Responsáveis selecionados:</p>
                    <div className="flex flex-wrap gap-1">
                      {editForm.responsible.map((responsible) => (
                        <span 
                          key={responsible} 
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                        >
                          {responsible}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status *</Label>
                  <Select 
                    value={editForm.status} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
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
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Prioridade *</Label>
                  <Select 
                    value={editForm.priority} 
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {PriorityUtils.getAllPriorities().map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-2 h-2 rounded-full ${PriorityUtils.getColor(priority)}`}
                            />
                            {priority}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o problema ou solicitação..."
                  rows={4}
                />
              </div>
            </div>
          ) : (
            /* Modo de Visualização */
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                      <p className="text-sm font-medium">{attendance.client_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Equipe</Label>
                      <p className="text-sm font-medium">{attendance.team}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Responsável(is)</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {responsibleArray.map((responsible) => (
                        <Badge key={responsible} variant="secondary">
                          {responsible}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Data de Abertura</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(attendance.created_at)}</span>
                      </div>
                    </div>
                    {attendance.closed_at && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Data de Fechamento</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">{formatDate(attendance.closed_at)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(attendance.status)}>
                          {attendance.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Prioridade</Label>
                      <div className="mt-1">
                        <Badge className={`text-white ${PriorityUtils.getColor(attendance.priority)}`}>
                          {attendance.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {attendance.total_ticks && attendance.total_ticks > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Progresso</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex justify-between text-sm">
                          <span>Ticks Concluídos</span>
                          <span>{attendance.completed_ticks || 0}/{attendance.total_ticks} ({progress}%)</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  )}

                  {attendance.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                      <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                        {attendance.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Checklist Component */}
              <ChecklistComponent 
                attendanceId={attendance.id} 
                attendanceDescription={attendance.description || `Atendimento para ${attendance.client_name}`}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};