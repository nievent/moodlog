// app/dashboard/psychologist/entries/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FileText, Users, Calendar, TrendingUp } from 'lucide-react';
import EntriesListClient from './components/EntriesListClient';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';

export default async function PsychologistEntriesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener todas las entradas de los pacientes del psicólogo
  const { data: entriesRaw } = await supabase
    .from('register_entries')
    .select('*')
    .order('entry_date', { ascending: false })
    .limit(100); // Primeras 100 entradas

  // Obtener asignaciones para vincular
  const assignmentIds = [...new Set(entriesRaw?.map(e => e.assignment_id) || [])];
  
  const { data: assignments } = assignmentIds.length > 0 ? await supabase
    .from('patient_assignments')
    .select(`
      id,
      patient_id,
      auto_register_id,
      frequency
    `)
    .eq('psychologist_id', user.id)
    .in('id', assignmentIds) : { data: [] };

  // Obtener pacientes
  const patientIds = [...new Set(assignments?.map(a => a.patient_id) || [])];
  
  const { data: patients } = patientIds.length > 0 ? await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', patientIds) : { data: [] };

  // Obtener registros
  const registerIds = [...new Set(assignments?.map(a => a.auto_register_id) || [])];
  
  const { data: registers } = registerIds.length > 0 ? await supabase
    .from('auto_registers')
    .select('id, name, description, fields')
    .in('id', registerIds) : { data: [] };

  // Combinar datos
  type EntryWithDetails = {
    id: string;
    assignment_id: string;
    patient_id: string;
    data: RegisterEntryData;
    entry_date: string;
    notes: string | null;
    created_at: string;
    patient: {
      id: string;
      full_name: string;
      avatar_url: string | null;
    } | null;
    register: {
      id: string;
      name: string;
      description: string | null;
      fields: AutoRegisterFields;
    } | null;
  };

  const entries: EntryWithDetails[] = entriesRaw?.map(entry => {
    const assignment = assignments?.find(a => a.id === entry.assignment_id);
    const patient = patients?.find(p => p.id === assignment?.patient_id);
    const register = registers?.find(r => r.id === assignment?.auto_register_id);
    
    return {
      id: entry.id,
      assignment_id: entry.assignment_id,
      patient_id: entry.patient_id,
      data: entry.data,
      entry_date: entry.entry_date,
      notes: entry.notes,
      created_at: entry.created_at,
      patient: patient || null,
      register: register || null,
    };
  }).filter(e => e.patient !== null && e.register !== null) || [];

  // Stats
  const totalEntries = entries.length;
  const todayEntries = entries.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    return e.entry_date === today;
  }).length;
  
  const thisWeekEntries = entries.filter(e => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(e.entry_date) >= weekAgo;
  }).length;

  const uniquePatients = new Set(entries.map(e => e.patient_id)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Entradas de Pacientes</h1>
        <p className="text-gray-600 mt-1">
          Revisa y analiza las entradas completadas por tus pacientes
        </p>
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
              <p className="text-3xl font-bold text-gray-900 mt-2">{thisWeekEntries}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{uniquePatients}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista con filtros (Client Component) */}
      <EntriesListClient
        entries={entries}
        patients={patients || []}
        registers={registers || []}
      />
    </div>
  );
}