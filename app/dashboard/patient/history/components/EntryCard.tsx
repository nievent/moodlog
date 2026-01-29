// app/dashboard/patient/history/components/EntryCard.tsx
'use client';

import { useState } from 'react';
import { Calendar, Edit2, Trash2, Eye, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';
import EditEntryModal from './EditEntryModal';
import ViewEntryModal from './ViewEntryModal';
import { deleteRegisterEntry } from '@/app/actions/registerEntries';

interface Entry {
  id: string;
  assignment_id: string;
  data: RegisterEntryData;
  entry_date: string;
  notes: string | null;
  created_at: string;
  register: {
    id: string;
    name: string;
    description: string | null;
    fields: AutoRegisterFields;
  } | null;
}

interface Props {
  entry: Entry;
  psychologistName?: string | null;
}

export default function EntryCard({ entry, psychologistName }: Props) {
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  if (!entry.register) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteRegisterEntry(entry.id);
      if (result.error) {
        alert(result.error);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error al eliminar la entrada');
    } finally {
      setIsDeleting(false);
    }
  };

  // Preview de los primeros campos
  const fields = entry.register.fields?.fields || [];
  const previewFields = fields.slice(0, 2);

  const getFieldValuePreview = (fieldId: string, fieldLabel: string): string => {
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
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
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
                    {getFieldValuePreview(field.id, field.label)}
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
                    {getFieldValuePreview(field.id, field.label)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Notas */}
          {entry.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">Notas</p>
                  <p className="text-sm text-blue-800 line-clamp-2">{entry.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowViewModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Eye size={16} />
              Ver
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={16} />
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Footer con timestamp */}
        <div className="bg-gray-50 px-5 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Registrado el {new Date(entry.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })} a las {new Date(entry.created_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Modals */}
      {showViewModal && (
        <ViewEntryModal
          entry={entry}
          psychologistName={psychologistName}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showEditModal && (
        <EditEntryModal
          entry={entry}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}