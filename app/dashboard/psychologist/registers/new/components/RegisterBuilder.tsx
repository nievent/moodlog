// app/dashboard/psychologist/registers/new/components/RegisterBuilder.tsx
'use client';

import { useState } from 'react';
import { 
  Type, 
  Hash, 
  ListChecks, 
  CheckSquare, 
  Sliders, 
  Calendar, 
  Clock, 
  FileText,
  GripVertical,
  Settings,
  Eye,
  Trash2,
  Save,
  Sparkles
} from 'lucide-react';
import { createCustomRegister } from '@/app/actions/customRegisters';
import { FormField } from '@/types/database.types';
import FieldConfigModal from './FieldConfigModal';
import PreviewModal from './PreviewModal';

interface Props {
  psychologistId: string;
}

// Tipos de campos disponibles con sus íconos y colores
const FIELD_TYPES = [
  { 
    type: 'text', 
    label: 'Texto Corto', 
    icon: Type, 
    color: 'from-blue-400 to-blue-600',
    description: 'Respuesta de una línea'
  },
  { 
    type: 'textarea', 
    label: 'Texto Largo', 
    icon: FileText, 
    color: 'from-purple-400 to-purple-600',
    description: 'Respuesta de múltiples líneas'
  },
  { 
    type: 'number', 
    label: 'Número', 
    icon: Hash, 
    color: 'from-green-400 to-green-600',
    description: 'Valor numérico'
  },
  { 
    type: 'scale', 
    label: 'Escala', 
    icon: Sliders, 
    color: 'from-pink-400 to-pink-600',
    description: 'Escala deslizante (0-10)'
  },
  { 
    type: 'select', 
    label: 'Selección Única', 
    icon: CheckSquare, 
    color: 'from-orange-400 to-orange-600',
    description: 'Elige una opción'
  },
  { 
    type: 'multiselect', 
    label: 'Selección Múltiple', 
    icon: ListChecks, 
    color: 'from-teal-400 to-teal-600',
    description: 'Elige varias opciones'
  },
  { 
    type: 'date', 
    label: 'Fecha', 
    icon: Calendar, 
    color: 'from-indigo-400 to-indigo-600',
    description: 'Selector de fecha'
  },
  { 
    type: 'time', 
    label: 'Hora', 
    icon: Clock, 
    color: 'from-cyan-400 to-cyan-600',
    description: 'Selector de hora'
  },
];

export default function RegisterBuilder({ psychologistId }: Props) {
  const [registerName, setRegisterName] = useState('');
  const [registerDescription, setRegisterDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingField, setEditingField] = useState<{ field: FormField; index: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Drag & Drop - Desde la paleta
  const handleDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
  };

  // Drag & Drop - Reordenar campos existentes
  const handleFieldDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleFieldDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleFieldDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== index) {
      const newFields = [...fields];
      const draggedField = newFields[draggedIndex];
      newFields.splice(draggedIndex, 1);
      newFields.splice(index, 0, draggedField);
      setFields(newFields);
      setDraggedIndex(index);
    }
  };

  // Drop - Añadir nuevo campo
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (draggedType) {
      const fieldTypeInfo = FIELD_TYPES.find(ft => ft.type === draggedType);
      
      // Type guard para asegurar que draggedType es un FieldType válido
      type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'scale' | 'date' | 'time' | 'textarea';
      
      const newField: FormField = {
        id: `field_${Date.now()}`,
        label: fieldTypeInfo?.label || 'Campo',
        type: draggedType as FieldType,
        required: false,
        placeholder: '',
        ...(draggedType === 'scale' && { min: 0, max: 10 }),
        ...(draggedType === 'number' && { min: undefined, max: undefined }),
        ...((draggedType === 'select' || draggedType === 'multiselect') && { 
          options: ['Opción 1', 'Opción 2', 'Opción 3'] 
        }),
      };
      
      setEditingField({ field: newField, index: fields.length });
      setShowConfigModal(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Configurar campo
  const handleConfigSave = (configuredField: FormField) => {
    if (editingField) {
      const newFields = [...fields];
      if (editingField.index === fields.length) {
        newFields.push(configuredField);
      } else {
        newFields[editingField.index] = configuredField;
      }
      setFields(newFields);
      setEditingField(null);
      setShowConfigModal(false);
    }
  };

  // Editar campo existente
  const handleEditField = (field: FormField, index: number) => {
    setEditingField({ field, index });
    setShowConfigModal(true);
  };

  // Eliminar campo
  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  // Guardar registro
  const handleSave = async () => {
    if (!registerName.trim()) {
      setError('El nombre del registro es obligatorio');
      return;
    }

    if (fields.length === 0) {
      setError('Debes añadir al menos un campo');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const result = await createCustomRegister({
        psychologistId,
        name: registerName,
        description: registerDescription || null,
        fields: { fields, version: 1 },
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/dashboard/psychologist/registers';
        }, 1500);
      }
    } catch (err) {
      setError('Error al guardar el registro');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Paleta de Campos - Izquierda */}
      <div className="lg:col-span-3">
        <div className="sticky top-24">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-purple-600 p-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Paleta de Campos
              </h3>
              <p className="text-white/80 text-xs mt-1">
                Arrastra para añadir
              </p>
            </div>
            
            <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
              {FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <div
                    key={fieldType.type}
                    draggable
                    onDragStart={() => handleDragStart(fieldType.type)}
                    onDragEnd={handleDragEnd}
                    className={`
                      group cursor-move p-4 rounded-xl border-2 border-dashed border-gray-300
                      hover:border-teal-400 hover:bg-teal-50 transition-all
                      ${draggedType === fieldType.type ? 'opacity-50 scale-95' : 'hover:scale-105'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${fieldType.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">
                          {fieldType.label}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {fieldType.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Área de Construcción - Centro */}
      <div className="lg:col-span-9 space-y-6">
        {/* Info del Registro */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nombre del Registro *
              </label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Ej: Registro de Ansiedad Diario"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={registerDescription}
                onChange={(e) => setRegisterDescription(e.target.value)}
                rows={2}
                placeholder="Breve descripción de qué mide este registro..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Zona de Drop */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            min-h-[400px] bg-white rounded-2xl border-4 border-dashed 
            ${draggedType ? 'border-teal-400 bg-teal-50' : 'border-gray-300'}
            transition-all p-6
          `}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Campos del Registro ({fields.length})
            </h3>
            {fields.length > 0 && (
              <button
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
              >
                <Eye size={16} />
                Previsualizar
              </button>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Arrastra campos aquí
              </h4>
              <p className="text-gray-600 max-w-md">
                Comienza arrastrando campos desde la paleta de la izquierda para construir tu registro personalizado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => {
                const fieldTypeInfo = FIELD_TYPES.find(ft => ft.type === field.type);
                const Icon = fieldTypeInfo?.icon || FileText;
                
                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleFieldDragStart(index)}
                    onDragEnd={handleFieldDragEnd}
                    onDragOver={(e) => handleFieldDragOver(e, index)}
                    className={`
                      group relative bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4
                      hover:border-teal-400 hover:shadow-md transition-all cursor-move
                      ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <GripVertical className="w-5 h-5" />
                        <span className="text-sm font-mono font-bold">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className={`w-10 h-10 bg-gradient-to-br ${fieldTypeInfo?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {field.label}
                          </p>
                          {field.required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                              Obligatorio
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {fieldTypeInfo?.label}
                          {field.placeholder && ` • "${field.placeholder}"`}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditField(field, index)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Configurar"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteField(index)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <Save className="w-5 h-5" />
            ¡Registro creado exitosamente! Redirigiendo...
          </div>
        )}

        {/* Botones de Acción */}
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/psychologist/registers'}
            disabled={isSaving}
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || fields.length === 0 || !registerName}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Registro
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modales */}
      {showConfigModal && editingField && (
        <FieldConfigModal
          field={editingField.field}
          onSave={handleConfigSave}
          onCancel={() => {
            setShowConfigModal(false);
            setEditingField(null);
          }}
        />
      )}

      {showPreview && (
        <PreviewModal
          registerName={registerName}
          description={registerDescription}
          fields={fields}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}