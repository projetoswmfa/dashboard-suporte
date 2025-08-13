import { useEffect, useState } from 'react';
import { X, Ticket, User, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import type { Attendance } from '../types/attendance';

interface NewTicketNotificationProps {
  ticket: Attendance;
  onClose: () => void;
  autoCloseDelay?: number;
}

export const NewTicketNotification = ({ 
  ticket, 
  onClose, 
  autoCloseDelay = 8000 
}: NewTicketNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close
    const autoCloseTimer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoCloseTimer);
    };
  }, [autoCloseDelay]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // Tempo da animação de saída
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
        return 'bg-red-500 text-white';
      case 'média':
        return 'bg-yellow-500 text-white';
      case 'baixa':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div 
      className={`
        fixed bottom-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <Card className="shadow-lg border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Novo Ticket
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  #{ticket.id}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Fechar notificação"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {ticket.client_name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {formatTime(ticket.created_at)}
              </span>
            </div>

            {ticket.priority && (
              <div className="flex items-center gap-2">
                <Badge 
                  className={`text-xs px-2 py-1 ${getPriorityColor(ticket.priority)}`}
                >
                  {ticket.priority}
                </Badge>
              </div>
            )}

            {ticket.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                {ticket.description}
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Clique para fechar
              </span>
              <div className="w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full animate-pulse"
                  style={{
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// CSS personalizado para a animação da barra de progresso
const style = document.createElement('style');
style.textContent = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;
document.head.appendChild(style);