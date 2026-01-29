// app/dashboard/psychologist/settings/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SettingsTabs from './components/SettingsTabs';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Obtener perfil completo
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Obtener perfil de psicólogo extendido
  const { data: psychProfile } = await supabase
    .from('psychologist_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tu perfil, preferencias y suscripción
        </p>
      </div>

      {/* Tabs Component */}
      <SettingsTabs 
        user={user}
        profile={profile}
        psychProfile={psychProfile}
      />
    </div>
  );
}