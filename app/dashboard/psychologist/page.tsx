// app/dashboard/psychologist/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, FileText, TrendingUp, Plus, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function PsychologistDashboard() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener estadísticas
  const { count: totalPatients } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('psychologist_id', user.id);

  const { count: totalRegisters } = await supabase
    .from('auto_registers')
    .select('*', { count: 'exact', head: true })
    .eq('psychologist_id', user.id);

  const { count: activeAssignments } = await supabase
    .from('patient_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('psychologist_id', user.id)
    .eq('is_active', true);

  const { count: todayEntries } = await supabase
    .from('register_entries')
    .select('*', { count: 'exact', head: true })
    .gte('entry_date', new Date().toISOString().split('T')[0]);

  // Pacientes recientes
  const { data: recentPatients } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('psychologist_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      name: 'Pacientes Activos',
      value: totalPatients || 0,
      icon: Users,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
    },
    {
      name: 'Registros Creados',
      value: totalRegisters || 0,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      name: 'Asignaciones Activas',
      value: activeAssignments || 0,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      name: 'Entradas Hoy',
      value: todayEntries || 0,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/psychologist/patients/new"
          className="bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Añadir Paciente</h3>
              <p className="text-white/80 text-sm mt-1">Invita a un nuevo paciente a MoodLog</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/psychologist/registers/new"
          className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-teal-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-teal-50 transition-colors">
              <FileText className="w-7 h-7 text-gray-600 group-hover:text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Crear Registro</h3>
              <p className="text-gray-600 text-sm mt-1">Diseña un nuevo autorregistro</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Pacientes Recientes</h3>
          <Link
            href="/dashboard/psychologist/patients"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Ver todos →
          </Link>
        </div>

        {recentPatients && recentPatients.length > 0 ? (
          <div className="space-y-3">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {patient.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {patient.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Añadido {new Date(patient.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/psychologist/patients/${patient.id}/progress`}
                    className="px-3 py-1.5 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors inline-flex items-center gap-1"
                  >
                    <TrendingUp size={16} />
                    Progreso
                  </Link>
                  <Link
                    href={`/dashboard/psychologist/patients/${patient.id}`}
                    className="px-3 py-1.5 bg-teal-100 text-teal-600 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">Aún no tienes pacientes</p>
            <Link
              href="/dashboard/psychologist/patients/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus size={20} />
              Añadir tu primer paciente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}