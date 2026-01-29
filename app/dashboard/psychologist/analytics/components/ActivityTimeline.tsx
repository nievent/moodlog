// app/dashboard/psychologist/analytics/components/ActivityTimeline.tsx
'use client';

import { useMemo } from 'react';
import { Clock, CheckCircle, User, Calendar } from 'lucide-react';

interface Entry {
  id: string;
  entry_date: string;
  created_at: string;
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

export default function ActivityTimeline({ entriesData, patientsData }: Props) {
  const recentActivity = useMemo(() => {
    // Últimas 10 entradas
    const recentEntries = entriesData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(entry => {
        const patient = patientsData.find(p => p.id === entry.patient_id);
        return {
          id: entry.id,
          type: 'entry' as const,
          patient: patient?.full_name || 'Paciente desconocido',
          patientId: entry.patient_id,
          date: new Date(entry.created_at),
          dateStr: entry.created_at,
        };
      });

    // Nuevos pacientes (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentPatients = patientsData
      .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
      .map(patient => ({
        id: patient.id,
        type: 'patient' as const,
        patient: patient.full_name,
        patientId: patient.id,
        date: new Date(patient.created_at),
        dateStr: patient.created_at,
      }));

    // Combinar y ordenar
    return [...recentEntries, ...recentPatients]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 12);
  }, [entriesData, patientsData]);

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Actividad Reciente</h3>
          <p className="text-sm text-gray-600">Timeline de eventos importantes</p>
        </div>
      </div>

      {recentActivity.length > 0 ? (
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < recentActivity.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200"></div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${activity.type === 'entry' 
                    ? 'bg-gradient-to-br from-green-400 to-green-600' 
                    : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  }
                `}>
                  {activity.type === 'entry' ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {activity.type === 'entry' ? (
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.patient}</span>{' '}
                          <span className="text-gray-600">completó una entrada</span>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.patient}</span>{' '}
                          <span className="text-gray-600">se unió como paciente</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getRelativeTime(activity.date)}
                      </p>
                    </div>

                    {/* Badge */}
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium flex-shrink-0
                      ${activity.type === 'entry' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                      }
                    `}>
                      {activity.type === 'entry' ? 'Entrada' : 'Nuevo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No hay actividad reciente</p>
          <p className="text-sm text-gray-500 mt-1">
            La actividad aparecerá aquí cuando tus pacientes completen entradas
          </p>
        </div>
      )}

      {/* Ver más */}
      {recentActivity.length >= 12 && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            Ver toda la actividad →
          </button>
        </div>
      )}
    </div>
  );
}