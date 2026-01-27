// app/dashboard/psychologist/entries/components/EntriesListClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import PatientEntryCard from './PatientEntryCard';
import EntriesFilters, { FilterState } from './EntriesFilters';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';

type EntryWithDetails = {
  id: string;
  assignment_id: string;
  patient_id: string;
  data: RegisterEntryData;
  entry_date: string;
  notes: string | null;
  created_at: string;
  patient: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  register: {
    id: string;
    name: string;
    description: string | null;
    fields: AutoRegisterFields;
  } | null;
};

type PatientGroup = {
  patient: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  entries: EntryWithDetails[];
};

interface Props {
  entries: EntryWithDetails[];
  patients: Array<{ id: string; full_name: string; avatar_url: string | null }>;
  registers: Array<{ id: string; name: string }>;
}

export default function EntriesListClient({ entries, patients, registers }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    patientId: '',
    registerId: '',
    dateFrom: '',
    dateTo: '',
  });

  // Filtrar entradas
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesPatient = entry.patient?.full_name.toLowerCase().includes(searchLower);
        const matchesRegister = entry.register?.name.toLowerCase().includes(searchLower);
        if (!matchesPatient && !matchesRegister) return false;
      }

      // Filtro de paciente
      if (filters.patientId && entry.patient_id !== filters.patientId) {
        return false;
      }

      // Filtro de registro
      if (filters.registerId && entry.register?.id !== filters.registerId) {
        return false;
      }

      // Filtro de fecha desde
      if (filters.dateFrom && entry.entry_date < filters.dateFrom) {
        return false;
      }

      // Filtro de fecha hasta
      if (filters.dateTo && entry.entry_date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [entries, filters]);

  // Agrupar por paciente
  const patientGroups = useMemo(() => {
    const groups = filteredEntries.reduce((acc, entry) => {
      const patientId = entry.patient_id;
      if (!acc[patientId]) {
        acc[patientId] = {
          patient: entry.patient!,
          entries: [],
        };
      }
      acc[patientId].entries.push(entry);
      return acc;
    }, {} as Record<string, PatientGroup>);

    return Object.values(groups);
  }, [filteredEntries]);

  return (
    <>
      {/* Filtros */}
      <EntriesFilters
        patients={patients}
        registers={registers}
        onFilterChange={setFilters}
      />

      {/* Resultados */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">
          Mostrando <strong className="text-gray-900">{filteredEntries.length}</strong> de{' '}
          <strong className="text-gray-900">{entries.length}</strong> entradas
          {filters.patientId && ` • Paciente filtrado`}
          {filters.registerId && ` • Registro filtrado`}
          {(filters.dateFrom || filters.dateTo) && ` • Rango de fechas`}
        </p>
      </div>

      {/* Lista de entradas agrupadas */}
      {patientGroups.length > 0 ? (
        <div className="space-y-6">
          {patientGroups.map((group) => (
            <div key={group.patient.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {group.patient.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {group.patient.full_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {group.entries.length} {group.entries.length === 1 ? 'entrada' : 'entradas'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.entries.slice(0, 6).map((entry) => (
                  <PatientEntryCard key={entry.id} entry={entry} />
                ))}
              </div>

              {group.entries.length > 6 && (
                <button className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Ver todas las entradas de {group.patient.full_name} ({group.entries.length})
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron entradas
          </h3>
          <p className="text-gray-600">
            {filters.search || filters.patientId || filters.registerId || filters.dateFrom || filters.dateTo
              ? 'Intenta ajustar los filtros para ver más resultados'
              : 'Tus pacientes aún no han completado ningún registro'}
          </p>
        </div>
      )}
    </>
  );
}