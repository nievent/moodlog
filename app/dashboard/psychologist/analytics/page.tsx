// app/dashboard/psychologist/analytics/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  Activity,
  Clock,
  Award,
  Target
} from 'lucide-react';
import AnalyticsCharts from './components/AnalyticsCharts';
import TopPatients from './components/TopPatients';
import ActivityTimeline from './components/ActivityTimeline';
import RegistersBreakdown from './components/RegistersBreakdown';

export default async function AnalyticsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // ESTADÍSTICAS GENERALES

  // Total de pacientes
  const { count: totalPatients } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('psychologist_id', user.id);

  // Total de entradas
  const { data: allEntriesData } = await supabase
    .from('register_entries')
    .select('id, entry_date, created_at, patient_id')
    .order('entry_date', { ascending: false });

  const totalEntries = allEntriesData?.length || 0;

  // Entradas este mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const entriesThisMonth = allEntriesData?.filter(e => 
    new Date(e.entry_date) >= startOfMonth
  ).length || 0;

  // Entradas esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const entriesThisWeek = allEntriesData?.filter(e => 
    new Date(e.entry_date) >= weekAgo
  ).length || 0;

  // Pacientes activos (con entradas en los últimos 7 días)
  const activePatientsIds = new Set(
    allEntriesData?.filter(e => new Date(e.entry_date) >= weekAgo)
      .map(e => e.patient_id) || []
  );
  const activePatientsCount = activePatientsIds.size;

  // Total de registros
  const { count: totalRegisters } = await supabase
    .from('auto_registers')
    .select('*', { count: 'exact', head: true })
    .eq('psychologist_id', user.id);

  // Asignaciones activas
  const { count: activeAssignments } = await supabase
    .from('patient_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('psychologist_id', user.id)
    .eq('is_active', true);

  // Tasa de adherencia (entradas completadas vs esperadas esta semana)
  // Simplificado: asumimos 1 entrada esperada por asignación activa por semana
  const expectedEntriesThisWeek = activeAssignments || 0;
  const adherenceRate = expectedEntriesThisWeek > 0 
    ? Math.round((entriesThisWeek / expectedEntriesThisWeek) * 100)
    : 0;

  // Promedio de entradas por paciente
  const avgEntriesPerPatient = totalPatients && totalPatients > 0
    ? Math.round(totalEntries / totalPatients)
    : 0;

  // Datos para gráficos
  const { data: patientsData } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('psychologist_id', user.id)
    .order('created_at', { ascending: true });

  const { data: registersData } = await supabase
    .from('auto_registers')
    .select('id, name, created_at')
    .eq('psychologist_id', user.id)
    .order('created_at', { ascending: true });

  const stats = [
    {
      name: 'Total Pacientes',
      value: totalPatients || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+12%',
      trend: 'up' as const,
    },
    {
      name: 'Total Entradas',
      value: totalEntries,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+28%',
      trend: 'up' as const,
    },
    {
      name: 'Pacientes Activos',
      value: activePatientsCount,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: `${Math.round((activePatientsCount / (totalPatients || 1)) * 100)}%`,
      trend: 'neutral' as const,
    },
    {
      name: 'Tasa Adherencia',
      value: `${adherenceRate}%`,
      icon: Target,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: adherenceRate >= 70 ? 'Excelente' : 'Mejorable',
      trend: adherenceRate >= 70 ? 'up' as const : 'down' as const,
    },
    {
      name: 'Este Mes',
      value: entriesThisMonth,
      icon: Calendar,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      change: `${entriesThisWeek} esta semana`,
      trend: 'neutral' as const,
    },
    {
      name: 'Promedio/Paciente',
      value: avgEntriesPerPatient,
      icon: TrendingUp,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      change: 'entradas',
      trend: 'neutral' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Análisis</h1>
          <p className="text-gray-600 mt-1">
            Visión general de tu práctica y el progreso de tus pacientes
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-50 to-purple-50 border-2 border-teal-200 rounded-xl">
          <Award className="w-5 h-5 text-teal-600" />
          <div>
            <p className="text-xs text-gray-600 font-medium">Periodo</p>
            <p className="text-sm font-bold text-gray-900">Últimos 30 días</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all overflow-hidden group"
            >
              {/* Background gradient decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'down' && (
                    <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                      <TrendingUp className="w-4 h-4 rotate-180" />
                      {stat.change}
                    </div>
                  )}
                  {stat.trend === 'neutral' && (
                    <div className="text-gray-500 text-sm font-medium">
                      {stat.change}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos principales */}
      <AnalyticsCharts 
        entriesData={allEntriesData || []}
        patientsData={patientsData || []}
      />

      {/* Sección secundaria: 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pacientes */}
        <TopPatients 
          entriesData={allEntriesData || []}
          patientsData={patientsData || []}
        />

        {/* Breakdown de registros */}
        <RegistersBreakdown 
          registersData={registersData || []}
          assignmentsCount={activeAssignments || 0}
        />
      </div>

      {/* Timeline de actividad */}
      <ActivityTimeline 
        entriesData={allEntriesData || []}
        patientsData={patientsData || []}
      />

      {/* Footer con insights */}
      <div className="bg-gradient-to-r from-teal-50 to-purple-50 border-2 border-teal-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">💡 Insights de tu Práctica</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {adherenceRate >= 80 && (
                <li>• <strong>¡Excelente adherencia!</strong> Tus pacientes están muy comprometidos con el proceso.</li>
              )}
              {adherenceRate < 50 && (
                <li>• <strong>Oportunidad de mejora:</strong> Considera revisar la frecuencia de los registros o motivar a tus pacientes.</li>
              )}
              {activePatientsCount === totalPatients && totalPatients && totalPatients > 0 && (
                <li>• <strong>¡100% de pacientes activos!</strong> Toda tu base está participando activamente.</li>
              )}
              {entriesThisWeek > 20 && (
                <li>• <strong>Semana muy productiva:</strong> {entriesThisWeek} entradas completadas.</li>
              )}
              {totalEntries === 0 && (
                <li>• <strong>¡Empieza a recopilar datos!</strong> Asigna registros a tus pacientes para comenzar el seguimiento.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}