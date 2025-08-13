import { useState, useMemo } from 'react';
import type { Attendance } from '@/types/attendance';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';

export interface AttendanceFilters {
  searchTerm: string;
  selectedTeam: string;
  selectedStatus: string;
  selectedPriority: string;
  selectedResponsible: string;
}

export interface AttendanceFiltersHook {
  filters: AttendanceFilters;
  setSearchTerm: (term: string) => void;
  setSelectedTeam: (team: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSelectedResponsible: (responsible: string) => void;
  filteredData: Attendance[];
  resetFilters: () => void;
  showingFinalized: boolean;
  activeAttendances: Attendance[];
  finalizedAttendances: Attendance[];
}

export const useAttendanceFilters = (attendances: Attendance[]): AttendanceFiltersHook => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active'); // Padrão: excluir finalizados
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedResponsible, setSelectedResponsible] = useState('all');

  const filters: AttendanceFilters = {
    searchTerm,
    selectedTeam,
    selectedStatus,
    selectedPriority,
    selectedResponsible,
  };

  const filteredData = useMemo(() => {
    return attendances
      .filter(attendance => {
        const matchesSearch = attendance.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            attendance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            attendance.responsible.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesTeam = selectedTeam === 'all' || attendance.team === selectedTeam;
        
        // Lógica de filtro de status inteligente
        let matchesStatus = true;
        if (selectedStatus === 'active') {
          // 'active' = todos EXCETO finalizados (comportamento padrão)
          matchesStatus = attendance.status !== 'Finalizado';
        } else if (selectedStatus === 'all') {
          // 'all' = todos os status incluindo finalizados
          matchesStatus = true;
        } else {
          // Status específico selecionado
          matchesStatus = attendance.status === selectedStatus;
        }
        
        const matchesPriority = selectedPriority === 'all' || attendance.priority === selectedPriority;
        const matchesResponsible = selectedResponsible === 'all' || 
                                 ResponsibleUtils.includes(attendance.responsible, selectedResponsible);
        
        return matchesSearch && matchesTeam && matchesStatus && matchesPriority && matchesResponsible;
      })
      .sort(PriorityUtils.compare); // Ordenação automática por prioridade
  }, [searchTerm, selectedTeam, selectedStatus, selectedPriority, selectedResponsible, attendances]);

  // Dados separados para análises
  const activeAttendances = useMemo(() => {
    return attendances.filter(attendance => attendance.status !== 'Finalizado');
  }, [attendances]);

  const finalizedAttendances = useMemo(() => {
    return attendances.filter(attendance => attendance.status === 'Finalizado');
  }, [attendances]);

  const showingFinalized = selectedStatus === 'Finalizado' || selectedStatus === 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTeam('all');
    setSelectedStatus('active'); // Volta para o padrão (sem finalizados)
    setSelectedPriority('all');
    setSelectedResponsible('all');
  };

  return {
    filters,
    setSearchTerm,
    setSelectedTeam,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedResponsible,
    filteredData,
    resetFilters,
    showingFinalized,
    activeAttendances,
    finalizedAttendances,
  };
};


