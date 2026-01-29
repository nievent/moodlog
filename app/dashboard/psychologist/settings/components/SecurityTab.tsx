// app/dashboard/psychologist/settings/components/SecurityTab.tsx
'use client';

import { useState } from 'react';
import { Shield, Lock, Key, AlertTriangle } from 'lucide-react';
import { updatePassword, deleteAccount } from '@/app/actions/settings';
import { User } from '@supabase/supabase-js';

interface Props {
  user: User;
}

export default function SecurityTab({ user }: Props) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await updatePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        setPasswordError(result.error);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err) {
      setPasswordError('Error al cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'ELIMINAR MI CUENTA') {
      return;
    }

    // TODO: Implementar eliminación de cuenta
    alert('Eliminación de cuenta - Por implementar');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
        <p className="text-gray-600 text-sm mt-1">
          Gestiona tu contraseña y configuración de seguridad
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Cambiar Contraseña</h3>
            <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Introduce tu contraseña actual"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Error/Success Messages */}
          {passwordError && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <Key className="w-5 h-5" />
              ¡Contraseña actualizada exitosamente!
            </div>
          )}

          {/* Button */}
          <button
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isChangingPassword ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cambiando...
              </>
            ) : (
              <>
                <Lock size={20} />
                Cambiar Contraseña
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-2">
              💡 Consejos de Seguridad
            </p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Usa una contraseña única que no uses en otros servicios</li>
              <li>• Combina letras, números y símbolos</li>
              <li>• Evita información personal obvia (fechas, nombres)</li>
              <li>• Considera usar un gestor de contraseñas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Zona de Peligro</h3>
            <p className="text-sm text-red-800 mt-1">
              Acciones irreversibles que afectan a tu cuenta
            </p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
          >
            Eliminar Cuenta
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border-2 border-red-300">
              <p className="text-sm text-red-900 font-semibold mb-2">
                ⚠️ Esta acción es permanente e irreversible
              </p>
              <p className="text-sm text-red-800 mb-3">
                Se eliminarán todos tus datos: pacientes, registros, entradas, notas clínicas, etc.
              </p>
                <p className="text-sm text-red-900 font-medium mb-2">
                Escribe {"ELIMINAR MI CUENTA"} para confirmar:
                </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINAR MI CUENTA"
                className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'ELIMINAR MI CUENTA'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}