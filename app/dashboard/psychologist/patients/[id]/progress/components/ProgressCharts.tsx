// app/dashboard/psychologist/patients/[id]/progress/components/ProgressCharts.tsx
'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { RegisterEntryData, AutoRegisterFields, FormField } from '@/types/database.types';

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
  entries: EntryWithRegister[];
}

export default function ProgressCharts({ entries }: Props) {
  const [selectedRegister, setSelectedRegister] = useState<string>('');
  const [selectedField, setSelectedField] = useState<string>('');

  // Obtener registros únicos
  const uniqueRegisters = useMemo(() => {
    const regsMap = new Map();
    entries.forEach(e => {
      if (e.register && !regsMap.has(e.register.id)) {
        regsMap.set(e.register.id, e.register);
      }
    });
    return Array.from(regsMap.values());
  }, [entries]);

  // Seleccionar primer registro por defecto
  if (!selectedRegister && uniqueRegisters.length > 0) {
    setSelectedRegister(uniqueRegisters[0].id);
  }

  // Obtener campos del registro seleccionado
  const selectedRegisterData = uniqueRegisters.find(r => r.id === selectedRegister);
  const availableFields: FormField[] = selectedRegisterData?.fields?.fields || [];

  // Filtrar solo campos numéricos y de escala
  const numericFields = availableFields.filter((f: FormField) => 
    f.type === 'scale' || f.type === 'number'
  );

  // Seleccionar primer campo numérico por defecto
  if (!selectedField && numericFields.length > 0) {
    setSelectedField(numericFields[0].id);
  }

  // Filtrar entradas del registro seleccionado
  const filteredEntries = entries.filter(e => e.register?.id === selectedRegister);

  // Preparar datos para el gráfico de línea
  const lineChartData = useMemo(() => {
    if (!selectedField) return [];

    return filteredEntries.map(entry => {
      const value = entry.data[selectedField];
      return {
        date: new Date(entry.entry_date).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        }),
        fullDate: entry.entry_date,
        value: typeof value === 'number' ? value : null,
      };
    }).filter(d => d.value !== null);
  }, [filteredEntries, selectedField]);

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (lineChartData.length === 0) return null;

    const values = lineChartData.map(d => d.value as number);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Tendencia (simple: comparar primera mitad vs segunda mitad)
    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';

    return { avg, min, max, trend };
  }, [lineChartData]);

  // Preparar datos para gráfico de barras (frecuencia de respuestas)
  const barChartData = useMemo(() => {
    if (!selectedField) return [];

    const frequency: Record<string, number> = {};
    
    filteredEntries.forEach(entry => {
      const value = entry.data[selectedField];
      if (value !== null && value !== undefined) {
        const key = String(value);
        frequency[key] = (frequency[key] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  }, [filteredEntries, selectedField]);

  const selectedFieldData = numericFields.find((f: FormField) => f.id === selectedField);

  return (
    <div className="space-y-6">
      {/* Selectores */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Registro
            </label>
            <select
              value={selectedRegister}
              onChange={(e) => {
                setSelectedRegister(e.target.value);
                setSelectedField(''); // Reset field
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            >
              {uniqueRegisters.map(reg => (
                <option key={reg.id} value={reg.id}>{reg.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Campo
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              disabled={numericFields.length === 0}
            >
              {numericFields.length > 0 ? (
                numericFields.map((field: FormField) => (
                  <option key={field.id} value={field.id}>{field.label}</option>
                ))
              ) : (
                <option value="">No hay campos numéricos</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {numericFields.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            Este registro no tiene campos numéricos o de escala para graficar.
          </p>
        </div>
      ) : selectedField && lineChartData.length > 0 ? (
        <>
          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avg.toFixed(1)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Mínimo</p>
                <p className="text-2xl font-bold text-blue-600">{stats.min}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Máximo</p>
                <p className="text-2xl font-bold text-green-600">{stats.max}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Tendencia</p>
                <div className="flex items-center gap-2">
                  <TrendingUp 
                    className={`w-6 h-6 ${
                      stats.trend === 'up' ? 'text-green-600' : 
                      stats.trend === 'down' ? 'text-red-600 rotate-180' : 
                      'text-gray-400'
                    }`}
                  />
                  <span className="text-lg font-semibold text-gray-900">
                    {stats.trend === 'up' ? 'Mejorando' : 
                     stats.trend === 'down' ? 'Bajando' : 
                     'Estable'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Gráfico de Línea - Evolución */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Evolución: {selectedFieldData?.label}
                </h3>
                <p className="text-sm text-gray-600">
                  Tendencia a lo largo del tiempo
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  domain={[0, selectedFieldData?.max || 10]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#14b8a6" 
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras - Frecuencia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Distribución de Respuestas
                </h3>
                <p className="text-sm text-gray-600">
                  Frecuencia de cada valor
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="value" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  label={{ value: selectedFieldData?.label, position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#a855f7"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-600">
            No hay suficientes datos para mostrar gráficos del campo seleccionado
          </p>
        </div>
      )}
    </div>
  );
}