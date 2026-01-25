// app/dashboard/psychologist/registers/components/TemplateCard.tsx
'use client';

import { useState } from 'react';
import { 
  Heart, 
  Zap, 
  TrendingUp, 
  Brain, 
  Activity, 
  Wind, 
  Trophy,
  Eye,
  UserPlus,
  FileText,
  LucideIcon,
  X,
  Trash2
} from 'lucide-react';
import { AutoRegisterFields } from '@/types/database.types';
import AssignModal from './AssignModal';
import { deleteCustomRegister } from '@/app/actions/registers';

interface Template {
  id: string;
  name: string;
  description: string | null;
  fields: AutoRegisterFields;
  category: string | null;
  icon: string | null;
}

interface Props {
  template: Template;
  isGlobal?: boolean; // Para diferenciar plantillas globales de personalizadas
}

const iconMap: Record<string, LucideIcon> = {
  Heart,
  Zap,
  TrendingUp,
  Brain,
  Activity,
  Wind,
  Trophy,
  FileText,
};

export default function TemplateCard({ template, isGlobal = true }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = iconMap[template.icon || 'FileText'] || FileText;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteCustomRegister(template.id);
      if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error deleting register:', error);
      alert('Error al eliminar el registro');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
              {template.name}
            </h4>
            <p className="text-xs text-gray-600 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{template.fields?.fields?.length || 0} campos</span>
          {!isGlobal && (
            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
              Personalizado
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            title="Vista previa"
          >
            <Eye size={14} />
            Ver
          </button>
          
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
            title="Asignar a pacientes"
          >
            <UserPlus size={14} />
            Asignar
          </button>

          {/* Botón eliminar solo para personalizados */}
          {!isGlobal && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Eliminar registro"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                )}
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-4">
                {template.fields?.fields?.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="text-xs text-red-600">* Obligatorio</span>
                      )}
                    </div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {field.label}
                    </label>
                    
                    {/* Preview del campo según tipo */}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                        disabled
                      />
                    )}
                    {field.type === 'scale' && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{field.min || 0}</span>
                        <input
                          type="range"
                          min={field.min || 0}
                          max={field.max || 10}
                          className="flex-1"
                          disabled
                        />
                        <span className="text-sm text-gray-600">{field.max || 10}</span>
                      </div>
                    )}
                    {field.type === 'select' && field.options && (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled>
                        <option>Selecciona una opción...</option>
                        {field.options.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'multiselect' && field.options && (
                      <div className="space-y-2">
                        {field.options.slice(0, 3).map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" disabled />
                            {opt}
                          </label>
                        ))}
                        {field.options.length > 3 && (
                          <p className="text-xs text-gray-500">
                            ... y {field.options.length - 3} opciones más
                          </p>
                        )}
                      </div>
                    )}
                    {field.type === 'date' && (
                      <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled />
                    )}
                    {field.type === 'time' && (
                      <input type="time" className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" disabled />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        min={field.min}
                        max={field.max}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar */}
      {showAssignModal && (
        <AssignModal
          registerId={template.id}
          registerName={template.name}
          isGlobal={isGlobal}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </>
  );
}