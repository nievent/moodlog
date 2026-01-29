// app/dashboard/psychologist/analytics/components/RegistersBreakdown.tsx
'use client';

import { FileText, Users, Zap } from 'lucide-react';

interface Register {
  id: string;
  name: string;
  created_at: string;
}

interface Props {
  registersData: Register[];
  assignmentsCount: number;
}

export default function RegistersBreakdown({ registersData, assignmentsCount }: Props) {
  const totalRegisters = registersData.length;
  
  // Calcular registros creados este mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  
  const registersThisMonth = registersData.filter(r => 
    new Date(r.created_at) >= startOfMonth
  ).length;

  // Promedio de asignaciones por registro
  const avgAssignmentsPerRegister = totalRegisters > 0 
    ? Math.round((assignmentsCount / totalRegisters) * 10) / 10
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Tus Registros</h3>
          <p className="text-sm text-gray-600">Resumen de autorregistros creados</p>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <p className="text-sm font-medium text-indigo-900">Total Registros</p>
          </div>
          <p className="text-3xl font-bold text-indigo-600">{totalRegisters}</p>
          {registersThisMonth > 0 && (
            <p className="text-xs text-indigo-700 mt-1">
              +{registersThisMonth} este mes
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-4 border-2 border-teal-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-teal-600" />
            <p className="text-sm font-medium text-teal-900">Asignaciones</p>
          </div>
          <p className="text-3xl font-bold text-teal-600">{assignmentsCount}</p>
          <p className="text-xs text-teal-700 mt-1">
            {avgAssignmentsPerRegister} por registro
          </p>
        </div>
      </div>

      {/* Lista de registros recientes */}
      {registersData.length > 0 ? (
        <>
          <div className="mb-3">
            <p className="text-sm font-semibold text-gray-700">Registros Recientes</p>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {registersData.slice(0, 6).map((register) => (
              <div
                key={register.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {register.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Creado {new Date(register.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {registersData.length > 6 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                ... y {registersData.length - 6} registros más
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No has creado registros todavía</p>
          <p className="text-gray-500 text-xs mt-1">
            Crea tu primer registro personalizado
          </p>
        </div>
      )}

      {/* Performance indicator */}
      {totalRegisters > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {assignmentsCount > totalRegisters * 2 
                  ? '¡Uso excelente!' 
                  : assignmentsCount > totalRegisters
                  ? 'Buen uso'
                  : 'Asigna más registros'}
              </p>
              <p className="text-xs text-gray-600">
                {assignmentsCount > totalRegisters * 2 
                  ? 'Estás aprovechando muy bien tus registros' 
                  : assignmentsCount > totalRegisters
                  ? 'Tus registros están siendo utilizados'
                  : 'Puedes asignar más registros a tus pacientes'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}