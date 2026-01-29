// app/dashboard/psychologist/settings/components/ProfileTab.tsx
'use client';

import { useState } from 'react';
import { Camera, Save, User, Mail, Calendar } from 'lucide-react';
import { updateProfile } from '@/app/actions/settings';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

interface Props {
  user: SupabaseUser;
  profile: Profile;
}

export default function ProfileTab({ user, profile }: Props) {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor sube una imagen válida');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen debe ser menor a 2MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Crear cliente Supabase en el cliente
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Subir a Supabase Storage (raíz del bucket, sin carpetas)
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Sobreescribir si ya existe
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Error al subir la imagen');
        setIsUploading(false);
        return;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Actualizar estado con la URL
      setAvatarUrl(publicUrl);

      // Auto-guardar
      const result = await updateProfile({
        userId: user.id,
        fullName,
        avatarUrl: publicUrl,
      });

      if (result.error) {
        setError(result.error);
      }

    } catch (err) {
      console.error('Error:', err);
      setError('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const result = await updateProfile({
        userId: user.id,
        fullName,
        avatarUrl,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Perfil Personal</h2>
        <p className="text-gray-600 text-sm mt-1">
          Actualiza tu información personal y foto de perfil
        </p>
      </div>

      {/* Avatar Upload */}
      <div className="bg-gradient-to-br from-teal-50 to-purple-50 border-2 border-teal-200 rounded-xl p-6">
        <label className="block text-sm font-semibold text-gray-900 mb-4">
          Foto de Perfil
        </label>
        
        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            {avatarUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-purple-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            
            {/* Upload Button Overlay */}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-600 transition-colors shadow-lg border-2 border-white">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Instructions */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              Sube una foto de perfil profesional
            </p>
            <p className="text-sm text-gray-600">
              Formato JPG, PNG o GIF. Tamaño máximo 2MB.
            </p>
            {isUploading && (
              <p className="text-sm text-teal-600 mt-2">Subiendo imagen...</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Nombre Completo */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            No puedes cambiar tu email. Contacta con soporte si necesitas actualizarlo.
          </p>
        </div>

        {/* Fecha de Creación (readonly) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Miembro Desde
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={new Date(profile.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              disabled
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Save className="w-5 h-5" />
          ¡Perfil actualizado exitosamente!
        </div>
      )}

      {/* Save Button */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <Save size={20} />
              Guardar Cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}