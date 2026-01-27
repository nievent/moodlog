// app/dashboard/patient/components/AssignedRegisterCard.tsx
'use client';

import { useState } from 'react';
import { FileText, Calendar, TrendingUp, Plus, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import CompleteRegisterModal from './CompleteRegisterModal';
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

export default function AssignedRegisterCard({ assignment }: Props) {
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Validar que auto_register existe
  if (!assignment.auto_register) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-800 font-medium">Error: Registro no encontrado</p>
        <p className="text-red-600 text-sm mt-1">
          Este registro ya no existe o ha sido eliminado.
        </p>
      </div>
    );
  }

  const frequencyLabel = {
    daily: 'Diario',
    weekly: 'Semanal',
    as_needed: 'Libre',
  }[assignment.frequency || 'as_needed'];

  const frequencyColor = {
    daily: 'bg-red-100 text-red-700',
    weekly: 'bg-blue-100 text-blue-700',
    as_needed: 'bg-green-100 text-green-700',
  }[assignment.frequency || 'as_needed'];

  // Calcular si debe completar hoy (para diarios)
  const shouldCompleteToday = assignment.frequency === 'daily' && (!assignment.lastEntry || 
    new Date(assignment.lastEntry).toDateString() !== new Date().toDateString());

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-900 text-lg">
                  {assignment.auto_register.name}
                </h3>
                {shouldCompleteToday && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </div>
              {assignment.auto_register.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {assignment.auto_register.description}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-purple-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Frequency badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${frequencyColor}`}>
              <Clock className="w-3.5 h-3.5" />
              {frequencyLabel}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-gray-600">Total</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{assignment.totalEntries}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600">Última</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {assignment.lastEntry 
                  ? new Date(assignment.lastEntry).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                  : 'Nunca'
                }
              </p>
            </div>
          </div>

          {/* Notas del psicólogo */}
          {assignment.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs font-medium text-blue-900 mb-1">📝 Nota de tu psicólogo:</p>
              <p className="text-sm text-blue-800">{assignment.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCompleteModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Nueva Entrada
            </button>
            <button
              className="px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              title="Ver historial"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Progress bar (opcional) */}
        {assignment.frequency === 'daily' && (
          <div className="h-1 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all"
              style={{ 
                width: assignment.lastEntry && new Date(assignment.lastEntry).toDateString() === new Date().toDateString()
                  ? '100%' 
                  : '0%' 
              }}
            />
          </div>
        )}
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