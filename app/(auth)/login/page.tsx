'use client';

import { useState } from 'react';
import { Eye, EyeOff, Brain, Activity } from 'lucide-react';
import { login, registerPsychologist, registerPatient } from '@/app/actions/auth';

type AuthError = {
  general?: string;
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  fullName?: string[];
  invitationCode?: string[];
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'psychologist' | 'patient'>('psychologist');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);

    try {
      if (mode === 'login') {
        const result = await login(formData);
        if (result?.error) {
          const err = result.error as AuthError;
          setError(err.general || err.email?.[0] || err.password?.[0] || 'Error al iniciar sesión');
        }
      } else {
        // Registro
        if (userType === 'psychologist') {
          const result = await registerPsychologist(formData);
          if (result?.error) {
            const err = result.error as AuthError;
            setError(
              err.general || 
              err.email?.[0] || 
              err.password?.[0] ||
              err.confirmPassword?.[0] ||
              err.fullName?.[0] ||
              'Error al registrarse'
            );
          }
        } else {
          const result = await registerPatient(formData);
          if (result?.error) {
            const err = result.error as AuthError;
            setError(
              err.general || 
              err.invitationCode?.[0] ||
              err.email?.[0] ||
              err.password?.[0] ||
              err.confirmPassword?.[0] ||
              err.fullName?.[0] ||
              'Error al registrarse'
            );
          }
        }
      }
    } catch (err) {
      setError('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mood<span className="text-teal-600">Log</span>
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Bienvenido de nuevo' 
              : 'Crea tu cuenta para comenzar'}
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Tabs Login/Register */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-teal-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Selector de tipo de usuario (solo en registro) */}
          {mode === 'register' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de cuenta
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('psychologist')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'psychologist'
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Brain className={`w-6 h-6 mx-auto mb-2 ${
                    userType === 'psychologist' ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium text-gray-800">Psicólogo</div>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    userType === 'patient'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Activity className={`w-6 h-6 mx-auto mb-2 ${
                    userType === 'patient' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium text-gray-800">Paciente</div>
                </button>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="Tu nombre"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            {mode === 'register' && userType === 'patient' && (
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Código de invitación
                </label>
                <input
                  id="invitationCode"
                  name="invitationCode"
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Código proporcionado por tu psicólogo"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Recibiste este código por email de tu psicólogo
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 8 caracteres
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                  <span className="ml-2 text-gray-600">Recordarme</span>
                </label>
                <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        {mode === 'register' && userType === 'psychologist' && (
          <p className="text-center text-sm text-gray-600 mt-6">
            Al registrarte aceptas nuestros{' '}
            <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
              Términos de servicio
            </button>
            {' '}y{' '}
            <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
              Política de privacidad
            </button>
          </p>
        )}
      </div>
    </div>
  );
}