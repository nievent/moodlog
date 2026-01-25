// app/dashboard/psychologist/registers/components/AssignedRegisterCard.tsx
'use client';

import { useState } from 'react';
import { User, Calendar, FileText, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteAssignment } from '@/app/actions/registers';
import { AutoRegisterFields } from '@/types/database.types';
interface Assignment {
  id: string;
  frequency: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  entryCount: number;
  patient: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  auto_register: {
    id: string;
    name: string;
    description: string | null;
    fields: AutoRegisterFields;
  };
}

interface Props {
  assignment: Assignment;
}

export default function AssignedRegisterCard({ assignment }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteAssignment(assignment.id);
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error al eliminar la asignación');
    } finally {
      setIsDeleting(false);
    }
  };

  const frequencyLabel = {
    daily: 'Diario',
    weekly: 'Semanal',
    as_needed: 'Libre',
  }[assignment.frequency || 'as_needed'];

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start gap-4 mb-3">
            {/* Avatar paciente */}
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {assignment.patient.full_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{assignment.auto_register.name}</h4>
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                  {frequencyLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                {assignment.patient.full_name}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{assignment.entryCount} {assignment.entryCount === 1 ? 'entrada' : 'entradas'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                Desde {new Date(assignment.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            </div>
            {assignment.end_date && (
              <span className="text-xs text-gray-500">
                Hasta {new Date(assignment.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          {/* Notas expandibles */}
          {assignment.notes && (
            <div className="mb-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {isExpanded ? 'Ocultar' : 'Ver'} notas
              </button>
              {isExpanded && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
                  {assignment.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 ml-4">
          <button
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Ver entradas"
          >
            <Eye size={18} className="text-gray-600" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
            title="Eliminar asignación"
          >
            <Trash2 size={18} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}