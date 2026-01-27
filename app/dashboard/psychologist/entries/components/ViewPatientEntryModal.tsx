// app/dashboard/psychologist/entries/components/ViewPatientEntryModal.tsx
'use client';

import { X, Calendar, User, MessageSquare, FileText } from 'lucide-react';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';
import ClinicalNotesSection from './ClinicalNotesSection';

interface Entry {
  id: string;
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
  onClose: () => void;
}

export default function ViewPatientEntryModal({ entry, onClose }: Props) {
  if (!entry.register || !entry.patient) {
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
        const maxValue = fields.find(f => f.id === fieldId)?.max || 10;
        const percentage = (numValue / maxValue) * 100;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-teal-600 w-12 text-right">
                {numValue}
              </span>
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
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {value ? '✓ Sí' : '✗ No'}
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-purple-50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {entry.patient.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {entry.register.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{entry.patient.full_name}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Metadatos */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span className="font-medium">
                {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
              <FileText className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">
                {fields.length} {fields.length === 1 ? 'campo' : 'campos'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-300px)] overflow-y-auto space-y-6">
          {/* Campos */}
          {fields.map((field, index) => (
            <div 
              key={field.id} 
              className={`pb-6 ${index < fields.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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

          {/* Notas del paciente */}
          {entry.notes && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    Notas adicionales del paciente
                  </p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                    {entry.notes}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">Fecha de registro</p>
                <p>
                  {new Date(entry.created_at).toLocaleString('es-ES', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">ID de entrada</p>
                <p className="font-mono text-xs">{entry.id}</p>
              </div>
            </div>
          </div>

          {/* Notas Clínicas */}
          <div className="border-t border-gray-200 pt-6">
            <ClinicalNotesSection entryId={entry.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}