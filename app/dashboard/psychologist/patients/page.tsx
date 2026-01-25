// app/dashboard/psychologist/patients/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Users, Mail, Calendar, Activity } from 'lucide-react';
import PatientsTable from './components/PatientsTable';

export default async function PatientsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener todos los pacientes
  const { data: patients } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      created_at,
      avatar_url
    `)
    .eq('psychologist_id', user.id)
    .order('created_at', { ascending: false });

  // Obtener invitaciones pendientes
  const { data: pendingInvitations } = await supabase
    .from('patient_invitations')
    .select('*')
    .eq('psychologist_id', user.id)
    .eq('used', false)
    .order('created_at', { ascending: false });

  // Stats rápidas
  const totalPatients = patients?.length || 0;
  const pendingInvites = pendingInvitations?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header con stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {totalPatients} {totalPatients === 1 ? 'paciente activo' : 'pacientes activos'}
            {pendingInvites > 0 && ` · ${pendingInvites} invitaciones pendientes`}
          </p>
        </div>

        <Link
          href="/dashboard/psychologist/patients/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Añadir Paciente
        </Link>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Invitaciones Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInvites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Activos esta semana</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients?.filter(p => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(p.created_at) > weekAgo;
                }).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invitaciones pendientes */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Invitaciones Pendientes</h3>
          </div>
          <div className="space-y-2">
            {pendingInvitations.slice(0, 3).map((invite) => (
              <div key={invite.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-900">{invite.email}</p>
                  <p className="text-sm text-gray-500">
                    Código: <span className="font-mono font-semibold text-purple-600">{invite.code}</span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(invite.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
          {pendingInvitations.length > 3 && (
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-3">
              Ver todas las invitaciones →
            </button>
          )}
        </div>
      )}

      {/* Tabla de pacientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Filter */}
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        {patients && patients.length > 0 ? (
          <PatientsTable patients={patients} />
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes pacientes todavía
            </h3>
            <p className="text-gray-600 mb-6">
              Empieza añadiendo tu primer paciente para comenzar a usar MoodLog
            </p>
            <Link
              href="/dashboard/psychologist/patients/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus size={20} />
              Añadir Primer Paciente
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}