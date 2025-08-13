import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  ChevronRight, 
  ChevronDown,
  GripVertical,
  CheckSquare
} from 'lucide-react';
import { useChecklist } from '@/hooks/useChecklist';
import type { ChecklistItem } from '@/types/checklist';
import { toast } from 'sonner';

interface ChecklistComponentProps {
  attendanceId: string;
}

export const ChecklistComponent: React.FC<ChecklistComponentProps> = ({ attendanceId }) => {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  const {
    items,
    organizedItems,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
  } = useChecklist(attendanceId);

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      await addItem.mutateAsync({
        title: newItemTitle,
        description: newItemDescription,
        parent_id: selectedParent,
      });
      
      setNewItemTitle('');
      setNewItemDescription('');
      setSelectedParent(null);
      toast.success('Item adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar item');
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      await updateItem.mutateAsync({
        id: editingItem!,
        updates: {
          title: editTitle,
          description: editDescription,
        },
      });
      
      setEditingItem(null);
      setEditTitle('');
      setEditDescription('');
      toast.success('Item atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar item');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteItem.mutateAsync(itemId);
        toast.success('Item excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir item');
      }
    }
  };

  const handleToggleStatus = async (itemId: string, completed: boolean) => {
    try {
      await toggleItemStatus.mutateAsync({ id: itemId, completed });
    } catch (error) {
      toast.error('Erro ao atualizar status do item');
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderChecklistItem = (item: ChecklistItem, level: number = 0) => {
    const hasChildren = organizedItems.some(i => i.parent_id === item.id);
    const isExpanded = expandedItems.has(item.id);
    const children = organizedItems.filter(i => i.parent_id === item.id);

    return (
      <div key={item.id} className={`ml-${level * 4}`}>
        <Card className={`mb-2 ${item.completed ? 'bg-green-50' : 'bg-white'} border-l-4 ${
          item.completed ? 'border-l-green-400' : 'border-l-blue-400'
        }`}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              <GripVertical className="h-4 w-4 text-gray-400 mt-1 cursor-move" />
              
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-6 w-6"
                  onClick={() => toggleExpanded(item.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {/* Checkbox */}
              <Checkbox
                checked={item.completed}
                onCheckedChange={(checked) => handleToggleStatus(item.id, checked as boolean)}
                className="mt-1"
              />
              
              {/* Content */}
              <div className="flex-1">
                {editingItem === item.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título do item"
                    />
                    <Textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descrição (opcional)"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit} disabled={updateItem.isPending}>
                        <Save className="h-3 w-3 mr-1" />
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-3 w-3 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'completed' && 'Concluído'}
                          {item.status === 'in_progress' && 'Em Progresso'}
                          {item.status === 'pending' && 'Pendente'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {item.description && (
                      <p className={`text-sm text-gray-600 mt-1 ${item.completed ? 'line-through' : ''}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {children.map(child => renderChecklistItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <CheckSquare className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-pulse" />
          <p className="text-gray-500">Carregando checklist...</p>
        </div>
      </div>
    );
  }

  const rootItems = organizedItems.filter(item => !item.parent_id);
  const parentOptions = items.filter(item => !item.parent_id);

  return (
    <div className="space-y-4">
      {/* Add New Item Form */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium">Adicionar Novo Item</h4>
            </div>
            
            <Input
              placeholder="Título do item"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
            />
            
            <Textarea
              placeholder="Descrição (opcional)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              rows={2}
            />
            
            {parentOptions.length > 0 && (
              <select
                className="w-full p-2 border rounded-md"
                value={selectedParent || ''}
                onChange={(e) => setSelectedParent(e.target.value || null)}
              >
                <option value="">Item principal (sem pai)</option>
                {parentOptions.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            )}
            
            <Button 
              onClick={handleAddItem} 
              disabled={addItem.isPending}
              className="w-full"
            >
              {addItem.isPending ? 'Adicionando...' : 'Adicionar Item'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="space-y-2">
        {rootItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum item no checklist ainda.</p>
            <p className="text-sm">Adicione o primeiro item acima.</p>
          </div>
        ) : (
          rootItems.map(item => renderChecklistItem(item))
        )}
      </div>
    </div>
  );
};