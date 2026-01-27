// app/dashboard/patient/components/PatientSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  User,
  Calendar
} from 'lucide-react';
import { logout } from '@/app/actions/auth';

interface Props {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  psychologistName?: string | null;
}

const navigation = [
  { name: 'Inicio', href: '/dashboard/patient', icon: Home },
  { name: 'Mis Registros', href: '/dashboard/patient/registers', icon: FileText },
  { name: 'Historial', href: '/dashboard/patient/history', icon: Calendar },
  { name: 'Mi Progreso', href: '/dashboard/patient/progress', icon: BarChart3 },
  { name: 'Configuración', href: '/dashboard/patient/settings', icon: Settings },
];

export default function PatientSidebar({ userName, userEmail, avatarUrl, psychologistName }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen w-64 
        bg-white border-r border-gray-200 
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard/patient" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Mood<span className="text-teal-600">Log</span>
                </h1>
                <p className="text-xs text-gray-500">Mi espacio</p>
              </div>
            </Link>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            
            {/* Psychologist info */}
            {psychologistName && (
              <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-teal-700 font-medium">
                      Tu psicólogo/a
                    </p>
                    <p className="text-sm text-teal-900 font-semibold truncate">
                      {psychologistName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    font-medium transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-teal-500 to-purple-500 text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Help section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-teal-50 to-purple-50 border border-teal-200 rounded-lg p-4 mb-3">
              <p className="text-xs font-medium text-teal-900 mb-1">
                💡 ¿Necesitas ayuda?
              </p>
              <p className="text-xs text-teal-700">
                Contacta con tu psicólogo/a si tienes dudas sobre tus registros
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition-colors"
            >
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}