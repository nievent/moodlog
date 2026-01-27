// app/dashboard/psychologist/patients/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeft, Calendar, Mail, User, Clock, FileText, Activity, TrendingUp, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { RegisterEntryData, AutoRegisterFields } from '@/types/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientProfilePage({ params }: PageProps) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener info del paciente
  const { data: patient } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', patientId)
    .eq('psychologist_id', user.id)
    .single();

  if (!patient) {
    redirect('/dashboard/psychologist/patients');
  }

  // Obtener email del auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(patientId);

  // Obtener registros asignados
  const { data: assignmentsRaw } = await supabase
    .from('patient_assignments')
    .select(`
      id,
      frequency,
      start_date,
      end_date,
      is_active,
      notes,
      created_at,
      auto_registers (
        id,
        name,
        description,
        fields
      )
    `)
    .eq('patient_id', patientId)
    .eq('psychologist_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Obtener últimas entradas
  const { data: recentEntriesRaw } = await supabase
    .from('register_entries')
    .select('*')
    .eq('patient_id', patientId)
    .order('entry_date', { ascending: false })
    .limit(5);

  // Obtener asignaciones para las entradas
  const entryAssignmentIds = [...new Set(recentEntriesRaw?.map(e => e.assignment_id) || [])];
  const { data: entryAssignments } = entryAssignmentIds.length > 0 ? await supabase
    .from('patient_assignments')
    .select('id, auto_register_id')
    .in('id', entryAssignmentIds) : { data: [] };

  // Obtener registros para las entradas
  const entryRegisterIds = [...new Set(entryAssignments?.map(a => a.auto_register_id) || [])];
  const { data: entryRegisters } = entryRegisterIds.length > 0 ? await supabase
    .from('auto_registers')
    .select('id, name')
    .in('id', entryRegisterIds) : { data: [] };

  // Combinar entradas con registros
  const recentEntries = recentEntriesRaw?.map(entry => {
    const assignment = entryAssignments?.find(a => a.id === entry.assignment_id);
    const register = entryRegisters?.find(r => r.id === assignment?.auto_register_id);
    return {
      ...entry,
      registerName: register?.name || 'Registro desconocido',
    };
  }) || [];

  // Obtener estadísticas
  const { count: totalEntries } = await supabase
    .from('register_entries')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const { count: weekEntries } = await supabase
    .from('register_entries')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .gte('entry_date', weekAgo.toISOString());

  const activeAssignments = assignmentsRaw?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/psychologist/patients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Volver a pacientes
        </Link>

        {/* Patient Info Card */}
        <div className="bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-4xl font-bold">
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{patient.full_name}</h1>
                <div className="space-y-2 text-white/90">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{authUser?.user?.email || 'No disponible'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      Paciente desde {new Date(patient.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <Edit size={20} />
              </button>
              <button className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Entradas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalEntries || 0}</p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{weekEntries || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registros Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeAssignments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href={`/dashboard/psychologist/patients/${patientId}/progress`}
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8" />
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              →
            </div>
          </div>
          <h3 className="text-lg font-bold">Ver Progreso</h3>
          <p className="text-white/80 text-sm mt-1">Gráficos y análisis</p>
        </Link>

        <Link
          href="/dashboard/psychologist/entries"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-teal-600" />
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              →
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Ver Entradas</h3>
          <p className="text-gray-600 text-sm mt-1">Todas las respuestas</p>
        </Link>

        <Link
          href="/dashboard/psychologist/registers"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              →
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Asignar Registro</h3>
          <p className="text-gray-600 text-sm mt-1">Nuevo autorregistro</p>
        </Link>
      </div>

      {/* Registros Asignados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Registros Asignados</h3>
        
        {assignmentsRaw && assignmentsRaw.length > 0 ? (
          <div className="space-y-3">
            {assignmentsRaw.map((assignment) => {
              const register = assignment.auto_registers;
              const frequencyLabel = {
                daily: 'Diario',
                weekly: 'Semanal',
                as_needed: 'Libre',
              }[assignment.frequency || 'as_needed'];

              return (
                <div key={assignment.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{register?.name}</p>
                    <p className="text-sm text-gray-600">
                      {frequencyLabel} · Desde {new Date(assignment.start_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {assignment.notes && (
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      📝 {assignment.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No hay registros asignados todavía</p>
          </div>
        )}
      </div>

      {/* Últimas Entradas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Últimas Entradas</h3>
          <Link
            href="/dashboard/psychologist/entries"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Ver todas →
          </Link>
        </div>

        {recentEntries.length > 0 ? (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{entry.registerName}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No hay entradas todavía</p>
          </div>
        )}
      </div>
    </div>
  );
}