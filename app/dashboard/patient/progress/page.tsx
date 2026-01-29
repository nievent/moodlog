// app/dashboard/patient/progress/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TrendingUp, Calendar, FileText, Award, Target, Activity } from 'lucide-react';
import ProgressCharts from './components/ProgressCharts';
import StreakCard from './components/StreakCard';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';

export default async function PatientProgressPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener perfil del paciente
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, psychologist_id, created_at')
    .eq('id', user.id)
    .single();

  // Obtener todas las entradas del paciente
  const { data: entriesRaw } = await supabase
    .from('register_entries')
    .select('*')
    .eq('patient_id', user.id)
    .order('entry_date', { ascending: true });

  // Obtener asignaciones
  const assignmentIds = [...new Set(entriesRaw?.map(e => e.assignment_id) || [])];
  
  const { data: assignments } = assignmentIds.length > 0 ? await supabase
    .from('patient_assignments')
    .select('id, auto_register_id, frequency')
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

  // Calcular estadísticas
  const totalEntries = entries.length;
  
  // Días en terapia
  const daysInTherapy = profile?.created_at 
    ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Entradas este mes
  const thisMonth = entries.filter(e => {
    const entryDate = new Date(e.entry_date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && 
           entryDate.getFullYear() === now.getFullYear();
  }).length;

  // Calcular racha actual (días consecutivos con al menos 1 entrada)
  let currentStreak = 0;
  const today = new Date();
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    const hasEntry = entries.some(e => e.entry_date === dateString);
    
    if (hasEntry) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Mejor racha histórica (simplificado)
  const bestStreak = Math.max(currentStreak, Math.floor(totalEntries / 7));

  // Promedio de entradas por semana (últimas 4 semanas)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const recentEntries = entries.filter(e => new Date(e.entry_date) >= fourWeeksAgo);
  const avgPerWeek = Math.round(recentEntries.length / 4);

  // Registros únicos usados
  const uniqueRegisters = new Set(entries.map(e => e.register?.id)).size;

  // Calcular consistencia (porcentaje de días con entradas en último mes)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const lastMonthEntries = entries.filter(e => new Date(e.entry_date) >= thirtyDaysAgo);
  const uniqueDaysWithEntries = new Set(lastMonthEntries.map(e => e.entry_date)).size;
  const consistency = Math.round((uniqueDaysWithEntries / 30) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Progreso</h1>
        <p className="text-gray-600 mt-1">
          Visualiza tu evolución y logros
        </p>
      </div>

      {/* Hero Stats */}
      <div className="bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold mb-1">{totalEntries}</p>
            <p className="text-white/80 text-sm">Entradas Totales</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold mb-1">{daysInTherapy}</p>
            <p className="text-white/80 text-sm">Días en Seguimiento</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold mb-1">{currentStreak}</p>
            <p className="text-white/80 text-sm">Racha Actual (días)</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8" />
            </div>
            <p className="text-4xl font-bold mb-1">{consistency}%</p>
            <p className="text-white/80 text-sm">Consistencia</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              +{Math.round((thisMonth / (totalEntries || 1)) * 100)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Este Mes</p>
          <p className="text-3xl font-bold text-gray-900">{thisMonth}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Mejor Racha</p>
          <p className="text-3xl font-bold text-gray-900">{bestStreak} días</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Promedio Semanal</p>
          <p className="text-3xl font-bold text-gray-900">{avgPerWeek}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Registros Usados</p>
          <p className="text-3xl font-bold text-gray-900">{uniqueRegisters}</p>
        </div>
      </div>

      {/* Racha Card */}
      <StreakCard currentStreak={currentStreak} bestStreak={bestStreak} entries={entries} />

      {/* Gráficos */}
      {entries.length > 0 ? (
        <ProgressCharts entries={entries} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay datos suficientes
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Completa algunos registros para empezar a ver tu progreso en gráficos.
          </p>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Logros Desbloqueados
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Primera entrada */}
          <div className={`p-4 rounded-lg border-2 ${totalEntries >= 1 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
            <div className="text-3xl mb-2">🎯</div>
            <p className="font-semibold text-gray-900 text-sm">Primera Entrada</p>
            <p className="text-xs text-gray-600 mt-1">Completa tu primer registro</p>
            {totalEntries >= 1 && (
              <p className="text-xs text-green-600 font-semibold mt-2">✓ Desbloqueado</p>
            )}
          </div>

          {/* 7 días */}
          <div className={`p-4 rounded-lg border-2 ${currentStreak >= 7 ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
            <div className="text-3xl mb-2">🔥</div>
            <p className="font-semibold text-gray-900 text-sm">Racha de 7 días</p>
            <p className="text-xs text-gray-600 mt-1">7 días consecutivos</p>
            {currentStreak >= 7 ? (
              <p className="text-xs text-green-600 font-semibold mt-2">✓ Desbloqueado</p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">{currentStreak}/7 días</p>
            )}
          </div>

          {/* 30 entradas */}
          <div className={`p-4 rounded-lg border-2 ${totalEntries >= 30 ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
            <div className="text-3xl mb-2">⭐</div>
            <p className="font-semibold text-gray-900 text-sm">30 Entradas</p>
            <p className="text-xs text-gray-600 mt-1">Registra 30 veces</p>
            {totalEntries >= 30 ? (
              <p className="text-xs text-green-600 font-semibold mt-2">✓ Desbloqueado</p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">{totalEntries}/30 entradas</p>
            )}
          </div>

          {/* Consistente */}
          <div className={`p-4 rounded-lg border-2 ${consistency >= 80 ? 'bg-gradient-to-br from-green-50 to-teal-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
            <div className="text-3xl mb-2">💪</div>
            <p className="font-semibold text-gray-900 text-sm">Súper Consistente</p>
            <p className="text-xs text-gray-600 mt-1">80% consistencia mensual</p>
            {consistency >= 80 ? (
              <p className="text-xs text-green-600 font-semibold mt-2">✓ Desbloqueado</p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">{consistency}/80%</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
