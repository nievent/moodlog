// app/dashboard/patient/history/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Filter, Search, FileText, TrendingUp } from 'lucide-react';
import EntryCard from './components/EntryCard';
import { AutoRegisterFields, RegisterEntryData } from '@/types/database.types';

export default async function HistoryPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener todas las entradas del paciente
  const { data: entriesRaw } = await supabase
    .from('register_entries')
    .select('*')
    .eq('patient_id', user.id)
    .order('entry_date', { ascending: false });

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
    .select('id, name, description, fields')
    .in('id', registerIds) : { data: [] };

  // Combinar datos
  type EntryWithDetails = {
    id: string;
    assignment_id: string;
    data: RegisterEntryData;
    entry_date: string;
    notes: string | null;
    created_at: string;
    register: {
      id: string;
      name: string;
      description: string | null;
      fields: AutoRegisterFields;
    } | null;
  };

  const entries: EntryWithDetails[] = entriesRaw?.map(entry => {
    const assignment = assignments?.find(a => a.id === entry.assignment_id);
    const register = registers?.find(r => r.id === assignment?.auto_register_id);
    
    return {
      id: entry.id,
      assignment_id: entry.assignment_id,
      data: entry.data,
      entry_date: entry.entry_date,
      notes: entry.notes,
      created_at: entry.created_at,
      register: register || null,
    };
  }).filter(e => e.register !== null) || [];

  // Stats
  const totalEntries = entries.length;
  const thisMonth = entries.filter(e => {
    const entryDate = new Date(e.entry_date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && 
           entryDate.getFullYear() === now.getFullYear();
  }).length;

  const uniqueRegisters = new Set(entries.map(e => e.register?.id)).size;

  // Agrupar por mes para mostrar
  const entriesByMonth = entries.reduce((acc, entry) => {
    const date = new Date(entry.entry_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        key: monthKey,
        name: monthName,
        entries: [],
      };
    }
    
    acc[monthKey].entries.push(entry);
    return acc;
  }, {} as Record<string, { key: string; name: string; entries: EntryWithDetails[] }>);

  const monthGroups = Object.values(entriesByMonth).sort((a, b) => 
    b.key.localeCompare(a.key)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Historial de Entradas</h1>
        <p className="text-gray-600 mt-1">
          Todas tus entradas registradas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{thisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registros Usados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueRegisters}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar entradas..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>
      </div>

      {/* Entries by month */}
      {monthGroups.length > 0 ? (
        <div className="space-y-8">
          {monthGroups.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 capitalize">
                    {group.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {group.entries.length} {group.entries.length === 1 ? 'entrada' : 'entradas'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes entradas todavía
          </h3>
          <p className="text-gray-600">
            Completa tu primer registro para empezar a ver tu historial
          </p>
        </div>
      )}
    </div>
  );
}