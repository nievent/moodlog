// app/dashboard/psychologist/analytics/components/TopPatients.tsx
'use client';

import { useMemo } from 'react';
import { Trophy, TrendingUp, Medal } from 'lucide-react';
import Link from 'next/link';

interface Entry {
  id: string;
  entry_date: string;
  patient_id: string;
}

interface Patient {
  id: string;
  full_name: string;
  created_at: string;
}

interface Props {
  entriesData: Entry[];
  patientsData: Patient[];
}

export default function TopPatients({ entriesData, patientsData }: Props) {
  const topPatients = useMemo(() => {
    // Contar entradas por paciente
    const entriesByPatient: Record<string, number> = {};
    
    entriesData.forEach(entry => {
      entriesByPatient[entry.patient_id] = (entriesByPatient[entry.patient_id] || 0) + 1;
    });

    // Calcular adherencia (entradas en últimos 7 días)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentEntriesByPatient: Record<string, number> = {};
    entriesData
      .filter(e => new Date(e.entry_date) >= weekAgo)
      .forEach(entry => {
        recentEntriesByPatient[entry.patient_id] = (recentEntriesByPatient[entry.patient_id] || 0) + 1;
      });

    return patientsData
      .map(patient => {
        const totalEntries = entriesByPatient[patient.id] || 0;
        const recentEntries = recentEntriesByPatient[patient.id] || 0;
        
        return {
          id: patient.id,
          name: patient.full_name,
          totalEntries,
          recentEntries,
          daysSinceJoined: Math.floor(
            (new Date().getTime() - new Date(patient.created_at).getTime()) / (1000 * 60 * 60 * 24)
          ),
        };
      })
      .filter(p => p.totalEntries > 0)
      .sort((a, b) => b.totalEntries - a.totalEntries)
      .slice(0, 5);
  }, [entriesData, patientsData]);

  const medals = [
    { icon: '🥇', color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-50' },
    { icon: '🥈', color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50' },
    { icon: '🥉', color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50' },
    { icon: '🏅', color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50' },
    { icon: '🎖️', color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Hall of Fame</h3>
          <p className="text-sm text-gray-600">Los 5 pacientes más comprometidos</p>
        </div>
      </div>

      {topPatients.length > 0 ? (
        <div className="space-y-3">
          {topPatients.map((patient, index) => {
            const medal = medals[index];
            
            return (
              <Link
                key={patient.id}
                href={`/dashboard/psychologist/patients/${patient.id}`}
                className="group block"
              >
                <div className={`relative overflow-hidden rounded-xl border-2 border-gray-200 p-4 hover:border-teal-400 hover:shadow-md transition-all`}>
                  {/* Background decoration */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${medal.color} opacity-5 rounded-full -mr-12 -mt-12`}></div>
                  
                  <div className="relative flex items-center gap-4">
                    {/* Medalla */}
                    <div className={`w-14 h-14 ${medal.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 text-2xl`}>
                      {medal.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-gray-900 truncate">
                          {patient.name}
                        </p>
                        {patient.recentEntries > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Activo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Medal className="w-4 h-4" />
                          {patient.totalEntries} entradas
                        </span>
                        {patient.recentEntries > 0 && (
                          <span className="flex items-center gap-1 text-teal-600">
                            <TrendingUp className="w-4 h-4" />
                            {patient.recentEntries} esta semana
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Número de ranking */}
                    <div className="text-4xl font-black text-gray-100 group-hover:text-teal-100 transition-colors">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Aún no hay datos suficientes</p>
          <p className="text-sm text-gray-500 mt-1">
            Los pacientes aparecerán aquí cuando completen entradas
          </p>
        </div>
      )}

      {/* Footer stats */}
      {topPatients.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-teal-600">
                {topPatients[0]?.totalEntries || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Récord máximo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(topPatients.reduce((sum, p) => sum + p.totalEntries, 0) / topPatients.length)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Promedio top 5</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}