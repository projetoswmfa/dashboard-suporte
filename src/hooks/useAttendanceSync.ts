import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Attendance } from '@/types/attendance';

export function useAttendanceSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState<Attendance[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToPendingSync = useCallback((attendance: Attendance) => {
    setPendingSync(prev => [...prev, attendance]);
    // Salvar no localStorage para persistir offline
    const stored = localStorage.getItem('pendingSync');
    const pending = stored ? JSON.parse(stored) : [];
    pending.push(attendance);
    localStorage.setItem('pendingSync', JSON.stringify(pending));
  }, []);

  const syncPendingData = useCallback(async () => {
    if (!isOnline || pendingSync.length === 0) return;

    setIsSyncing(true);
    try {
      for (const attendance of pendingSync) {
        await supabase
          .from('attendances')
          .insert(attendance);
      }
      
      setPendingSync([]);
      localStorage.removeItem('pendingSync');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, pendingSync]);

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    if (isOnline) {
      // Carregar dados pendentes do localStorage
      const stored = localStorage.getItem('pendingSync');
      if (stored) {
        const pending = JSON.parse(stored);
        setPendingSync(pending);
      }
      syncPendingData();
    }
  }, [isOnline, syncPendingData]);

  return {
    isOnline,
    pendingSync: pendingSync.length,
    isSyncing,
    addToPendingSync,
    syncPendingData,
  };
}