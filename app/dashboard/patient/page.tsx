import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default async function PatientDashboard() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Hola, <span className="text-purple-600">{profile?.full_name}</span>
              </h1>
              <p className="text-gray-600 mt-2">Dashboard del Paciente</p>
            </div>
            <form action={logout}>
              <button 
                type="submit"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-purple-900 mb-2">
              ✅ ¡Autenticación funcionando!
            </h2>
            <p className="text-purple-700">
              Tu cuenta de paciente está activa. Próximos pasos:
            </p>
            <ul className="list-disc list-inside text-purple-700 mt-2 space-y-1">
              <li>Ver autorregistros asignados</li>
              <li>Completar formularios</li>
              <li>Ver tu progreso</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
