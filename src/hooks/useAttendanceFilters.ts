import { useState, useCallback } from 'react';

export interface AttendanceFilters {
  status: string;
  priority: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  search: string;
}

const initialFilters: AttendanceFilters = {
  status: 'all',
  priority: 'all',
  dateRange: {
    from: undefined,
    to: undefined,
  },
  search: '',
};

export function useAttendanceFilters() {
  const [filters, setFilters] = useState<AttendanceFilters>(initialFilters);

  const updateFilters = useCallback((newFilters: Partial<AttendanceFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
  };
}