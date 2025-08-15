import { useState, useCallback } from 'react';

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: 'pending' | 'in_progress' | 'completed';
  parentId?: string;
  children?: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const mockChecklists: Checklist[] = [
  {
    id: '1',
    title: 'Configuração Inicial do Sistema',
    description: 'Checklist para configuração inicial do sistema de suporte',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    items: [
      {
        id: '1-1',
        title: 'Configurar banco de dados',
        description: 'Configurar conexão com Supabase',
        completed: true,
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '1-2',
        title: 'Configurar autenticação',
        description: 'Implementar sistema de login e registro',
        completed: false,
        status: 'in_progress',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        children: [
          {
            id: '1-2-1',
            title: 'Configurar providers OAuth',
            completed: true,
            status: 'completed',
            parentId: '1-2',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
          {
            id: '1-2-2',
            title: 'Implementar middleware de auth',
            completed: false,
            status: 'pending',
            parentId: '1-2',
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
          },
        ],
      },
      {
        id: '1-3',
        title: 'Configurar interface do usuário',
        description: 'Implementar componentes base da UI',
        completed: false,
        status: 'pending',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
    ],
  },
  {
    id: '2',
    title: 'Funcionalidades de Atendimento',
    description: 'Implementação das funcionalidades principais de atendimento',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    items: [
      {
        id: '2-1',
        title: 'Sistema de tickets',
        description: 'Criar, editar e gerenciar tickets',
        completed: false,
        status: 'in_progress',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: '2-2',
        title: 'Notificações em tempo real',
        description: 'Implementar sistema de notificações',
        completed: false,
        status: 'pending',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
    ],
  },
];

export function useChecklist() {
  const [checklists, setChecklists] = useState<Checklist[]>(mockChecklists);
  const [loading, setLoading] = useState(false);

  const addChecklist = useCallback((title: string, description?: string) => {
    const newChecklist: Checklist = {
      id: Date.now().toString(),
      title,
      description,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChecklists(prev => [...prev, newChecklist]);
    return newChecklist;
  }, []);

  const updateChecklist = useCallback((id: string, updates: Partial<Checklist>) => {
    setChecklists(prev => 
      prev.map(checklist => 
        checklist.id === id 
          ? { ...checklist, ...updates, updatedAt: new Date() }
          : checklist
      )
    );
  }, []);

  const deleteChecklist = useCallback((id: string) => {
    setChecklists(prev => prev.filter(checklist => checklist.id !== id));
  }, []);

  const addItem = useCallback((checklistId: string, title: string, description?: string, parentId?: string) => {
    const newItem: ChecklistItem = {
      id: `${checklistId}-${Date.now()}`,
      title,
      description,
      completed: false,
      status: 'pending',
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChecklists(prev => 
      prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;

        const addItemToList = (items: ChecklistItem[]): ChecklistItem[] => {
          if (!parentId) {
            return [...items, newItem];
          }
          
          return items.map(item => {
            if (item.id === parentId) {
              return {
                ...item,
                children: [...(item.children || []), newItem],
                updatedAt: new Date(),
              };
            }
            if (item.children) {
              return {
                ...item,
                children: addItemToList(item.children),
              };
            }
            return item;
          });
        };

        return {
          ...checklist,
          items: addItemToList(checklist.items),
          updatedAt: new Date(),
        };
      })
    );

    return newItem;
  }, []);

  const updateItem = useCallback((checklistId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setChecklists(prev => 
      prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;

        const updateItemInList = (items: ChecklistItem[]): ChecklistItem[] => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, ...updates, updatedAt: new Date() };
            }
            if (item.children) {
              return {
                ...item,
                children: updateItemInList(item.children),
              };
            }
            return item;
          });
        };

        return {
          ...checklist,
          items: updateItemInList(checklist.items),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const deleteItem = useCallback((checklistId: string, itemId: string) => {
    setChecklists(prev => 
      prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;

        const deleteItemFromList = (items: ChecklistItem[]): ChecklistItem[] => {
          return items
            .filter(item => item.id !== itemId)
            .map(item => ({
              ...item,
              children: item.children ? deleteItemFromList(item.children) : undefined,
            }));
        };

        return {
          ...checklist,
          items: deleteItemFromList(checklist.items),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const toggleItemCompleted = useCallback((checklistId: string, itemId: string) => {
    setChecklists(prev => 
      prev.map(checklist => {
        if (checklist.id !== checklistId) return checklist;

        const toggleItemInList = (items: ChecklistItem[]): ChecklistItem[] => {
          return items.map(item => {
            if (item.id === itemId) {
              const completed = !item.completed;
              return {
                ...item,
                completed,
                status: completed ? 'completed' : 'pending',
                updatedAt: new Date(),
              };
            }
            if (item.children) {
              return {
                ...item,
                children: toggleItemInList(item.children),
              };
            }
            return item;
          });
        };

        return {
          ...checklist,
          items: toggleItemInList(checklist.items),
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const getProgress = useCallback((checklist: Checklist) => {
    const countItems = (items: ChecklistItem[]): { total: number; completed: number } => {
      let total = 0;
      let completed = 0;

      items.forEach(item => {
        total++;
        if (item.completed) completed++;
        
        if (item.children) {
          const childCounts = countItems(item.children);
          total += childCounts.total;
          completed += childCounts.completed;
        }
      });

      return { total, completed };
    };

    const { total, completed } = countItems(checklist.items);
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, []);

  return {
    checklists,
    loading,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    addItem,
    updateItem,
    deleteItem,
    toggleItemCompleted,
    getProgress,
  };
}