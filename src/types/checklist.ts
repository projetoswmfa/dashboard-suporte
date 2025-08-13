import type { Tables } from '@/integrations/supabase/types';

export type ChecklistItem = Tables<'checklist_items'>;

export type ChecklistItemInsert = {
  attendance_id: string;
  title: string;
  description?: string;
  completed?: boolean;
  status?: 'Aguardando Início' | 'Em Progresso';
  order_index?: number;
  parent_id?: string | null;
};

export type ChecklistItemUpdate = {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  status?: 'Aguardando Início' | 'Em Progresso';
  order_index?: number;
  parent_id?: string | null;
};