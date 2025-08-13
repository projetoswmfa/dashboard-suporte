import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Building, AlertTriangle, Edit2, Save, X } from 'lucide-react';
import { ChecklistComponent } from './ChecklistComponent';
import { useUpdateAttendance } from '@/hooks/useAttendances';
import type { Attendance } from '@/types/attendance';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface AttendanceDetailsProps {
  attendance: Attendance | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceDetails: React.FC<AttendanceDetailsProps> = ({
  attendance,
  isOpen,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Attendance>>({});
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const updateAttendance = useUpdateAttendance();

  React.useEffect(() => {
    if (attendance && isOpen) {
      setEditData({
        team: attendance.team,
        responsible: attendance.responsible,
        status: attendance.status,
        priority: attendance.priority,
        description: attendance.description,
      });
      setSelectedResponsibles(ResponsibleUtils.fromString(attendance.responsible));
    }
  }, [attendance, isOpen]);

  if (!attendance) return null;

  const handleResponsibleToggle = (responsible: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedResponsibles, responsible];
    } else {
      newSelection = selectedResponsibles.filter(r => r !== responsible);
    }
    setSelectedResponsibles(newSelection);
    setEditData(prev => ({ 
      ...prev, 
      responsible: ResponsibleUtils.toString(newSelection) 
    }));
  };

  const handleSave = () => {
    if (!editData.team || !editData.responsible || !editData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    updateAttendance.mutate(
      { id: attendance.id, updates: editData },
      {
        onSuccess: () => {
          toast.success('Atendimento atualizado com sucesso!');
          setIsEditing(false);
        },
        onError: () => {
          toast.error('Erro ao atualizar atendimento');
        },
      }
    );
  };

  const handleCancel = () => {
    setEditData({
      team: attendance.team,
      responsible: attendance.responsible,
      status: attendance.status,
      priority: attendance.priority,
      description: attendance.description,
    });
    setSelectedResponsibles(ResponsibleUtils.fromString(attendance.responsible));
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const teams = ['São Paulo', 'Sul', 'Cuiabá', 'Projetos'];
  const responsibles = ['Junior', 'Wellington', 'José', 'Isaque'];
  const statuses = ['Pendente', 'Em andamento', 'Aguardando', 'Finalizado'];
  const priorities = ['ALTA', 'MEDIA', 'BAIXA'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building className="h-6 w-6 text-blue-600" />
                Detalhes do Atendimento #{attendance.id}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Visualize e edite as informações do atendimento
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
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
                    disabled={updateAttendance.isPending}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    {updateAttendance.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Equipe</Label>
                  {isEditing ? (
                    <Select 
                      value={editData.team} 
                      onValueChange={(value) => setEditData(prev => ({ ...prev, team: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team} value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                      {attendance.team}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>Status</Label>
                  {isEditing ? (
                    <Select 
                      value={editData.status} 
                      onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={`mt-1 ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <Label>Responsável(is)</Label>
                {isEditing ? (
                  <div className="mt-1 space-y-2 p-3 border rounded-md">
                    {responsibles.map(responsible => (
                      <div key={responsible} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-responsible-${responsible}`}
                          checked={selectedResponsibles.includes(responsible)}
                          onCheckedChange={(checked) => 
                            handleResponsibleToggle(responsible, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={`edit-responsible-${responsible}`} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {responsible}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 font-medium">
                    {ResponsibleUtils.getDisplayString(attendance.responsible)}
                  </p>
                )}
              </div>

              <div>
                <Label>Prioridade</Label>
                {isEditing ? (
                  <Select 
                    value={editData.priority} 
                    onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority === 'ALTA' && '🔥 ALTA'}
                          {priority === 'MEDIA' && '⚡ MÉDIA'}
                          {priority === 'BAIXA' && '🟢 BAIXA'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`mt-1 ${PriorityUtils.getColor(attendance.priority)}`}>
                    {attendance.priority === 'ALTA' && '🔥 ALTA'}
                    {attendance.priority === 'MEDIA' && '⚡ MÉDIA'}
                    {attendance.priority === 'BAIXA' && '🟢 BAIXA'}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="font-medium">Data de Abertura</p>
                    <p className="text-slate-600">{formatDate(attendance.open_date)}</p>
                  </div>
                </div>

                {attendance.close_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-medium">Data de Conclusão</p>
                      <p className="text-slate-600">{formatDate(attendance.close_date)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Descrição</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 p-3 bg-slate-50 rounded-md text-sm">
                    {attendance.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Checklist ({attendance.ticks_completed}/{attendance.total_ticks})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChecklistComponent attendanceId={attendance.id} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};