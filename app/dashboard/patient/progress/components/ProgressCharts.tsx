// app/dashboard/patient/progress/components/ProgressCharts.tsx
'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { RegisterEntryData, AutoRegisterFields, FormField } from '@/types/database.types';

type EntryWithRegister = {
  id: string;
  data: RegisterEntryData;
  entry_date: string;
  created_at: string;
  assignment_id: string;
  register: {
    id: string;
    name: string;
    fields: AutoRegisterFields;
  } | null;
};

interface Props {
  entries: EntryWithRegister[];
}

const COLORS = ['#14b8a6', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#10b981'];

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

  // Preparar datos para el gráfico de línea (evolución temporal)
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
    
    // Tendencia (comparar primera mitad vs segunda mitad)
    const midpoint = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, midpoint);
    const secondHalf = values.slice(midpoint);
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = secondAvg > firstAvg ? 'up' : secondAvg < firstAvg ? 'down' : 'stable';
    const trendPercent = firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;

    return { avg, min, max, trend, trendPercent };
  }, [lineChartData]);

  // Preparar datos para distribución de respuestas
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

  // Preparar datos para gráfico de frecuencia de entradas por semana
  const weeklyFrequency = useMemo(() => {
    const weeks: Record<string, number> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.entry_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Inicio de semana
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekLabel = weekStart.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
      
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });

    return Object.entries(weeks)
      .map(([key, count]) => ({
        week: new Date(key).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        }),
        count,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Últimas 8 semanas
  }, [entries]);

  // Preparar datos para distribución por tipo de registro
  const registerDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    
    entries.forEach(entry => {
      const name = entry.register?.name || 'Desconocido';
      distribution[name] = (distribution[name] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  }, [entries]);

  const selectedFieldData = numericFields.find((f: FormField) => f.id === selectedField);

  return (
    <div className="space-y-6">
      {/* Selectores */}
      {uniqueRegisters.length > 1 && (
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

            {numericFields.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Campo
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                >
                  {numericFields.map((field: FormField) => (
                    <option key={field.id} value={field.id}>{field.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gráficos de registro seleccionado */}
      {numericFields.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-yellow-800">
            Este registro no tiene campos numéricos para graficar.
            {uniqueRegisters.length > 1 && ' Prueba con otro registro.'}
          </p>
        </div>
      ) : selectedField && lineChartData.length > 0 ? (
        <>
          {/* Estadísticas del campo */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio</p>
                <p className="text-2xl font-bold text-teal-600">{stats.avg.toFixed(1)}</p>
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
                  <span className={`text-lg font-semibold ${
                    stats.trend === 'up' ? 'text-green-600' : 
                    stats.trend === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {stats.trendPercent > 0 ? '+' : ''}{stats.trendPercent}%
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

          {/* Gráfico de Barras - Distribución */}
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

      {/* Gráfico de frecuencia semanal */}
      {weeklyFrequency.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Actividad Semanal
              </h3>
              <p className="text-sm text-gray-600">
                Entradas completadas por semana
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyFrequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="week" 
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
              />
              <Bar 
                dataKey="count" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gráfico Circular - Distribución por registro */}
      {registerDistribution.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Distribución por Tipo de Registro
              </h3>
              <p className="text-sm text-gray-600">
                Proporción de entradas por registro
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={registerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {registerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
