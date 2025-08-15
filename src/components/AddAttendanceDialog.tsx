import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { useCreateAttendance } from '@/hooks/useAttendances';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';
import { toast } from 'sonner';

interface AddAttendanceDialogProps {
  onSuccess?: () => void;
}

export const AddAttendanceDialog: React.FC<AddAttendanceDialogProps> = ({ onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [team, setTeam] = useState('');
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [priority, setPriority] = useState('');
  const [totalTicks, setTotalTicks] = useState('');
  const [description, setDescription] = useState('');

  const { createAttendance, isCreating } = useCreateAttendance();

  const teams = [
    'Suporte Técnico',
    'Desenvolvimento',
    'Infraestrutura',
    'Segurança',
    'Qualidade',
    'Comercial'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }

    if (!team) {
      toast.error('Equipe é obrigatória');
      return;
    }

    if (selectedResponsibles.length === 0) {
      toast.error('Pelo menos um responsável deve ser selecionado');
      return;
    }

    if (!priority) {
      toast.error('Prioridade é obrigatória');
      return;
    }

    const ticksNumber = totalTicks ? parseInt(totalTicks, 10) : 0;
    if (totalTicks && (isNaN(ticksNumber) || ticksNumber < 0)) {
      toast.error('Total de ticks deve ser um número válido');
      return;
    }

    try {
      await createAttendance({
        client_name: clientName.trim(),
        team,
        responsible: selectedResponsibles,
        priority,
        total_ticks: ticksNumber || null,
        description: description.trim() || null,
      });

      // Reset form
      setClientName('');
      setTeam('');
      setSelectedResponsibles([]);
      setPriority('');
      setTotalTicks('');
      setDescription('');
      setOpen(false);

      toast.success('Atendimento criado com sucesso!');
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar atendimento:', error);
      toast.error('Erro ao criar atendimento. Tente novamente.');
    }
  };

  const handleResponsibleChange = (responsible: string, checked: boolean) => {
    if (checked) {
      setSelectedResponsibles(prev => [...prev, responsible]);
    } else {
      setSelectedResponsibles(prev => prev.filter(r => r !== responsible));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Atendimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Atendimento</DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo atendimento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nome do Cliente *</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: João Silva"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Equipe *</Label>
              <Select value={team} onValueChange={setTeam} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a equipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((teamOption) => (
                    <SelectItem key={teamOption} value={teamOption}>
                      {teamOption}
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
                    id={responsible}
                    checked={selectedResponsibles.includes(responsible)}
                    onCheckedChange={(checked) => 
                      handleResponsibleChange(responsible, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={responsible} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {responsible}
                  </Label>
                </div>
              ))}
            </div>
            {selectedResponsibles.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Responsáveis selecionados:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedResponsibles.map((responsible) => (
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
              <Label htmlFor="priority">Prioridade *</Label>
              <Select value={priority} onValueChange={setPriority} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {PriorityUtils.getAllPriorities().map((priorityOption) => (
                    <SelectItem key={priorityOption} value={priorityOption}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${PriorityUtils.getColor(priorityOption)}`}
                        />
                        {priorityOption}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-ticks">Total de Ticks</Label>
              <Input
                id="total-ticks"
                type="number"
                min="0"
                value={totalTicks}
                onChange={(e) => setTotalTicks(e.target.value)}
                placeholder="Ex: 10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema ou solicitação..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Atendimento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};