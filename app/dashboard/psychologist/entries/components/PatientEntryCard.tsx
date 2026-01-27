// app/dashboard/psychologist/entries/components/PatientEntryCard.tsx
'use client';

import { useState } from 'react';
import { Calendar, Eye, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';
import ViewPatientEntryModal from './ViewPatientEntryModal';

interface Entry {
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
}

interface Props {
  entry: Entry;
}

export default function PatientEntryCard({ entry }: Props) {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!entry.register || !entry.patient) {
    return null;
  }

  const fields = entry.register.fields?.fields || [];
  const previewFields = fields.slice(0, 2);

  const getFieldValuePreview = (fieldId: string): string => {
    const value = entry.data[fieldId];
    
    if (value === null || value === undefined || value === '') {
      return 'Sin respuesta';
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    
    return String(value);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden">
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {entry.register.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Preview de campos */}
          {previewFields.length > 0 && (
            <div className="space-y-2 mb-4">
              {previewFields.map((field) => (
                <div key={field.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {getFieldValuePreview(field.id)}
                  </p>
                </div>
              ))}
              {fields.length > 2 && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  {showPreview ? (
                    <>
                      <ChevronUp size={16} />
                      Ver menos
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Ver {fields.length - 2} campos más
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Campos expandidos */}
          {showPreview && fields.slice(2).length > 0 && (
            <div className="space-y-2 mb-4">
              {fields.slice(2).map((field) => (
                <div key={field.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    {field.label}
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {getFieldValuePreview(field.id)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Notas del paciente */}
          {entry.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">Notas del paciente</p>
                  <p className="text-sm text-blue-800 line-clamp-2">{entry.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action */}
          <button
            onClick={() => setShowViewModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-md transition-all"
          >
            <Eye size={18} />
            Ver Detalles Completos
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Registrado el {new Date(entry.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })} a las {new Date(entry.created_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Modal */}
      {showViewModal && (
        <ViewPatientEntryModal
          entry={entry}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </>
  );
}