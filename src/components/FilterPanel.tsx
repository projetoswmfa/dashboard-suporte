import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTeam: string;
  setSelectedTeam: (team: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedPriority: string;
  setSelectedPriority: (priority: string) => void;
  selectedResponsible: string;
  setSelectedResponsible: (responsible: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  setSearchTerm,
  selectedTeam,
  setSelectedTeam,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedResponsible,
  setSelectedResponsible,
}) => {
  return (
    <Card className="mb-8 shadow-lg border-0">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por ID, descrição ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Team Filter */}
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por equipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Equipes</SelectItem>
              <SelectItem value="São Paulo">Atendimento Remoto - São Paulo</SelectItem>
              <SelectItem value="Sul">Atendimento Remoto - Sul</SelectItem>
              <SelectItem value="Cuiabá">Atendimento Remoto - Cuiabá</SelectItem>
              <SelectItem value="Projetos">Atendimento Remoto - Projetos</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">🔄 Ativos (sem finalizados)</SelectItem>
              <SelectItem value="all">📋 Todos os Status</SelectItem>
              <SelectItem value="Pendente">⏳ Pendente</SelectItem>
              <SelectItem value="Em andamento">🔥 Em Andamento</SelectItem>
              <SelectItem value="Aguardando">⏸️ Aguardando</SelectItem>
              <SelectItem value="Finalizado">✅ Finalizado</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              <SelectItem value="ALTA">🔥 ALTA</SelectItem>
              <SelectItem value="MEDIA">⚡ MÉDIA</SelectItem>
              <SelectItem value="BAIXA">🟢 BAIXA</SelectItem>
            </SelectContent>
          </Select>

          {/* Responsible Filter */}
          <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Responsáveis</SelectItem>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Wellington">Wellington</SelectItem>
              <SelectItem value="José">José</SelectItem>
              <SelectItem value="Isaque">Isaque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};