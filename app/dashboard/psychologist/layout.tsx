// app/dashboard/psychologist/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';

export default async function PsychologistLayout({
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
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'psychologist') {
    redirect('/login');
  }

  const { data: psychProfile } = await supabase
    .from('psychologist_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <DashboardSidebar 
        userName={profile.full_name}
        userEmail={user.email || ''}
        avatarUrl={profile.avatar_url}
        subscriptionStatus={psychProfile?.subscription_status || 'trialing'}
      />
      
      <div className="lg:pl-64">
        <DashboardHeader userName={profile.full_name} />
        
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}