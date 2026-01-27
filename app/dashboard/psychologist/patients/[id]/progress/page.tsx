// app/dashboard/psychologist/patients/[id]/progress/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeft, TrendingUp, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';
import ProgressCharts from './components/ProgressCharts';
import { RegisterEntryData, AutoRegisterFields } from '@/types/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProgressPage({ params }: PageProps) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener info del paciente
  const { data: patient } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('id', patientId)
    .eq('psychologist_id', user.id)
    .single();

  if (!patient) {
    redirect('/dashboard/psychologist/patients');
  }

  // Obtener todas las entradas del paciente con sus registros
  const { data: entriesRaw } = await supabase
    .from('register_entries')
    .select('*')
    .eq('patient_id', patientId)
    .order('entry_date', { ascending: true });

  // Obtener asignaciones
  const assignmentIds = [...new Set(entriesRaw?.map(e => e.assignment_id) || [])];
  
  const { data: assignments } = assignmentIds.length > 0 ? await supabase
    .from('patient_assignments')
    .select('id, auto_register_id')
    .in('id', assignmentIds) : { data: [] };

  // Obtener registros
  const registerIds = [...new Set(assignments?.map(a => a.auto_register_id) || [])];
  
  const { data: registers } = registerIds.length > 0 ? await supabase
    .from('auto_registers')
    .select('id, name, fields')
    .in('id', registerIds) : { data: [] };

  // Combinar datos
  type EntryWithRegister = {
    id: string;
    data: RegisterEntryData;
    entry_date: string;
    created_at: string;
    register: {
      id: string;
      name: string;
      fields: AutoRegisterFields;
    } | null;
  };

  const entries: EntryWithRegister[] = entriesRaw?.map(entry => {
    const assignment = assignments?.find(a => a.id === entry.assignment_id);
    const register = registers?.find(r => r.id === assignment?.auto_register_id);
    
    return {
      id: entry.id,
      data: entry.data,
      entry_date: entry.entry_date,
      created_at: entry.created_at,
      register: register || null,
    };
  }).filter(e => e.register !== null) || [];

  // Stats
  const totalEntries = entries.length;
  const firstEntry = entries[0]?.entry_date;
  const lastEntry = entries[entries.length - 1]?.entry_date;
  const uniqueRegisters = new Set(entries.map(e => e.register?.id)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/psychologist/patients/${patientId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Volver al perfil
        </Link>

        <div className="flex items-center gap-4 mb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {patient.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Progreso de {patient.full_name}
            </h1>
            <p className="text-gray-600">
              Análisis de evolución y tendencias
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entradas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalEntries}</p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registros</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueRegisters}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Primera Entrada</p>
            <p className="text-lg font-semibold text-gray-900">
              {firstEntry ? new Date(firstEntry).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              }) : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Última Entrada</p>
            <p className="text-lg font-semibold text-gray-900">
              {lastEntry ? new Date(lastEntry).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
              }) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      {entries.length > 0 ? (
        <ProgressCharts entries={entries} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay datos suficientes
          </h3>
          <p className="text-gray-600">
            {patient.full_name} necesita completar al menos una entrada para ver gráficos
          </p>
        </div>
      )}
    </div>
  );
}