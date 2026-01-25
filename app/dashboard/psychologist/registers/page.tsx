// app/dashboard/psychologist/registers/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, FileText, Copy, Eye, Users, TrendingUp, Trash2 } from 'lucide-react';
import TemplateCard from './components/TemplateCard';
import AssignedRegisterCard from './components/AssignedRegisterCard';
import { AutoRegisterFields } from '@/types/database.types';

interface RegisterTemplate {
  id: string;
  name: string;
  description: string | null;
  fields: AutoRegisterFields;
  category: string | null;
  icon: string | null;
  created_at: string;
}

export default async function RegistersPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener registros personalizados del psicólogo (solo creados desde cero)
  const { data: customRegisters } = await supabase
    .from('auto_registers')
    .select('*')
    .eq('psychologist_id', user.id)
    .eq('source', 'custom') // Solo los creados manualmente
    .order('created_at', { ascending: false });

  // Obtener asignaciones activas con detalles
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
      patient:profiles!patient_id(id, full_name, avatar_url),
      auto_register:auto_registers!auto_register_id(id, name, description, fields)
    `)
    .eq('psychologist_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Transformar los datos para extraer el primer elemento de los arrays
  const assignments = assignmentsRaw?.map(a => ({
    id: a.id,
    frequency: a.frequency,
    start_date: a.start_date,
    end_date: a.end_date,
    is_active: a.is_active,
    notes: a.notes,
    created_at: a.created_at,
    patient: Array.isArray(a.patient) ? a.patient[0] : a.patient,
    auto_register: Array.isArray(a.auto_register) ? a.auto_register[0] : a.auto_register,
  }));

  // Contar entradas completadas por asignación
  const assignmentIds = assignments?.map(a => a.id) || [];
  const { data: entryCounts } = assignmentIds.length > 0 ? await supabase
    .from('register_entries')
    .select('assignment_id')
    .in('assignment_id', assignmentIds) : { data: null };

  const entriesPerAssignment = entryCounts?.reduce((acc, entry) => {
    acc[entry.assignment_id] = (acc[entry.assignment_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Obtener plantillas predefinidas
  const { data: templates } = await supabase
    .from('register_templates')
    .select('*')
    .order('category', { ascending: true });

  const totalCustom = customRegisters?.length || 0;
  const totalAssignments = assignments?.length || 0;
  const totalEntries = Object.values(entriesPerAssignment).reduce((sum, count) => sum + count, 0);

  // Agrupar plantillas por categoría
  const templatesByCategory = templates?.reduce<Record<string, RegisterTemplate[]>>((acc, template) => {
    const category = template.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(template);
    return acc;
  }, {});

  const categoryNames: Record<string, string> = {
    ansiedad: 'Ansiedad',
    depresion: 'Depresión',
    autoestima: 'Autoestima',
    general: 'General',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Autorregistros</h1>
          <p className="text-gray-600 mt-1">
            {totalCustom} personalizados · {totalAssignments} asignaciones activas · {totalEntries} entradas completadas
          </p>
        </div>

        <Link
          href="/dashboard/psychologist/registers/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={20} />
          Crear Desde Cero
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Personalizados</p>
              <p className="text-2xl font-bold text-gray-900">{totalCustom}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Asignaciones</p>
              <p className="text-2xl font-bold text-gray-900">{totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Entradas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registros Asignados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Registros Asignados a Pacientes
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Seguimiento de registros activos y entradas completadas
              </p>
            </div>
          </div>
        </div>

        {assignments && assignments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <AssignedRegisterCard
                key={assignment.id}
                assignment={{
                  ...assignment,
                  entryCount: entriesPerAssignment[assignment.id] || 0,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No has asignado registros todavía
            </h3>
            <p className="text-gray-600">
              Asigna plantillas o registros personalizados a tus pacientes
            </p>
          </div>
        )}
      </div>

      {/* Plantillas predefinidas por categoría */}
      {templatesByCategory && Object.keys(templatesByCategory).map((category) => (
        <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Copy className="w-5 h-5 text-purple-600" />
              Plantillas: {categoryNames[category] || category}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Listas para asignar a tus pacientes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templatesByCategory[category].map((template) => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                isGlobal={true}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Mis registros personalizados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Mis Registros Personalizados</h3>
              <p className="text-sm text-gray-600 mt-1">
                Registros creados desde cero que puedes editar y asignar
              </p>
            </div>
          </div>
        </div>

        {customRegisters && customRegisters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {customRegisters.map((register) => (
              <TemplateCard
                key={register.id}
                template={{
                  id: register.id,
                  name: register.name,
                  description: register.description,
                  fields: register.fields,
                  category: null,
                  icon: 'FileText',
                }}
                isGlobal={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes registros personalizados todavía
            </h3>
            <p className="text-gray-600 mb-6">
              Crea un registro desde cero con los campos que necesites
            </p>
            <Link
              href="/dashboard/psychologist/registers/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              <Plus size={20} />
              Crear Primer Registro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}