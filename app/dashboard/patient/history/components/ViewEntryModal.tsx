// app/dashboard/patient/history/components/ViewEntryModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, FileText, User, AlertCircle } from 'lucide-react';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';
import { getClinicalNotesForPatient } from '@/app/actions/clinicalNotes';

interface Entry {
  id: string;
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

interface ClinicalNote {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  entry: Entry;
  psychologistName?: string | null;
  onClose: () => void;
}

export default function ViewEntryModal({ entry, psychologistName, onClose }: Props) {
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClinicalNotes() {
      
      if (!entry.id) {
        console.error('❌ No hay entry.id');
        setIsLoadingNotes(false);
        return;
      }
      
      setIsLoadingNotes(true);
      setNotesError(null);
      
      try {
        const result = await getClinicalNotesForPatient(entry.id);
        
        
        if (result.error) {
          console.error('❌ Error:', result.error);
          setNotesError(result.error);
        } else if (result.notes) {
          setClinicalNotes(result.notes);
        } else {
        }
      } catch (error) {
        console.error('💥 Error inesperado:', error);
        setNotesError('Error al cargar notas');
      } finally {
        setIsLoadingNotes(false);
      }
    }

    loadClinicalNotes();
  }, [entry.id]);

  if (!entry.register) {
    return null;
  }

  const fields = entry.register.fields?.fields || [];

  const renderFieldValue = (fieldId: string, fieldType: string) => {
    const value = entry.data[fieldId];
    
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Sin respuesta</span>;
    }

    switch (fieldType) {
      case 'scale':
        const numValue = value as number;
        const field = fields.find(f => f.id === fieldId);
        const maxValue = field?.max || 10;
        const percentage = (numValue / maxValue) * 100;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-purple-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-teal-600">{numValue}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Mínimo</span>
              <span>Máximo ({maxValue})</span>
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div className="flex flex-wrap gap-2">
            {(value as string[]).map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? 'Sí' : 'No'}
          </span>
        );

      case 'date':
        return (
          <span className="font-medium text-gray-900">
            {new Date(value as string).toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        );

      case 'time':
        return (
          <span className="font-medium text-gray-900 text-lg">
            {value as string}
          </span>
        );

      case 'textarea':
        return (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-900 whitespace-pre-wrap">{value as string}</p>
          </div>
        );

      default:
        return <span className="font-medium text-gray-900">{String(value)}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-purple-50">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">
              {entry.register.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
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
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto space-y-6">
          {/* Campos */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className={`pb-4 ${index < fields.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  {field.label}
                  {field.required && <span className="text-red-600">*</span>}
                </label>
                <div className="ml-8">
                  {renderFieldValue(field.id, field.type)}
                </div>
              </div>
            ))}
          </div>

          {/* Mis Notas */}
          {entry.notes && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Mis Notas Adicionales
                  </p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{entry.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notas Clínicas del Psicólogo */}
          <div className="border-t-2 border-gray-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">
                Comentarios de {psychologistName || 'tu Psicólogo/a'}
              </h3>
            </div>

            {isLoadingNotes ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                <p className="text-sm text-gray-600 mt-3">Cargando comentarios...</p>
              </div>
            ) : notesError ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Error</p>
                    <p className="text-sm text-red-800">{notesError}</p>
                  </div>
                </div>
              </div>
            ) : clinicalNotes.length > 0 ? (
              <div className="space-y-3">
                {clinicalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {note.note}
                        </p>
                        <p className="text-xs text-purple-600 mt-2">
                          {note.updated_at !== note.created_at && (
                            <span>Actualizado • </span>
                          )}
                          {new Date(note.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-gray-200">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  Tu psicólogo/a aún no ha dejado comentarios en esta entrada
                </p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>
              <strong>Registrado:</strong>{' '}
              {new Date(entry.created_at).toLocaleString('es-ES', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}