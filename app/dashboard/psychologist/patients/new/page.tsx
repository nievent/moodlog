// app/dashboard/psychologist/patients/new/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import NewPatientForm from './components/NewPatientForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewPatientPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard/psychologist/patients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        Volver a pacientes
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Añadir Nuevo Paciente</h1>
        <p className="text-gray-600 mt-2">
          Introduce los datos del paciente y se generará automáticamente un código de invitación
        </p>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 ¿Cómo funciona?</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="font-semibold mt-0.5">1.</span>
            <span>Introduce el nombre y email del paciente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold mt-0.5">2.</span>
            <span>Se genera un código único de invitación</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold mt-0.5">3.</span>
            <span>El paciente recibe un email con el código y las instrucciones</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold mt-0.5">4.</span>
            <span>El paciente se registra con su código y puede empezar a usar MoodLog</span>
          </li>
        </ul>
      </div>

      {/* Form */}
      <NewPatientForm psychologistId={user.id} />
    </div>
  );
}