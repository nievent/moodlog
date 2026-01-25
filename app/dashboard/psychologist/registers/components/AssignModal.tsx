// app/dashboard/psychologist/registers/components/AssignModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Search, Calendar, Check, User } from 'lucide-react';
import { assignRegisterToPatients } from '@/app/actions/registers';
import { createClient } from '@/lib/supabase/client';

interface Props {
  registerId: string;
  registerName: string;
  isGlobal: boolean;
  onClose: () => void;
}

interface Patient {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export default function AssignModal({ registerId, registerName, isGlobal, onClose }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'as_needed'>('as_needed');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Cargar pacientes
  useEffect(() => {
    async function loadPatients() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('psychologist_id', user.id)
        .order('full_name', { ascending: true });

      if (data) {
        setPatients(data);
      }
    }

    loadPatients();
  }, []);

  const togglePatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (selectedPatients.length === 0) {
      setError('Selecciona al menos un paciente');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await assignRegisterToPatients({
        registerId,
        isGlobal,
        patientIds: selectedPatients,
        frequency,
        startDate,
        endDate: endDate || null,
        notes: notes || null,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Error al asignar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Asignar Registro</h3>
            <p className="text-sm text-gray-600 mt-1">{registerName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {/* Seleccionar pacientes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Seleccionar Pacientes
            </label>
            
            {/* Búsqueda */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar paciente..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Lista de pacientes */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <label
                    key={patient.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => togglePatient(patient.id)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {patient.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{patient.full_name}</p>
                    </div>
                    {selectedPatients.includes(patient.id) && (
                      <Check className="w-5 h-5 text-teal-600" />
                    )}
                  </label>
                ))
              ) : (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {searchQuery ? 'No se encontraron pacientes' : 'No tienes pacientes todavía'}
                  </p>
                </div>
              )}
            </div>

            {selectedPatients.length > 0 && (
              <p className="text-sm text-teal-600 mt-2">
                {selectedPatients.length} {selectedPatients.length === 1 ? 'paciente seleccionado' : 'pacientes seleccionados'}
              </p>
            )}
          </div>

          {/* Frecuencia */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Frecuencia de Registro
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFrequency('daily')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  frequency === 'daily'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Diario
              </button>
              <button
                onClick={() => setFrequency('weekly')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  frequency === 'weekly'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Semanal
              </button>
              <button
                onClick={() => setFrequency('as_needed')}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  frequency === 'as_needed'
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Libre
              </button>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Fecha de Inicio
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Fecha de Fin (opcional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notas para el paciente (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
              placeholder="Instrucciones o recordatorios adicionales..."
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <Check className="w-5 h-5" />
              ¡Registro asignado exitosamente!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || success || selectedPatients.length === 0}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Asignando...' : success ? '¡Asignado!' : 'Asignar Registro'}
          </button>
        </div>
      </div>
    </div>
  );
}