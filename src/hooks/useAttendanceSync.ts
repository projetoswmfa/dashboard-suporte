import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para sincronizar automaticamente o progresso dos checklists
 * com os campos ticks_completed e total_ticks dos atendimentos
 */
export const useAttendanceSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncAttendanceProgress = async (attendanceId: string) => {
      try {
        // Buscar todos os itens do checklist para este atendimento
        const { data: checklistItems, error: checklistError } = await supabase
          .from('checklist_items')
          .select('completed')
          .eq('attendance_id', attendanceId);

        if (checklistError) {
          console.error('Erro ao buscar itens do checklist:', checklistError);
          return;
        }

        const totalTicks = checklistItems.length;
        const ticksCompleted = checklistItems.filter(item => item.completed).length;

        // Atualizar o atendimento com o progresso atual
        const { error: updateError } = await supabase
          .from('attendances')
          .update({
            ticks_completed: ticksCompleted,
            total_ticks: totalTicks,
          })
          .eq('id', attendanceId);

        if (updateError) {
          console.error('Erro ao atualizar progresso do atendimento:', updateError);
          return;
        }

        // Invalidar queries para refletir as mudanças
        queryClient.invalidateQueries({ queryKey: ['attendances'] });
        queryClient.invalidateQueries({ queryKey: ['checklist', attendanceId] });

      } catch (error) {
        console.error('Erro na sincronização do progresso:', error);
      }
    };

    // Função para sincronizar múltiplos atendimentos
    const syncAllAttendances = async () => {
      try {
        const { data: attendances, error } = await supabase
          .from('attendances')
          .select('id');

        if (error) {
          console.error('Erro ao buscar atendimentos:', error);
          return;
        }

        // Sincronizar cada atendimento
        for (const attendance of attendances) {
          await syncAttendanceProgress(attendance.id);
        }
      } catch (error) {
        console.error('Erro na sincronização geral:', error);
      }
    };

    // Executar sincronização inicial
    syncAllAttendances();

    // Configurar listeners para mudanças em tempo real
    const checklistSubscription = supabase
      .channel('checklist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items',
        },
        (payload) => {
          if (payload.new && 'attendance_id' in payload.new) {
            syncAttendanceProgress(payload.new.attendance_id as string);
          } else if (payload.old && 'attendance_id' in payload.old) {
            syncAttendanceProgress(payload.old.attendance_id as string);
          }
        }
      )
      .subscribe();

    // Cleanup na desmontagem
    return () => {
      checklistSubscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    // Função para sincronização manual
    syncAttendance: async (attendanceId: string) => {
      const { data: checklistItems } = await supabase
        .from('checklist_items')
        .select('completed')
        .eq('attendance_id', attendanceId);

      if (checklistItems) {
        const totalTicks = checklistItems.length;
        const ticksCompleted = checklistItems.filter(item => item.completed).length;

        await supabase
          .from('attendances')
          .update({
            ticks_completed: ticksCompleted,
            total_ticks: totalTicks,
          })
          .eq('id', attendanceId);

        queryClient.invalidateQueries({ queryKey: ['attendances'] });
      }
    }
  };
};