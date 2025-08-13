import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSound } from './useNotificationSound';
import type { Attendance } from '../types/attendance';

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const channelsRef = useRef<{ [key: string]: any }>({});
  const isSetupRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const DEBOUNCE_DELAY = 2000;
  const COOLDOWN_DELAY = 30000; // 30 segundos de cooldown
  
  // Estado para gerenciar notificações ativas
  const [activeNotifications, setActiveNotifications] = useState<Attendance[]>([]);
  
  // Hook para reprodução de som
  const { playNotificationSound, markUserInteraction } = useNotificationSound({
    volume: 0.7,
    enabled: true
  });

  // Função para adicionar nova notificação
  const addNotification = useCallback((ticket: Attendance) => {
    setActiveNotifications(prev => [...prev, ticket]);
    playNotificationSound();
  }, [playNotificationSound]);

  // Função para remover notificação
  const removeNotification = useCallback((ticketId: string) => {
    setActiveNotifications(prev => prev.filter(ticket => ticket.id !== ticketId));
  }, []);

  // Função para sincronizar progresso do atendimento
  const syncAttendanceProgress = async (attendanceId: string) => {
    try {
      // Validação do parâmetro
      if (!attendanceId || typeof attendanceId !== 'string') {
        console.error('❌ ID de atendimento inválido:', attendanceId);
        return;
      }
      
      console.log(`🔄 Sincronizando progresso para atendimento ${attendanceId}...`);
      
      // Buscar todos os itens do checklist para este atendimento
      const { data: checklistItems, error: checklistError } = await supabase
        .from('checklist_items')
        .select('completed')
        .eq('attendance_id', attendanceId);

      if (checklistError) {
        console.error('❌ Erro ao buscar itens do checklist:', checklistError);
        return;
      }

      // Validação dos dados retornados
      if (!Array.isArray(checklistItems)) {
        console.error('❌ Dados de checklist inválidos:', checklistItems);
        return;
      }

      const totalTicks = checklistItems.length;
      const ticksCompleted = checklistItems.filter(item => item && typeof item.completed === 'boolean' && item.completed).length;

      // Atualizar o atendimento com o progresso atual
      const { error: updateError } = await supabase
        .from('attendances')
        .update({
          ticks_completed: ticksCompleted,
          total_ticks: totalTicks,
        })
        .eq('id', attendanceId);

      if (updateError) {
        console.error('❌ Erro ao atualizar progresso do atendimento:', updateError);
        return;
      }

      console.log(`✅ Progresso sincronizado para atendimento ${attendanceId}: ${ticksCompleted}/${totalTicks}`);
    } catch (error) {
      console.error('❌ Erro na sincronização do progresso:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'Stack não disponível');
    }
  };

  useEffect(() => {
    // Evita múltiplas configurações
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    // Interceptador global de erros para capturar o erro específico
    const originalError = console.error;
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('TypeError: re is not a function')) {
        console.log('🚨 ERRO CAPTURADO: TypeError: re is not a function');
        console.log('🚨 Argumentos completos:', args);
        console.log('🚨 Stack trace no momento do erro:', new Error().stack);
        console.log('🚨 Estado dos canais:', channelsRef.current);
        console.log('🚨 Setup em andamento:', isSetupRef.current);
      }
      originalError.apply(console, args);
    };

    console.log('🔄 Configurando listeners de tempo real...');

    // Função para lidar com reconexão com debounce
    const setupChannelsDebounced = useCallback(() => {
      // Limpar timeout anterior se existir
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setupChannelsImmediate();
      }, DEBOUNCE_DELAY);
    }, []);

    const setupChannelsImmediate = useCallback(() => {
      const timestamp = new Date().toISOString();
      console.log(`🚀 setupChannels chamado em ${timestamp}`);
      console.log('📊 Tentativas de reconexão:', reconnectAttemptsRef.current);
      
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ Máximo de tentativas de reconexão atingido. Desabilitando realtime temporariamente.');
      console.warn('⚠️ Sincronização temporariamente desabilitada - tentando reativar em 30 segundos...');
      
      // Agendar reativação após cooldown
      cooldownTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Período de cooldown finalizado, resetando contador de tentativas');
        reconnectAttemptsRef.current = 0;
        setupChannelsDebounced();
      }, COOLDOWN_DELAY);
      
      return;
    }
      
      // Remove canais existentes se houver
      Object.values(channelsRef.current).forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('Erro ao remover canal:', e);
        }
      });
      channelsRef.current = {};
      reconnectAttemptsRef.current += 1;

    // Listener para mudanças na tabela attendances
    const attendancesChannel = supabase
        .channel(`attendances-changes-${Date.now()}`, {
          config: {
            broadcast: { self: false }
          }
        })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendances'
        },
          async (payload) => {
            try {
              console.log('📊 Mudança detectada em attendances:', payload);
              
              // Validação do payload
              if (!payload || typeof payload !== 'object') {
                console.error('❌ Payload inválido recebido:', payload);
                return;
              }
              
              // Aguarda um pouco para garantir que a transação foi commitada
              await new Promise((resolve) => {
                if (typeof resolve !== 'function') {
                  console.error('❌ Resolve não é uma função:', resolve);
                  return;
                }
                setTimeout(resolve, 100);
              });
              
              // Invalida e recarrega os dados de atendimentos imediatamente
              await queryClient.invalidateQueries({ queryKey: ['attendances'] });
              
              console.log('🔄 Queries invalidadas após mudança em attendances');
            
            // Mostra notificação baseada no tipo de evento
            switch (payload.eventType) {
              case 'INSERT':
                // Dispara notificação especial para novos tickets
                if (payload.new && typeof addNotification === 'function') {
                  console.log('🎫 Novo ticket detectado:', payload.new);
                  addNotification(payload.new as Attendance);
                
                console.log('✨ Novo ticket criado - Cliente:', payload.new.client_name || 'N/A');
                }
                break;
              case 'UPDATE':
                console.log('🔄 Atendimento atualizado - Dados sincronizados entre todas as telas');
                break;
              case 'DELETE':
                console.log('🗑️ Atendimento removido - Dashboard atualizado automaticamente');
                break;
            }
            } catch (error) {
              console.error('❌ Erro no processamento do evento attendances:', error);
              console.error('❌ Payload que causou o erro:', payload);
            }
          }
      )
        .subscribe(async (status) => {
          try {
            console.log('📡 Status do canal attendances:', status);
            console.log('📊 Timestamp:', new Date().toISOString());
            
            if (status === 'SUBSCRIBED') {
               console.log('✅ Canal attendances conectado com sucesso');
               // Reset contador de tentativas em caso de sucesso
               reconnectAttemptsRef.current = 0;
               console.log('🌐 Sincronização em tempo real ativa - Mudanças serão atualizadas automaticamente');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Erro no canal attendances, tentando reconectar...');
              console.warn('⚠️ Erro na sincronização - Tentando reconectar automaticamente');
              // Tentar reconectar após um delay
              setTimeout(() => {
                console.log('🔄 Tentando reconectar canal attendances...');
                isSetupRef.current = false;
                setupChannelsDebounced();
              }, 5000);
            } else if (status === 'TIMED_OUT') {
              console.warn('⏰ Timeout no canal attendances, reconectando...');
              setTimeout(() => {
                console.log('🔄 Reconectando após timeout...');
                isSetupRef.current = false;
                setupChannelsDebounced();
              }, 2000);
            } else if (status === 'CLOSED') {
              console.log('🔒 Canal attendances fechado, tentando reconectar...');
              setTimeout(() => {
                console.log('🔄 Reconectando canal fechado...');
                isSetupRef.current = false;
                setupChannelsDebounced();
              }, 3000);
            }
          } catch (error) {
            console.error('❌ Erro no callback de status do canal attendances:', error);
          }
        });

    // Listener para mudanças na tabela checklist_items
    const checklistChannel = supabase
        .channel(`checklist-sync-${Date.now()}`, {
          config: {
            broadcast: { self: false }
          }
        })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items'
        },
          async (payload) => {
            try {
              console.log('✅ Mudança detectada em checklist_items:', payload);
              
              // Validação do payload
              if (!payload || typeof payload !== 'object') {
                console.error('❌ Payload inválido recebido em checklist:', payload);
                return;
              }
              
              // Aguarda um pouco para garantir que a transação foi commitada
              await new Promise((resolve) => {
                if (typeof resolve !== 'function') {
                  console.error('❌ Resolve não é uma função:', resolve);
                  return;
                }
                setTimeout(resolve, 100);
              });
            
            // Sincronizar progresso do atendimento se necessário
            if (payload.new && 'attendance_id' in payload.new) {
              await syncAttendanceProgress(payload.new.attendance_id as string);
            } else if (payload.old && 'attendance_id' in payload.old) {
              await syncAttendanceProgress(payload.old.attendance_id as string);
            }
            
            // Invalida queries relacionadas
            await queryClient.invalidateQueries({ queryKey: ['checklist'] });
            await queryClient.invalidateQueries({ queryKey: ['attendances'] });
            
            console.log('🔄 Queries invalidadas após mudança em checklist_items');
            
            // Log baseado no tipo de evento
            switch (payload.eventType) {
              case 'INSERT':
                console.log('📝 Item de checklist adicionado - Progresso atualizado em tempo real');
                break;
              case 'UPDATE':
                console.log('✏️ Item de checklist atualizado - Progresso sincronizado entre telas');
                break;
              case 'DELETE':
                console.log('🗑️ Item de checklist removido - Progresso atualizado automaticamente');
                break;
            }
            } catch (error) {
              console.error('❌ Erro no processamento do evento checklist_items:', error);
              console.error('❌ Payload que causou o erro:', payload);
            }
          }
      )
        .subscribe(async (status) => {
          try {
            console.log('📡 Status do canal checklist:', status);
            console.log('📊 Timestamp:', new Date().toISOString());
            
            if (status === 'SUBSCRIBED') {
               console.log('✅ Canal checklist conectado com sucesso');
               // Reset contador de tentativas em caso de sucesso
               reconnectAttemptsRef.current = 0;
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Erro no canal checklist, tentando reconectar...');
              setTimeout(() => {
                console.log('🔄 Tentando reconectar canal checklist...');
                isSetupRef.current = false;
                setupChannelsDebounced();
              }, 5000);
            } else if (status === 'TIMED_OUT') {
              console.warn('⏰ Timeout no canal checklist, reconectando...');
              setTimeout(() => {
                console.log('🔄 Reconectando checklist após timeout...');
                isSetupRef.current = false;
                setupChannelsDebounced();
              }, 2000);
            } else if (status === 'CLOSED') {
              console.log('🔒 Canal checklist fechado, tentando reconectar...');
              setTimeout(() => {
                console.log('🔄 Reconectando canal checklist fechado...');
                isSetupRef.current = false;
                setupChannelsDebounced();
              }, 3000);
            }
          } catch (error) {
            console.error('❌ Erro no callback de status do canal checklist:', error);
          }
        });

      // Armazena referências dos canais
      channelsRef.current = {
        attendances: attendancesChannel,
        checklist: checklistChannel
      };
      
      // Reset contador de tentativas em caso de sucesso
      if (reconnectAttemptsRef.current > 0) {
        console.log('✅ Reconexão bem-sucedida, resetando contador');
        reconnectAttemptsRef.current = 0;
      }
    }, [queryClient, addNotification, syncAttendanceProgress]);

    // Configuração inicial
    setupChannelsImmediate();

    // Cleanup function para remover os listeners
    return () => {
      console.log('🧹 Removendo listeners de tempo real...');
      // Restaurar console.error original
      console.error = originalError;
      
      // Limpar timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }
      
      isSetupRef.current = false;
      reconnectAttemptsRef.current = 0;
      Object.values(channelsRef.current).forEach(channel => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn('Erro ao remover canal:', e);
        }
      });
      channelsRef.current = {};
    };
  }, [queryClient]);

  return {
    // Funções para gerenciar notificações
    activeNotifications,
    removeNotification,
    markUserInteraction,
  };
};