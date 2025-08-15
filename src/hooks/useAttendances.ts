import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Attendance, AttendanceStatus, AttendancePriority } from '@/types/attendance';
import { AttendanceFilters } from './useAttendanceFilters';
import { useAttendanceSync } from './useAttendanceSync';

export function useAttendances() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOnline, addToPendingSync } = useAttendanceSync();

  const fetchAttendances = useCallback(async (filters?: AttendanceFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('attendances')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters) {
        if (filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }
        if (filters.priority !== 'all') {
          query = query.eq('priority', filters.priority);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        if (filters.dateRange.from) {
          query = query.gte('created_at', filters.dateRange.from.toISOString());
        }
        if (filters.dateRange.to) {
          query = query.lte('created_at', filters.dateRange.to.toISOString());
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      setAttendances(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atendimentos');
      console.error('Erro ao buscar atendimentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAttendance = useCallback(async (attendance: Omit<Attendance, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newAttendance: Attendance = {
        ...attendance,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isOnline) {
        const { data, error } = await supabase
          .from('attendances')
          .insert(newAttendance)
          .select()
          .single();

        if (error) throw error;

        setAttendances(prev => [data, ...prev]);
        return data;
      } else {
        // Modo offline - adicionar à fila de sincronização
        addToPendingSync(newAttendance);
        setAttendances(prev => [newAttendance, ...prev]);
        return newAttendance;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atendimento');
      throw err;
    }
  }, [isOnline, addToPendingSync]);

  const updateAttendance = useCallback(async (id: string, updates: Partial<Attendance>) => {
    try {
      const updatedData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (isOnline) {
        const { data, error } = await supabase
          .from('attendances')
          .update(updatedData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        setAttendances(prev => 
          prev.map(attendance => 
            attendance.id === id ? data : attendance
          )
        );
        return data;
      } else {
        // Modo offline - atualizar localmente
        setAttendances(prev => 
          prev.map(attendance => 
            attendance.id === id ? { ...attendance, ...updatedData } : attendance
          )
        );
        return { id, ...updatedData };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar atendimento');
      throw err;
    }
  }, [isOnline]);

  const deleteAttendance = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        const { error } = await supabase
          .from('attendances')
          .delete()
          .eq('id', id);

        if (error) throw error;
      }

      setAttendances(prev => prev.filter(attendance => attendance.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir atendimento');
      throw err;
    }
  }, [isOnline]);

  const updateStatus = useCallback(async (id: string, status: AttendanceStatus) => {
    return updateAttendance(id, { status });
  }, [updateAttendance]);

  const updatePriority = useCallback(async (id: string, priority: AttendancePriority) => {
    return updateAttendance(id, { priority });
  }, [updateAttendance]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  return {
    attendances,
    loading,
    error,
    fetchAttendances,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    updateStatus,
    updatePriority,
  };
}