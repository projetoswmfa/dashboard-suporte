import { useCallback, useRef, useState } from 'react';

interface NotificationSoundOptions {
  volume?: number;
  enabled?: boolean;
}

export const useNotificationSound = (options: NotificationSoundOptions = {}) => {
  const { volume = 0.7, enabled = true } = options;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Inicializa o áudio quando necessário
  const initializeAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification.mp3');
      audioRef.current.volume = volume;
      audioRef.current.preload = 'auto';
      
      audioRef.current.addEventListener('canplaythrough', () => {
        setIsLoaded(true);
      });

      audioRef.current.addEventListener('error', (e) => {
        console.warn('Erro ao carregar som de notificação:', e);
      });
    }
  }, [volume]);

  // Função para marcar que o usuário interagiu (necessário para reprodução de áudio)
  const markUserInteraction = useCallback(() => {
    setHasUserInteracted(true);
  }, []);

  // Função para reproduzir o som
  const playNotificationSound = useCallback(async () => {
    if (!enabled) return;

    try {
      // Inicializa o áudio se ainda não foi inicializado
      if (!audioRef.current) {
        initializeAudio();
      }

      // Verifica se o usuário já interagiu com a página
      if (!hasUserInteracted) {
        console.warn('Som de notificação bloqueado: usuário ainda não interagiu com a página');
        return;
      }

      if (audioRef.current && isLoaded) {
        // Reset do áudio para permitir reprodução múltipla
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        console.log('🔊 Som de notificação reproduzido');
      } else {
        console.warn('Som de notificação não está carregado ainda');
      }
    } catch (error) {
      console.warn('Erro ao reproduzir som de notificação:', error);
    }
  }, [enabled, isLoaded, hasUserInteracted, initializeAudio]);

  // Função para testar o som
  const testSound = useCallback(() => {
    markUserInteraction();
    playNotificationSound();
  }, [markUserInteraction, playNotificationSound]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return {
    playNotificationSound,
    testSound,
    markUserInteraction,
    isLoaded,
    hasUserInteracted,
    cleanup,
  };
};