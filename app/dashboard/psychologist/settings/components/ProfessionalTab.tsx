// app/dashboard/psychologist/settings/components/ProfessionalTab.tsx
'use client';

import { useState } from 'react';
import { Save, Award, Building, Phone, MapPin } from 'lucide-react';
import { updateProfessionalProfile } from '@/app/actions/settings';

interface PsychologistProfile {
  id: string;
  license_number: string | null;
  specialization: string | null;
  organization: string | null;
  phone: string | null;
  timezone: string;
}

interface Props {
  psychProfile: PsychologistProfile | null;
  userId: string;
}

const SPECIALIZATIONS = [
  'Psicología Clínica',
  'Psicología Cognitivo-Conductual',
  'Psicología Infantil',
  'Psicología de Pareja',
  'Psicología de la Salud',
  'Neuropsicología',
  'Psicología Educativa',
  'Psicología Organizacional',
  'Terapia Sistémica',
  'Terapia Gestalt',
  'EMDR',
  'Mindfulness',
  'Otra',
];

const TIMEZONES = [
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Atlantic/Canary', label: 'Islas Canarias (WET/WEST)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST)' },
  { value: 'America/Bogota', label: 'Bogotá (COT)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Santiago', label: 'Santiago (CLT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
];

export default function ProfessionalTab({ psychProfile, userId }: Props) {
  const [licenseNumber, setLicenseNumber] = useState(psychProfile?.license_number || '');
  const [specialization, setSpecialization] = useState(psychProfile?.specialization || '');
  const [organization, setOrganization] = useState(psychProfile?.organization || '');
  const [phone, setPhone] = useState(psychProfile?.phone || '');
  const [timezone, setTimezone] = useState(psychProfile?.timezone || 'Europe/Madrid');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const result = await updateProfessionalProfile({
        userId,
        licenseNumber: licenseNumber || null,
        specialization: specialization || null,
        organization: organization || null,
        phone: phone || null,
        timezone,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Error al actualizar la información profesional');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Datos Profesionales</h2>
        <p className="text-gray-600 text-sm mt-1">
          Información sobre tu práctica y credenciales profesionales
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">
              ℹ️ Información Profesional
            </p>
            <p className="text-sm text-blue-800">
              Esta información ayuda a identificarte profesionalmente. 
              No es obligatoria pero recomendamos completarla para mayor credibilidad.
            </p>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Número de Colegiado */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Número de Colegiado (COP)
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Ej: M-12345"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tu número de colegiado del Colegio Oficial de Psicólogos
          </p>
        </div>

        {/* Especialización */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Especialización Principal
          </label>
          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          >
            <option value="">Selecciona una especialización...</option>
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Organización/Consulta */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Organización / Consulta
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Building className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Ej: Centro de Psicología MoodLog"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Nombre de tu consulta privada o centro donde trabajas
          </p>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Teléfono de Contacto
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Zona Horaria */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Zona Horaria
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Para mostrar fechas y horas correctamente
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Save className="w-5 h-5" />
          ¡Información profesional actualizada!
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
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}