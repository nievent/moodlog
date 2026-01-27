// app/dashboard/patient/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PatientSidebar from './components/PatientSidebar';
import PatientHeader from './components/PatientHeader';

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url, psychologist_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'patient') {
    redirect('/login');
  }

  // Obtener info del psicólogo
  const { data: psychologist } = profile.psychologist_id ? await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', profile.psychologist_id)
    .single() : { data: null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <PatientSidebar 
        userName={profile.full_name}
        userEmail={user.email || ''}
        avatarUrl={profile.avatar_url}
        psychologistName={psychologist?.full_name}
      />
      
      <div className="lg:pl-64">
        <PatientHeader userName={profile.full_name} />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}