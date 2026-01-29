// app/dashboard/psychologist/settings/components/NotificationsTab.tsx
'use client';

import { useState } from 'react';
import { Save, Mail, MessageSquare, Bell, TrendingUp } from 'lucide-react';

interface Props {
  userId: string;
}

export default function NotificationsTab({ userId }: Props) {
  const [emailNewPatient, setEmailNewPatient] = useState(true);
  const [emailNewEntry, setEmailNewEntry] = useState(true);
  const [emailWeeklySummary, setEmailWeeklySummary] = useState(true);
  const [emailProductUpdates, setEmailProductUpdates] = useState(false);
  const [pushNewEntry, setPushNewEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);

    // TODO: Guardar preferencias
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Preferencias de Notificaciones</h2>
        <p className="text-gray-600 text-sm mt-1">
          Gestiona cómo y cuándo quieres recibir notificaciones
        </p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-gray-900">Notificaciones por Email</h3>
        </div>

        {/* New Patient */}
        <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-teal-300 transition-colors">
          <input
            type="checkbox"
            checked={emailNewPatient}
            onChange={(e) => setEmailNewPatient(e.target.checked)}
            className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Nuevo Paciente</p>
            <p className="text-sm text-gray-600">
              Recibe un email cuando un paciente se registre con tu código de invitación
            </p>
          </div>
        </label>

        {/* New Entry */}
        <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-teal-300 transition-colors">
          <input
            type="checkbox"
            checked={emailNewEntry}
            onChange={(e) => setEmailNewEntry(e.target.checked)}
            className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Nueva Entrada Completada</p>
            <p className="text-sm text-gray-600">
              Notificación cuando un paciente complete un registro
            </p>
          </div>
        </label>

        {/* Weekly Summary */}
        <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-teal-300 transition-colors">
          <input
            type="checkbox"
            checked={emailWeeklySummary}
            onChange={(e) => setEmailWeeklySummary(e.target.checked)}
            className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Resumen Semanal</p>
            <p className="text-sm text-gray-600">
              Recibe un resumen semanal de la actividad de tus pacientes
            </p>
          </div>
        </label>

        {/* Product Updates */}
        <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-teal-300 transition-colors">
          <input
            type="checkbox"
            checked={emailProductUpdates}
            onChange={(e) => setEmailProductUpdates(e.target.checked)}
            className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Novedades del Producto</p>
            <p className="text-sm text-gray-600">
              Mantente al día con nuevas funcionalidades y mejoras de MoodLog
            </p>
          </div>
        </label>
      </div>

      {/* Push Notifications (Coming Soon) */}
      <div className="space-y-4 opacity-50">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Notificaciones Push</h3>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            Próximamente
          </span>
        </div>

        <label className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
          <input
            type="checkbox"
            checked={pushNewEntry}
            disabled
            className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Nueva Entrada en Tiempo Real</p>
            <p className="text-sm text-gray-600">
              Notificación instantánea en tu dispositivo cuando un paciente complete una entrada
            </p>
          </div>
        </label>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Save className="w-5 h-5" />
          ¡Preferencias guardadas exitosamente!
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
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
              Guardar Preferencias
            </>
          )}
        </button>
      </div>
    </div>
  );
}