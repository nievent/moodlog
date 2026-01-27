// app/dashboard/patient/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileText, Calendar, TrendingUp, CheckCircle, Clock, Plus } from 'lucide-react';
import AssignedRegisterCard from './components/AssignedRegisterCard';
import { AutoRegisterFields } from '@/types/database.types';

export default async function PatientDashboard() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, psychologist_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'patient') {
    redirect('/login');
  }

  // Definir el tipo de assignments
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

  // 1. Obtener registros asignados
  const { data: assignmentsRaw } = await supabase
    .from('patient_assignments')
    .select('*')
    .eq('patient_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // 2. Obtener los auto_registers asociados
  const registerIds = [...new Set(assignmentsRaw?.map(a => a.auto_register_id) || [])];
  
  const { data: autoRegisters } = registerIds.length > 0 ? await supabase
    .from('auto_registers')
    .select('id, name, description, fields')
    .in('id', registerIds) : { data: [] };

  // 3. Combinar datos
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

  // Obtener entradas de esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: recentEntries } = await supabase
    .from('register_entries')
    .select('id, entry_date, assignment_id')
    .eq('patient_id', user.id)
    .gte('entry_date', weekAgo.toISOString())
    .order('entry_date', { ascending: false });

  // Contar entradas por asignación
  const assignmentIds = assignments?.map(a => a.id) || [];
  const { data: allEntries } = assignmentIds.length > 0 ? await supabase
    .from('register_entries')
    .select('assignment_id, entry_date')
    .in('assignment_id', assignmentIds) : { data: null };

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

  const totalAssignments = assignments?.length || 0;
  const entriesThisWeek = recentEntries?.length || 0;
  const totalEntries = Object.values(entriesPerAssignment).reduce((sum, count) => sum + count, 0);

  // Stats rápidas
  const stats = [
    {
      name: 'Registros Activos',
      value: totalAssignments,
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      name: 'Esta Semana',
      value: entriesThisWeek,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Total Entradas',
      value: totalEntries,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hola, <span className="text-teal-600">{profile.full_name.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational message */}
        {entriesThisWeek > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-purple-50 border border-teal-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  ¡Excelente progreso! 🎉
                </h3>
                <p className="text-gray-700">
                  Has completado {entriesThisWeek} {entriesThisWeek === 1 ? 'entrada' : 'entradas'} esta semana. 
                  Mantén el buen trabajo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registros Asignados */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Mis Autorregistros</h2>
          </div>

          {assignments && assignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <AssignedRegisterCard
                  key={assignment.id}
                  assignment={{
                    ...assignment,
                    totalEntries: entriesPerAssignment[assignment.id] || 0,
                    lastEntry: lastEntryPerAssignment[assignment.id] || null,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes registros asignados
              </h3>
              <p className="text-gray-600">
                Tu psicólogo te asignará registros para que puedas comenzar tu seguimiento
              </p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {recentEntries && recentEntries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-3">
              {recentEntries.slice(0, 5).map((entry) => {
                const assignment = assignments?.find(a => a.id === entry.assignment_id);
                if (!assignment?.auto_register) return null;
                
                return (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {assignment.auto_register.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.entry_date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}