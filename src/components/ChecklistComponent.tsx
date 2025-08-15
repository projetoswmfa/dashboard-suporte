import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, Clock, Play, ChevronRight, ChevronDown, Indent } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChecklist } from '@/hooks/useChecklist';
import type { ChecklistItem, ChecklistItemWithChildren } from '@/types/checklist';
import { toast } from 'sonner';

interface ChecklistComponentProps {
  attendanceId: string;
  attendanceDescription: string;
}

export const ChecklistComponent: React.FC<ChecklistComponentProps> = ({ 
  attendanceId, 
  attendanceDescription 
}) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddSubItemDialogOpen, setIsAddSubItemDialogOpen] = useState(false);
  const [parentItemForSubItem, setParentItemForSubItem] = useState<string | null>(null);
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());

  const {
    checklistItems,
    hierarchicalItems,
    isLoading,
    addItem,
    addSubItem,
    updateItem,
    deleteItem,
    toggleItem,
    getTotalItemsCount,
    getCompletedItemsCount,
    isAdding,
    isUpdating,
    isDeleting,
    isToggling,
  } = useChecklist(attendanceId);

  const completedItems = getCompletedItemsCount();
  const totalItems = getTotalItemsCount();
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddItem = () => {
    if (!newItemTitle.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    addItem({
      attendance_id: attendanceId,
      title: newItemTitle.trim(),
      description: newItemDescription.trim() || undefined,
      order_index: checklistItems.length,
    });

    setNewItemTitle('');
    setNewItemDescription('');
    setIsAddDialogOpen(false);
    toast.success('Item adicionado ao checklist');
  };

  const handleAddSubItem = () => {
    if (!newItemTitle.trim() || !parentItemForSubItem) {
      toast.error('Título é obrigatório');
      return;
    }

    addSubItem(parentItemForSubItem, {
      attendance_id: attendanceId,
      title: newItemTitle.trim(),
      description: newItemDescription.trim() || undefined,
      order_index: 0,
    });

    setNewItemTitle('');
    setNewItemDescription('');
    setIsAddSubItemDialogOpen(false);
    setParentItemForSubItem(null);
    toast.success('Sub-item adicionado ao checklist');
  };

  const toggleCollapse = (itemId: string) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(itemId)) {
      newCollapsed.delete(itemId);
    } else {
      newCollapsed.add(itemId);
    }
    setCollapsedItems(newCollapsed);
  };

  const openAddSubItemDialog = (parentId: string) => {
    setParentItemForSubItem(parentId);
    setIsAddSubItemDialogOpen(true);
  };

  const handleEditItem = () => {
    if (!editingItem || !editingItem.title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    updateItem({
      id: editingItem.id,
      title: editingItem.title.trim(),
      description: editingItem.description?.trim() || null,
    });

    setEditingItem(null);
    setIsEditDialogOpen(false);
    toast.success('Item atualizado');
  };

  const handleToggleItem = (item: ChecklistItem) => {
    toggleItem({ id: item.id, completed: !item.completed });
    toast.success(item.completed ? 'Item desmarcado' : 'Item concluído');
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    toast.success('Item removido do checklist');
  };

  const handleStatusChange = (item: ChecklistItem, newStatus: 'Aguardando Início' | 'Em Progresso') => {
    updateItem({
      id: item.id,
      status: newStatus,
    });
    toast.success(`Status alterado para "${newStatus}"`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Progresso':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'Aguardando Início':
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Progresso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Aguardando Início':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  // Função para renderizar itens hierarquicamente
  const renderChecklistItems = () => {
    const renderItem = (item: ChecklistItemWithChildren, isVisible: boolean = true) => {
      if (!isVisible) return null;
      
      const hasChildren = item.children && item.children.length > 0;
      const isCollapsed = collapsedItems.has(item.id);
      const indentLevel = item.level * 24; // 24px por nível
      
      return (
        <div key={item.id}>
          <div
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
              item.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            style={{ marginLeft: `${indentLevel}px` }}
          >
            {/* Collapse/Expand button para itens com filhos */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6 mt-0.5"
                onClick={() => toggleCollapse(item.id)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Espaçamento para itens sem filhos */}
            {!hasChildren && <div className="w-6" />}
            
            <div className="mt-0.5">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleToggleItem(item)}
                disabled={isToggling}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Ícone de indentação para sub-itens */}
                {item.level > 0 && (
                  <Indent className="h-4 w-4 text-gray-400" />
                )}
                <h4 className={`font-medium ${item.completed ? 'line-through text-green-800' : 'text-gray-900'}`}>
                  {item.title}
                </h4>
                {!item.completed && (
                  <Badge className={getStatusColor(item.status || 'Aguardando Início')}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status || 'Aguardando Início')}
                      <span className="text-xs">{item.status || 'Aguardando Início'}</span>
                    </div>
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className={`text-sm mt-1 ${item.completed ? 'line-through text-green-600' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              )}
              {!item.completed && (
                <div className="mt-2">
                  <Select 
                    value={item.status || 'Aguardando Início'} 
                    onValueChange={(value: 'Aguardando Início' | 'Em Progresso') => handleStatusChange(item, value)}
                  >
                    <SelectTrigger className="w-40 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aguardando Início">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-orange-600" />
                          Aguardando Início
                        </div>
                      </SelectItem>
                      <SelectItem value="Em Progresso">
                        <div className="flex items-center gap-2">
                          <Play className="h-3 w-3 text-blue-600" />
                          Em Progresso
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Botão para adicionar sub-item */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAddSubItemDialog(item.id)}
                disabled={isAdding}
                title="Adicionar sub-item"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingItem(item);
                  setIsEditDialogOpen(true);
                }}
                disabled={isUpdating}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Renderizar filhos se não estiver colapsado */}
          {hasChildren && !isCollapsed && (
            <div className="mt-1">
              {item.children.map(child => renderItem(child, true))}
            </div>
          )}
        </div>
      );
    };

    return hierarchicalItems.map(item => renderItem(item));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Checklist do Atendimento
            </CardTitle>
            <CardDescription className="mt-1">
              {attendanceDescription}
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Item ao Checklist</DialogTitle>
                <DialogDescription>
                  Adicione um novo item ao checklist deste atendimento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Ex: Configurar servidor de backup"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Detalhes opcionais sobre este item..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem} disabled={isAdding}>
                  {isAdding ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso</span>
            <Badge variant={progressPercentage === 100 ? 'default' : 'secondary'}>
              {completedItems}/{totalItems} ({progressPercentage}%)
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {checklistItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item no checklist ainda.</p>
            <p className="text-sm">Clique em "Adicionar Item" para começar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {renderChecklistItems()}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Item do Checklist</DialogTitle>
              <DialogDescription>
                Faça as alterações necessárias no item do checklist.
              </DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Título *</Label>
                  <Input
                    id="edit-title"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Ex: Configurar servidor de backup"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Detalhes opcionais sobre este item..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditItem} disabled={isUpdating}>
                {isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};