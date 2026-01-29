// app/dashboard/patient/registers/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileText, Calendar, TrendingUp, Clock, CheckCircle, Target } from 'lucide-react';
import RegisterCard from './components/RegisterCard';
import { AutoRegisterFields } from '@/types/database.types';

export default async function PatientRegistersPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener perfil del paciente
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, psychologist_id')
    .eq('id', user.id)
    .single();

  // Obtener nombre del psicólogo
  let psychologistName = null;
  if (profile?.psychologist_id) {
    const { data: psychologist } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', profile.psychologist_id)
      .single();
    
    psychologistName = psychologist?.full_name;
  }

  // Tipo para las asignaciones
  type AssignmentWithRegister = {
    id: string;
    frequency: string | null;
    start_date: string;
    end_date: string | null;
    notes: string | null;
    created_at: string;
    auto_register: {
      id: string;
      name: string;
      description: string | null;
      fields: AutoRegisterFields;
    } | null;
  };

  // Obtener registros asignados activos
  const { data: assignmentsRaw } = await supabase
    .from('patient_assignments')
    .select('*')
    .eq('patient_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Obtener los auto_registers asociados
  const registerIds = [...new Set(assignmentsRaw?.map(a => a.auto_register_id) || [])];
  
  const { data: autoRegisters } = registerIds.length > 0 ? await supabase
    .from('auto_registers')
    .select('id, name, description, fields')
    .in('id', registerIds) : { data: [] };

  // Combinar datos
  const assignments: AssignmentWithRegister[] = assignmentsRaw
    ?.map(a => {
      const autoRegister = autoRegisters?.find(r => r.id === a.auto_register_id);
      
      return {
        id: a.id,
        frequency: a.frequency,
        start_date: a.start_date,
        end_date: a.end_date,
        notes: a.notes,
        created_at: a.created_at,
        auto_register: autoRegister || null,
      };
    })
    .filter((a): a is AssignmentWithRegister => a.auto_register !== null) || [];

  // Obtener todas las entradas del paciente
  const assignmentIds = assignments?.map(a => a.id) || [];
  const { data: allEntries } = assignmentIds.length > 0 ? await supabase
    .from('register_entries')
    .select('assignment_id, entry_date, created_at')
    .in('assignment_id', assignmentIds)
    .order('entry_date', { ascending: false }) : { data: null };

  // Contar entradas por asignación
  const entriesPerAssignment = allEntries?.reduce((acc, entry) => {
    acc[entry.assignment_id] = (acc[entry.assignment_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Última entrada por asignación
  const lastEntryPerAssignment = allEntries?.reduce((acc, entry) => {
    if (!acc[entry.assignment_id] || entry.entry_date > acc[entry.assignment_id]) {
      acc[entry.assignment_id] = entry.entry_date;
    }
    return acc;
  }, {} as Record<string, string>) || {};

  // Calcular entradas de hoy
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = allEntries?.filter(e => e.entry_date === today).length || 0;

  // Calcular entradas de esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekEntries = allEntries?.filter(e => new Date(e.entry_date) >= weekAgo).length || 0;

  // Total de entradas
  const totalEntries = allEntries?.length || 0;

  // Registros que debo completar HOY (diarios sin completar hoy)
  const pendingToday = assignments.filter(a => {
    if (a.frequency !== 'daily') return false;
    const lastEntry = lastEntryPerAssignment[a.id];
    return !lastEntry || lastEntry !== today;
  }).length;

  // Agrupar por frecuencia
  const dailyRegisters = assignments.filter(a => a.frequency === 'daily');
  const weeklyRegisters = assignments.filter(a => a.frequency === 'weekly');
  const freeRegisters = assignments.filter(a => a.frequency === 'as_needed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Autorregistros</h1>
        <p className="text-gray-600 mt-1">
          {assignments.length} registros asignados
          {psychologistName && (
            <span className="text-purple-600 font-medium"> • Por {psychologistName}</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registros</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{assignments.length}</p>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{todayEntries}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Esta Semana</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{weekEntries}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingToday}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerta si hay pendientes hoy */}
      {pendingToday > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-1">
                Tienes {pendingToday} {pendingToday === 1 ? 'registro pendiente' : 'registros pendientes'} para hoy
              </h3>
              <p className="text-orange-800 text-sm">
                Completa tus registros diarios para mantener un seguimiento constante de tu progreso.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de motivación si completó todo hoy */}
      {pendingToday === 0 && dailyRegisters.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-300 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                ¡Excelente! Has completado todos tus registros de hoy 🎉
              </h3>
              <p className="text-green-800 text-sm">
                Mantén este ritmo y verás grandes resultados.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Registros Diarios */}
      {dailyRegisters.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-400 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registros Diarios</h2>
              <p className="text-sm text-gray-600">
                Completa estos registros cada día
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dailyRegisters.map((assignment) => (
              <RegisterCard
                key={assignment.id}
                assignment={{
                  ...assignment,
                  totalEntries: entriesPerAssignment[assignment.id] || 0,
                  lastEntry: lastEntryPerAssignment[assignment.id] || null,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Registros Semanales */}
      {weeklyRegisters.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registros Semanales</h2>
              <p className="text-sm text-gray-600">
                Completa estos registros una vez por semana
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyRegisters.map((assignment) => (
              <RegisterCard
                key={assignment.id}
                assignment={{
                  ...assignment,
                  totalEntries: entriesPerAssignment[assignment.id] || 0,
                  lastEntry: lastEntryPerAssignment[assignment.id] || null,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Registros Libres */}
      {freeRegisters.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registros Libres</h2>
              <p className="text-sm text-gray-600">
                Completa cuando lo necesites o cuando tu psicólogo lo indique
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeRegisters.map((assignment) => (
              <RegisterCard
                key={assignment.id}
                assignment={{
                  ...assignment,
                  totalEntries: entriesPerAssignment[assignment.id] || 0,
                  lastEntry: lastEntryPerAssignment[assignment.id] || null,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {assignments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes registros asignados todavía
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Tu psicólogo te asignará registros para que puedas hacer seguimiento de tu progreso.
            Mientras tanto, puedes explorar tu historial o ver tu progreso.
          </p>
        </div>
      )}
    </div>
  );
}