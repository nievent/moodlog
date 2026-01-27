// app/dashboard/patient/history/components/ViewEntryModal.tsx
'use client';

import { X, Calendar, MessageSquare } from 'lucide-react';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';

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

interface Props {
  entry: Entry;
  onClose: () => void;
}

export default function ViewEntryModal({ entry, onClose }: Props) {
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
        return (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 to-purple-500"
                style={{ width: `${(value as number) * 10}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-teal-600">{value as number}</span>
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
          <span className="font-medium text-gray-900">
            {value as string}
          </span>
        );

      case 'textarea':
        return (
          <p className="text-gray-900 whitespace-pre-wrap">{value as string}</p>
        );

      default:
        return <span className="font-medium text-gray-900">{String(value)}</span>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto space-y-6">
          {/* Campos */}
          {fields.map((field) => (
            <div key={field.id} className="border-b border-gray-100 pb-4 last:border-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-600 ml-1">*</span>}
              </label>
              {renderFieldValue(field.id, field.type)}
            </div>
          ))}

          {/* Notas */}
          {entry.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Notas adicionales</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">{entry.notes}</p>
                </div>
              </div>
            </div>
          )}

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
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}