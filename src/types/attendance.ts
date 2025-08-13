export interface Attendance {
  id: string;
  team: string;
  status: 'Pendente' | 'Em andamento' | 'Aguardando' | 'Finalizado';
  responsible: string; // Formato: "Junior" | "Wellington" | "Junior,Wellington"
  open_date: string;
  close_date: string | null;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA';
  ticks_completed: number;
  total_ticks: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions para trabalhar com múltiplos responsáveis
export const ResponsibleUtils = {
  // Converter string para array
  toArray: (responsible: string): string[] => {
    return responsible.split(',').map(r => r.trim()).filter(r => r);
  },
  
  // Converter array para string
  toString: (responsibles: string[]): string => {
    return responsibles.filter(r => r).join(',');
  },
  
  // Verificar se contém um responsável específico
  includes: (responsible: string, person: string): boolean => {
    return ResponsibleUtils.toArray(responsible).includes(person);
  },
  
  // Obter display string
  getDisplayString: (responsible: string): string => {
    const arr = ResponsibleUtils.toArray(responsible);
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr.join(' & ');
    return arr.join(', ');
  }
};

// Utils para ordenação por prioridade
export const PriorityUtils = {
  // Ordem de prioridade (menor número = maior prioridade)
  priorityOrder: { 'ALTA': 1, 'MEDIA': 2, 'BAIXA': 3 } as const,
  
  // Função de comparação para ordenação
  compare: (a: Attendance, b: Attendance): number => {
    const priorityA = PriorityUtils.priorityOrder[a.priority];
    const priorityB = PriorityUtils.priorityOrder[b.priority];
    
    // Se prioridades são diferentes, ordena por prioridade
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Se prioridades são iguais, ordena por data de abertura (mais antigo primeiro)
    return new Date(a.open_date).getTime() - new Date(b.open_date).getTime();
  },
  
  // Obter cor da prioridade
  getColor: (priority: 'ALTA' | 'MEDIA' | 'BAIXA'): string => {
    switch (priority) {
      case 'ALTA': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIA': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BAIXA': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
};

export interface CreateAttendanceData {
  team: string;
  responsible: string;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA';
  total_ticks: number;
  description: string;
}