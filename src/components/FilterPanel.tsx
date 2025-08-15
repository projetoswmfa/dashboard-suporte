import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, Search } from 'lucide-react';
import { ResponsibleUtils, PriorityUtils } from '@/types/attendance';
import type { AttendanceFilters } from '@/hooks/useAttendanceFilters';

interface FilterPanelProps {
  filters: AttendanceFilters;
  onFiltersChange: (filters: Partial<AttendanceFilters>) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const teams = [
    'Suporte Técnico',
    'Desenvolvimento',
    'Infraestrutura',
    'Segurança',
    'Qualidade',
    'Comercial'
  ];

  const statuses = [
    'Aberto',
    'Em Andamento',
    'Aguardando',
    'Finalizado',
    'Pendente'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
        <CardDescription>
          Filtre os atendimentos por diferentes critérios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Busca por termo */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Cliente, descrição..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({ searchTerm: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>

          {/* Filtro por equipe */}
          <div className="space-y-2">
            <Label htmlFor="team">Equipe</Label>
            <Select 
              value={filters.team || ''} 
              onValueChange={(value) => onFiltersChange({ team: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as equipes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as equipes</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={filters.status || ''} 
              onValueChange={(value) => onFiltersChange({ status: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por prioridade */}
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select 
              value={filters.priority || ''} 
              onValueChange={(value) => onFiltersChange({ priority: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as prioridades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as prioridades</SelectItem>
                {PriorityUtils.getAllPriorities().map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-2 h-2 rounded-full ${PriorityUtils.getColor(priority)}`}
                      />
                      {priority}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsible">Responsável</Label>
            <Select 
              value={filters.responsible || ''} 
              onValueChange={(value) => onFiltersChange({ responsible: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os responsáveis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os responsáveis</SelectItem>
                {ResponsibleUtils.getAllResponsibles().map((responsible) => (
                  <SelectItem key={responsible} value={responsible}>
                    {responsible}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};