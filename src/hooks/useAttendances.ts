
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Attendance, CreateAttendanceData } from '@/types/attendance';
import { toast } from 'sonner';
import { useRealtimeSync } from './useRealtimeSync';

export const useAttendances = () => {
  // Ativa sincronização em tempo real automaticamente
  useRealtimeSync();
  
  return useQuery({
    queryKey: ['attendances'],
    queryFn: async (): Promise<Attendance[]> => {
      const { data, error } = await supabase
        .from('attendances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendances:', error);
        throw error;
      }

      return data.map(item => ({
        ...item,
        openDate: item.open_date,
        closeDate: item.close_date,
        ticksCompleted: item.ticks_completed,
        totalTicks: item.total_ticks,
      })) as Attendance[];
    },
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAttendanceData): Promise<Attendance> => {
      // Generate ID automatically
      const id = `AT${String(Date.now()).slice(-6)}`;

      const newAttendance = {
        id,
        team: data.team,
        status: 'Pendente' as const,
        responsible: data.responsible,
        priority: data.priority,
        ticks_completed: 0,
        total_ticks: data.total_ticks,
        description: data.description,
      };

      const { data: result, error } = await supabase
        .from('attendances')
        .insert([newAttendance])
        .select()
        .single();

      if (error) {
        console.error('Error creating attendance:', error);
        throw error;
      }

      return {
        ...result,
        openDate: result.open_date,
        closeDate: result.close_date,
        ticksCompleted: result.ticks_completed,
        totalTicks: result.total_ticks,
      } as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Atendimento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating attendance:', error);
      toast.error('Erro ao criar atendimento');
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Attendance> }) => {
      const { data, error } = await supabase
        .from('attendances')
        .update({
          ...updates,
          open_date: updates.openDate,
          close_date: updates.closeDate,
          ticks_completed: updates.ticksCompleted,
          total_ticks: updates.totalTicks,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating attendance:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      toast.success('Atendimento atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating attendance:', error);
      toast.error('Erro ao atualizar atendimento');
    },
  });
};