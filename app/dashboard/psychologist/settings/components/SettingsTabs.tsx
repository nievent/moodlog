// app/dashboard/psychologist/settings/components/SettingsTabs.tsx
'use client';

import { useState } from 'react';
import { User as UserIcon, Briefcase, Bell, CreditCard, Shield, HelpCircle } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import ProfileTab from './ProfileTab';
import ProfessionalTab from './ProfessionalTab';
import NotificationsTab from './NotificationsTab';
import SubscriptionTab from './SubscriptionTab';
import SecurityTab from './SecurityTab';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
  role: string;
  psychologist_id: string | null;
  updated_at: string;
}

interface PsychologistProfile {
  id: string;
  license_number: string | null;
  specialization: string | null;
  organization: string | null;
  phone: string | null;
  timezone: string;
  subscription_status: string;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  user: User;
  profile: Profile;
  psychProfile: PsychologistProfile | null;
}

const tabs = [
  { id: 'profile', label: 'Perfil Personal', icon: UserIcon },
  { id: 'professional', label: 'Datos Profesionales', icon: Briefcase },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'subscription', label: 'Suscripción', icon: CreditCard },
  { id: 'security', label: 'Seguridad', icon: Shield },
];

export default function SettingsTabs({ user, profile, psychProfile }: Props) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap
                  border-b-2 transition-all
                  ${isActive 
                    ? 'border-teal-500 text-teal-600 bg-white' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <ProfileTab user={user} profile={profile} />
        )}
        {activeTab === 'professional' && (
          <ProfessionalTab psychProfile={psychProfile} userId={user.id} />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab userId={user.id} />
        )}
        {activeTab === 'subscription' && (
          <SubscriptionTab psychProfile={psychProfile} userId={user.id} />
        )}
        {activeTab === 'security' && (
          <SecurityTab user={user} />
        )}
      </div>
    </div>
  );
}