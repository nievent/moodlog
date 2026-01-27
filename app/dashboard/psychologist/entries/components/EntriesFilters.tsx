// app/dashboard/psychologist/entries/components/EntriesFilters.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
}

interface Register {
  id: string;
  name: string;
}

interface Props {
  patients: Patient[];
  registers: Register[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  patientId: string;
  registerId: string;
  dateFrom: string;
  dateTo: string;
}

export default function EntriesFilters({ patients, registers, onFilterChange }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    patientId: '',
    registerId: '',
    dateFrom: '',
    dateTo: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      search: '',
      patientId: '',
      registerId: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = 
    filters.search || 
    filters.patientId || 
    filters.registerId || 
    filters.dateFrom || 
    filters.dateTo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="space-y-4">
        {/* Primera fila: Búsqueda + Selectores básicos */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar por paciente o registro..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          
          <select 
            value={filters.patientId}
            onChange={(e) => handleFilterChange('patientId', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="">Todos los pacientes</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>

          <select 
            value={filters.registerId}
            onChange={(e) => handleFilterChange('registerId', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          >
            <option value="">Todos los registros</option>
            {registers.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={20} />
            <span className="hidden sm:inline">
              {showAdvanced ? 'Menos' : 'Más'} filtros
            </span>
          </button>
        </div>

        {/* Filtros avanzados */}
        {showAdvanced && (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-2">
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={16} />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}