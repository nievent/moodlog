// app/dashboard/psychologist/registers/new/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import RegisterBuilder from './components/RegisterBuilder';

export default async function NewRegisterPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/psychologist/registers"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Volver a registros
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Crear Registro Personalizado
              </h1>
              <p className="text-gray-600 mt-2">
                Diseña tu propio autorregistro arrastrando los campos que necesites
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-teal-50 to-purple-50 border-2 border-teal-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Cómo funciona</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• <strong>Arrastra</strong> los campos desde la paleta a tu registro</li>
                  <li>• <strong>Configura</strong> cada campo con opciones personalizadas</li>
                  <li>• <strong>Reordena</strong> arrastrando los campos ya añadidos</li>
                  <li>• <strong>Previsualiza</strong> cómo se verá para tus pacientes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Builder Component */}
        <RegisterBuilder psychologistId={user.id} />
      </div>
    </div>
  );
}