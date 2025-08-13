import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateAttendance } from '@/hooks/useAttendances';
import type { CreateAttendanceData } from '@/types/attendance';
import { ResponsibleUtils } from '@/types/attendance';

export const AddAttendanceDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateAttendanceData>({
    team: '',
    responsible: '',
    priority: 'MEDIA',
    total_ticks: 1,
    description: '',
  });

  const createAttendance = useCreateAttendance();

  // Função para gerenciar seleção de responsáveis
  const handleResponsibleToggle = (responsible: string, checked: boolean) => {
    let newSelection: string[];
    if (checked) {
      newSelection = [...selectedResponsibles, responsible];
    } else {
      newSelection = selectedResponsibles.filter(r => r !== responsible);
    }
    setSelectedResponsibles(newSelection);
    setFormData(prev => ({ 
      ...prev, 
      responsible: ResponsibleUtils.toString(newSelection) 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.team || !formData.responsible || !formData.description) {
      return;
    }

    createAttendance.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setSelectedResponsibles([]);
        setFormData({
          team: '',
          responsible: '',
          priority: 'MEDIA',
          total_ticks: 1,
          description: '',
        });
      },
    });
  };

  const teams = ['São Paulo', 'Sul', 'Cuiabá', 'Projetos'];
  const responsibles = ['Junior', 'Wellington', 'José', 'Isaque'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Plus className="h-4 w-4" />
          Novo Atendimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Plus className="h-5 w-5 text-blue-600" />
            Criar Novo Atendimento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo atendimento T.I.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team">Equipe</Label>
              <Select 
                value={formData.team} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, team: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a equipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team} value={team}>{team}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsible">Responsável(is)</Label>
              <div className="space-y-2 p-3 border rounded-md">
                <p className="text-sm text-gray-600 mb-2">Selecione um ou ambos responsáveis:</p>
                {responsibles.map(responsible => (
                  <div key={responsible} className="flex items-center space-x-2">
                    <Checkbox
                      id={`responsible-${responsible}`}
                      checked={selectedResponsibles.includes(responsible)}
                      onCheckedChange={(checked) => 
                        handleResponsibleToggle(responsible, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`responsible-${responsible}`} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {responsible}
                    </Label>
                  </div>
                ))}
                {selectedResponsibles.length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <strong>Selecionados:</strong> {ResponsibleUtils.getDisplayString(formData.responsible)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'BAIXA' | 'MEDIA' | 'ALTA') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALTA">🔥 ALTA</SelectItem>
                  <SelectItem value="MEDIA">⚡ MÉDIA</SelectItem>
                  <SelectItem value="BAIXA">🟢 BAIXA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_ticks">Total de Ticks</Label>
              <Input
                id="total_ticks"
                type="number"
                min="1"
                value={formData.total_ticks}
                onChange={(e) => setFormData(prev => ({ ...prev, total_ticks: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o atendimento..."
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={createAttendance.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={createAttendance.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAttendance.isPending ? 'Criando...' : 'Criar Atendimento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};