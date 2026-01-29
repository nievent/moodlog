// app/dashboard/patient/progress/components/StreakCard.tsx
'use client';

import { Calendar } from 'lucide-react';
import { RegisterEntryData, AutoRegisterFields } from '@/types/database.types';

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

interface Props {
  currentStreak: number;
  bestStreak: number;
  entries: EntryWithRegister[];
}

export default function StreakCard({ currentStreak, bestStreak, entries }: Props) {
  // Generar últimos 30 días
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const last30Days = getLast30Days();
  
  // Crear set de fechas con entradas para búsqueda rápida
  const datesWithEntries = new Set(entries.map(e => e.entry_date));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Tu Racha</h3>
            <p className="text-sm text-gray-600">
              {currentStreak} {currentStreak === 1 ? 'día' : 'días'} consecutivos
            </p>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
            <p className="text-xs text-gray-500">días 🔥</p>
          </div>
        )}
      </div>

      {/* Mensaje motivacional */}
      {currentStreak === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>¡Empieza hoy!</strong> Completa un registro para iniciar tu racha.
          </p>
        </div>
      )}

      {currentStreak > 0 && currentStreak < 7 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            🎯 <strong>¡Vas bien!</strong> Solo {7 - currentStreak} {7 - currentStreak === 1 ? 'día más' : 'días más'} para desbloquear el logro de 7 días.
          </p>
        </div>
      )}

      {currentStreak >= 7 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            🎉 <strong>¡Increíble!</strong> Llevas {currentStreak} días de racha. Sigue así.
          </p>
        </div>
      )}

      {/* Calendario de últimos 30 días */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-600" />
          <p className="text-sm font-medium text-gray-700">Últimos 30 días</p>
        </div>

        <div className="grid grid-cols-10 gap-2">
          {last30Days.map((dateStr, index) => {
            const date = new Date(dateStr);
            const hasEntry = datesWithEntries.has(dateStr);
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayNumber = date.getDate();
            
            return (
              <div
                key={dateStr}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                  hasEntry
                    ? 'bg-gradient-to-br from-teal-400 to-green-500 text-white font-semibold shadow-sm hover:scale-110'
                    : isToday
                    ? 'border-2 border-teal-300 bg-teal-50 text-teal-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
                title={`${date.toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                })}${hasEntry ? ' - Completado' : ''}`}
              >
                <span className="text-[10px] opacity-80">
                  {date.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold">{dayNumber}</span>
                {hasEntry && <span className="text-[10px]">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-green-500 rounded"></div>
            <span>Con entrada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-teal-300 bg-teal-50 rounded"></div>
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded"></div>
            <span>Sin entrada</span>
          </div>
        </div>
      </div>

      {/* Progreso hacia siguiente logro */}
      {currentStreak < 30 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Próximo logro: 30 días</p>
            <p className="text-sm text-gray-600">{currentStreak}/30</p>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-green-500 transition-all duration-500"
              style={{ width: `${(currentStreak / 30) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
