// app/dashboard/psychologist/registers/new/components/FieldConfigModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { FormField } from '@/types/database.types';

interface Props {
  field: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
}

export default function FieldConfigModal({ field, onSave, onCancel }: Props) {
  const [label, setLabel] = useState(field.label);
  const [required, setRequired] = useState(field.required || false);
  const [placeholder, setPlaceholder] = useState(field.placeholder || '');
  const [min, setMin] = useState(field.min?.toString() || '');
  const [max, setMax] = useState(field.max?.toString() || '');
  const [options, setOptions] = useState<string[]>(field.options || ['']);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const updatedField: FormField = {
      ...field,
      label,
      required,
      placeholder,
    };

    if (field.type === 'scale' || field.type === 'number') {
      if (min) updatedField.min = parseInt(min);
      if (max) updatedField.max = parseInt(max);
    }

    if (field.type === 'select' || field.type === 'multiselect') {
      updatedField.options = options.filter(opt => opt.trim() !== '');
    }

    onSave(updatedField);
  };

  const needsOptions = field.type === 'select' || field.type === 'multiselect';
  const needsMinMax = field.type === 'scale' || field.type === 'number';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                Configurar Campo
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Personaliza los detalles de este campo
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Nombre del campo */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Etiqueta del Campo *
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: ¿Cómo te sientes hoy?"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              autoFocus
            />
          </div>

          {/* Campo obligatorio */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
            <input
              type="checkbox"
              id="required"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="required" className="flex-1 cursor-pointer">
              <p className="font-semibold text-gray-900">Campo Obligatorio</p>
              <p className="text-sm text-gray-600">El paciente debe completar este campo</p>
            </label>
          </div>

          {/* Placeholder (solo para text, textarea, number) */}
          {(field.type === 'text' || field.type === 'textarea' || field.type === 'number') && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Texto de Ayuda (placeholder)
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="Texto que aparece cuando el campo está vacío..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          )}

          {/* Min/Max (para scale y number) */}
          {needsMinMax && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Valor Mínimo
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder={field.type === 'scale' ? '0' : 'Ej: 0'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Valor Máximo
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder={field.type === 'scale' ? '10' : 'Ej: 100'}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Opciones (para select y multiselect) */}
          {needsOptions && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Opciones
                </label>
                <button
                  onClick={handleAddOption}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Añadir Opción
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                    />
                    {options.length > 1 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Eliminar opción"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.filter(opt => opt.trim() === '').length > 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Las opciones vacías se eliminarán al guardar
                </p>
              )}
            </div>
          )}

          {/* Mensaje informativo según tipo */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Consejo:</strong>{' '}
              {field.type === 'scale' && 'Las escalas son ideales para medir intensidad emocional de 0 a 10.'}
              {field.type === 'text' && 'Los campos de texto corto son perfectos para respuestas breves.'}
              {field.type === 'textarea' && 'Los campos de texto largo permiten respuestas detalladas.'}
              {field.type === 'number' && 'Los campos numéricos son útiles para cantidades o medidas.'}
              {field.type === 'select' && 'Las selecciones únicas son ideales para categorías.'}
              {field.type === 'multiselect' && 'Las selecciones múltiples permiten elegir varios elementos.'}
              {field.type === 'date' && 'Los campos de fecha son útiles para registrar eventos.'}
              {field.type === 'time' && 'Los campos de hora son útiles para registrar horarios.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-gray-200 flex gap-3 bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim() || (needsOptions && options.filter(opt => opt.trim() !== '').length === 0)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Guardar Campo
          </button>
        </div>
      </div>
    </div>
  );
}