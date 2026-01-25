// app/dashboard/psychologist/patients/new/components/NewPatientForm.tsx
'use client';

import { useState } from 'react';
import { createPatientInvitation } from '@/app/actions/patients';
import { Mail, Copy, Check, Send } from 'lucide-react';

interface Props {
  psychologistId: string;
}

export default function NewPatientForm({ psychologistId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await createPatientInvitation({
        psychologistId,
        patientName: formData.fullName,
        patientEmail: formData.email,
        notes: formData.notes,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.code) {
        setInvitationCode(result.code);
        setSuccess(true);
      }
    } catch (err) {
      setError('Ha ocurrido un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (success && invitationCode) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Invitación Creada!
          </h2>
          <p className="text-gray-600">
            Se ha generado el código de invitación para <strong>{formData.fullName}</strong>
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-purple-50 border border-teal-200 rounded-xl p-6 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Código de Invitación:</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border-2 border-teal-300 rounded-lg px-4 py-3">
              <p className="text-2xl font-mono font-bold text-center text-teal-600 tracking-wider">
                {invitationCode}
              </p>
            </div>
            <button
              onClick={copyToClipboard}
              className="p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 mb-1">Email enviado</p>
                <p className="text-sm text-blue-700">
                  Se ha enviado un correo a <strong>{formData.email}</strong> con el código y las instrucciones para registrarse.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">Instrucciones para el paciente:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Acceder a MoodLog</li>
              <li>Hacer clic en &quot Registrarse &quot</li>
              <li>Seleccionar &quot Paciente &quot</li>
              <li>Introducir el email <strong>{formData.email}</strong></li>
              <li>Introducir el código: <strong className="font-mono">{invitationCode}</strong></li>
              <li>Crear una contraseña y completar el registro</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setInvitationCode('');
                setFormData({ fullName: '', email: '', notes: '' });
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Añadir otro paciente
            </button>
            <a
              href="/dashboard/psychologist/patients"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium text-center hover:shadow-lg transition-all"
            >
              Ver todos los pacientes
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo del paciente *
          </label>
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            placeholder="Ej: María García López"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico *
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
            placeholder="paciente@ejemplo.com"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            El código de invitación se enviará a este email
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notas privadas (opcional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Información adicional sobre el paciente..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Estas notas solo las verás tú
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <a
            href="/dashboard/psychologist/patients"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </a>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : (
              <>
                <Send size={20} />
                Crear Invitación
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}