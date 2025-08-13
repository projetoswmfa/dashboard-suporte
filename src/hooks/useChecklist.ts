import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ChecklistItem, ChecklistItemInsert, ChecklistItemUpdate, ChecklistItemWithChildren } from '@/types/checklist';

// Função para organizar itens em hierarquia
const organizeItemsHierarchy = (items: ChecklistItem[]): ChecklistItemWithChildren[] => {
  const itemMap = new Map<string, ChecklistItemWithChildren>();
  const rootItems: ChecklistItemWithChildren[] = [];

  // Primeiro, criar o mapa de todos os itens
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      children: [],
      level: 0
    });
  });

  // Depois, organizar a hierarquia
  items.forEach(item => {
    const itemWithChildren = itemMap.get(item.id)!;
    
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        itemWithChildren.level = parent.level + 1;
        parent.children.push(itemWithChildren);
      } else {
        // Se o pai não existe, tratar como item raiz
        rootItems.push(itemWithChildren);
      }
    } else {
      rootItems.push(itemWithChildren);
    }
  });

  // Ordenar recursivamente por order_index
  const sortItems = (items: ChecklistItemWithChildren[]) => {
    items.sort((a, b) => a.order_index - b.order_index);
    items.forEach(item => {
      if (item.children.length > 0) {
        sortItems(item.children);
      }
    });
  };

  sortItems(rootItems);
  return rootItems;
};

// Função para achatar a hierarquia para exibição
const flattenHierarchy = (items: ChecklistItemWithChildren[]): ChecklistItemWithChildren[] => {
  const result: ChecklistItemWithChildren[] = [];
  
  const addItems = (items: ChecklistItemWithChildren[]) => {
    items.forEach(item => {
      result.push(item);
      if (item.children.length > 0) {
        addItems(item.children);
      }
    });
  };
  
  addItems(items);
  return result;
};

export const useChecklist = (attendanceId: string) => {
  const queryClient = useQueryClient();

  // Buscar itens do checklist
  const { data: rawChecklistItems = [], isLoading, error } = useQuery({
    queryKey: ['checklist', attendanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('attendance_id', attendanceId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as ChecklistItem[];
    },
    enabled: !!attendanceId,
  });

  // Organizar itens em hierarquia
  const hierarchicalItems = organizeItemsHierarchy(rawChecklistItems);
  const checklistItems = flattenHierarchy(hierarchicalItems);

  // Adicionar item ao checklist
  const addItemMutation = useMutation({
    mutationFn: async (item: ChecklistItemInsert) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', attendanceId] });
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });

  // Atualizar item do checklist
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: ChecklistItemUpdate) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', attendanceId] });
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });

  // Deletar item do checklist
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', attendanceId] });
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });

  // Toggle status do item
  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', attendanceId] });
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
    },
  });

  return {
    checklistItems,
    isLoading,
    error,
    addItem: addItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    toggleItem: toggleItemMutation.mutate,
    isAdding: addItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isToggling: toggleItemMutation.isPending,
  };
};