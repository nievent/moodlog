// app/dashboard/psychologist/registers/new/components/PreviewModal.tsx
'use client';

import { X } from 'lucide-react';
import { FormField } from '@/types/database.types';

interface Props {
  registerName: string;
  description: string;
  fields: FormField[];
  onClose: () => void;
}

export default function PreviewModal({ registerName, description, fields, onClose }: Props) {
  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={field.placeholder}
            disabled
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            rows={4}
            disabled
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500 resize-none"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            disabled
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500"
          />
        );

      case 'scale':
        return (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{field.min || 0}</span>
              <span className="text-2xl font-bold text-teal-600">{field.min || 0}</span>
              <span className="text-sm font-medium text-gray-700">{field.max || 10}</span>
            </div>
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 10}
              defaultValue={field.min || 0}
              disabled
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Mínimo</span>
              <span>Máximo</span>
            </div>
          </div>
        );

      case 'select':
        return (
          <select
            disabled
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500"
          >
            <option>Selecciona una opción...</option>
            {field.options?.map((option, idx) => (
              <option key={idx}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.slice(0, 5).map((option, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg bg-gray-50"
              >
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-500">{option}</span>
              </label>
            ))}
            {field.options && field.options.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                ... y {field.options.length - 5} opciones más
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            disabled
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500"
          />
        );

      case 'time':
        return (
          <input
            type="time"
            disabled
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Vista Previa
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Así verán tus pacientes este registro
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content - Simulación del formulario del paciente */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Header del registro */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {registerName || 'Sin nombre'}
            </h2>
            {description && (
              <p className="text-gray-600">
                {description}
              </p>
            )}
          </div>

          {/* Campos */}
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    {field.label}
                    {field.required && <span className="text-red-600">*</span>}
                  </span>
                </label>
                {renderFieldPreview(field)}
              </div>
            ))}
          </div>

          {/* Notas adicionales (simulación) */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              placeholder="¿Algo más que quieras añadir?"
              rows={3}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-500 resize-none"
            />
          </div>

          {/* Botón de guardar (simulación) */}
          <div className="mt-8 flex gap-3">
            <button
              disabled
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              disabled
              className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl font-semibold opacity-50 cursor-not-allowed"
            >
              Guardar Entrada
            </button>
          </div>

          {/* Advertencia */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Nota:</strong> Esta es una vista previa. Los campos están deshabilitados y no se pueden completar.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
}