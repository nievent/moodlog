// app/dashboard/psychologist/analytics/components/AnalyticsCharts.tsx
'use client';

import { useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

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

export default function AnalyticsCharts({ entriesData, patientsData }: Props) {
  // Datos para gráfico de línea (últimos 30 días)
  const lineChartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const entriesCount = entriesData.filter(e => e.entry_date === date).length;
      const dateObj = new Date(date);
      
      return {
        date: dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        fullDate: date,
        entradas: entriesCount,
      };
    });
  }, [entriesData]);

  // Datos para gráfico de barras (entradas por paciente - top 10)
  const barChartData = useMemo(() => {
    const entriesByPatient: Record<string, number> = {};
    
    entriesData.forEach(entry => {
      entriesByPatient[entry.patient_id] = (entriesByPatient[entry.patient_id] || 0) + 1;
    });

    const patientsWithCounts = patientsData
      .map(patient => ({
        name: patient.full_name.split(' ')[0], // Solo primer nombre
        fullName: patient.full_name,
        entradas: entriesByPatient[patient.id] || 0,
      }))
      .filter(p => p.entradas > 0)
      .sort((a, b) => b.entradas - a.entradas)
      .slice(0, 10);

    return patientsWithCounts;
  }, [entriesData, patientsData]);

  const totalEntriesLast30Days = lineChartData.reduce((sum, day) => sum + day.entradas, 0);
  const avgEntriesPerDay = Math.round(totalEntriesLast30Days / 30 * 10) / 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Línea - Tendencia */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Tendencia de Entradas</h3>
              <p className="text-sm text-gray-600">Últimos 30 días</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{totalEntriesLast30Days}</p>
            <p className="text-xs text-gray-500">{avgEntriesPerDay}/día promedio</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#666"
              style={{ fontSize: '12px' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Line 
              type="monotone" 
              dataKey="entradas" 
              stroke="#14b8a6" 
              strokeWidth={3}
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pico más alto</span>
            <span className="font-semibold text-gray-900">
              {Math.max(...lineChartData.map(d => d.entradas))} entradas
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras - Top Pacientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Pacientes Más Activos</h3>
            <p className="text-sm text-gray-600">Top 10 por entradas completadas</p>
          </div>
        </div>

        {barChartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(value) => {
                    const patient = barChartData.find(p => p.name === value);
                    return patient?.fullName || value;
                  }}
                />
                <Bar 
                  dataKey="entradas" 
                  fill="url(#colorGradient)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Paciente más activo</span>
                <span className="font-semibold text-gray-900">
                  {barChartData[0]?.fullName || 'N/A'} ({barChartData[0]?.entradas || 0})
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No hay datos suficientes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}