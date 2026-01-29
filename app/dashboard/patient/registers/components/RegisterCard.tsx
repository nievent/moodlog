// app/dashboard/patient/registers/components/RegisterCard.tsx
'use client';

import { useState } from 'react';
import { FileText, Calendar, TrendingUp, Plus, Clock, CheckCircle, Info, Eye } from 'lucide-react';
import CompleteRegisterModal from '../../components/CompleteRegisterModal';
import { AutoRegisterFields } from '@/types/database.types';

interface Assignment {
  id: string;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  totalEntries: number;
  lastEntry: string | null;
  auto_register: {
    id: string;
    name: string;
    description: string | null;
    fields: AutoRegisterFields;
  } | null;
}

interface Props {
  assignment: Assignment;
}

export default function RegisterCard({ assignment }: Props) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (!assignment.auto_register) {
    return null;
  }

  // Normalizar frecuencia a un tipo específico
  type FrequencyType = 'daily' | 'weekly' | 'as_needed';
  const frequency: FrequencyType = (assignment.frequency as FrequencyType) || 'as_needed';

  const frequencyLabel: Record<FrequencyType, string> = {
    daily: 'Diario',
    weekly: 'Semanal',
    as_needed: 'Libre',
  };

  const frequencyColors: Record<FrequencyType, { bg: string; text: string; border: string }> = {
    daily: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    weekly: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    as_needed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  };

  const currentFrequency = frequencyLabel[frequency];
  const currentColor = frequencyColors[frequency];

  // Verificar si debe completar hoy
  const today = new Date().toISOString().split('T')[0];
  const shouldCompleteToday = frequency === 'daily' && 
    (!assignment.lastEntry || assignment.lastEntry !== today);

  // Verificar si completó hoy
  const completedToday = assignment.lastEntry === today;

  // Calcular días desde última entrada
  const daysSinceLastEntry = assignment.lastEntry 
    ? Math.floor((new Date().getTime() - new Date(assignment.lastEntry).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Calcular racha (días consecutivos)
  const streak = assignment.totalEntries; // Simplificado

  const fieldsCount = assignment.auto_register.fields?.fields?.length || 0;

  return (
    <>
      <div className={`group relative bg-white rounded-2xl shadow-sm border-2 transition-all overflow-hidden ${
        shouldCompleteToday ? 'border-orange-300 hover:shadow-lg' : 'border-gray-200 hover:shadow-md'
      }`}>
        {/* Badge de estado */}
        {shouldCompleteToday && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold animate-pulse">
              <Clock className="w-3 h-3" />
              Pendiente
            </span>
          </div>
        )}
        
        {completedToday && frequency === 'daily' && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
              <CheckCircle className="w-3 h-3" />
              ¡Hecho!
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                {assignment.auto_register.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${currentColor.bg} ${currentColor.text} rounded-full text-xs font-medium`}>
                  {currentFrequency}
                </span>
                {fieldsCount > 0 && (
                  <span className="text-xs text-gray-500">
                    {fieldsCount} {fieldsCount === 1 ? 'campo' : 'campos'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description (opcional) */}
          {assignment.auto_register.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {assignment.auto_register.description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Total entradas */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-medium text-teal-700">Total</span>
              </div>
              <p className="text-2xl font-bold text-teal-900">{assignment.totalEntries}</p>
            </div>

            {/* Última entrada */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-medium text-purple-700">Última</span>
              </div>
              <p className="text-sm font-bold text-purple-900">
                {assignment.lastEntry 
                  ? daysSinceLastEntry === 0
                    ? 'Hoy'
                    : daysSinceLastEntry === 1
                    ? 'Ayer'
                    : `Hace ${daysSinceLastEntry}d`
                  : 'Nunca'
                }
              </p>
            </div>
          </div>

          {/* Notas del psicólogo */}
          {assignment.notes && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-full mb-4"
            >
              <div className={`bg-blue-50 border-2 border-blue-200 rounded-lg p-3 text-left transition-all ${
                showInfo ? '' : 'cursor-pointer hover:bg-blue-100'
              }`}>
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-900 mb-1">
                      Indicaciones de tu psicólogo/a:
                    </p>
                    <p className={`text-sm text-blue-800 ${showInfo ? '' : 'line-clamp-2'}`}>
                      {assignment.notes}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Progress bar para diarios */}
          {frequency === 'daily' && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progreso de hoy</span>
                <span>{completedToday ? '100%' : '0%'}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    completedToday 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 w-full' 
                      : 'w-0'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCompleteModal(true)}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                shouldCompleteToday
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  : completedToday
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-teal-500 to-purple-500 text-white hover:shadow-lg'
              }`}
            >
              <Plus size={18} />
              {completedToday ? 'Completar de nuevo' : 'Completar'}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/patient/history'}
              className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title="Ver historial"
            >
              <Eye size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Footer con info de asignación */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Asignado el {new Date(assignment.start_date).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            {assignment.end_date && (
              <span>
                Hasta {new Date(assignment.end_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal para completar */}
      {showCompleteModal && (
        <CompleteRegisterModal
          assignment={assignment}
          onClose={() => setShowCompleteModal(false)}
        />
      )}
    </>
  );
}