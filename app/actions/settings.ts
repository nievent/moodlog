// app/actions/settings.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

interface UpdateProfileParams {
  userId: string;
  fullName: string;
  avatarUrl: string;
}

export async function updateProfile({ userId, fullName, avatarUrl }: UpdateProfileParams) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    return { error: 'No autenticado' };
  }

  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { error: 'Error al actualizar el perfil' };
    }

    revalidatePath('/dashboard/psychologist/settings');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

interface UpdateProfessionalProfileParams {
  userId: string;
  licenseNumber: string | null;
  specialization: string | null;
  organization: string | null;
  phone: string | null;
  timezone: string;
}

export async function updateProfessionalProfile({
  userId,
  licenseNumber,
  specialization,
  organization,
  phone,
  timezone,
}: UpdateProfessionalProfileParams) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== userId) {
    return { error: 'No autenticado' };
  }

  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar si existe el perfil de psicólogo
    const { data: existingProfile } = await supabaseAdmin
      .from('psychologist_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Actualizar
      const { error } = await supabaseAdmin
        .from('psychologist_profiles')
        .update({
          license_number: licenseNumber,
          specialization: specialization,
          organization: organization,
          phone: phone,
          timezone: timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating psychologist profile:', error);
        return { error: 'Error al actualizar información profesional' };
      }
    } else {
      // Crear
      const { error } = await supabaseAdmin
        .from('psychologist_profiles')
        .insert({
          id: userId,
          license_number: licenseNumber,
          specialization: specialization,
          organization: organization,
          phone: phone,
          timezone: timezone,
        });

      if (error) {
        console.error('Error creating psychologist profile:', error);
        return { error: 'Error al crear información profesional' };
      }
    }

    revalidatePath('/dashboard/psychologist/settings');

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export async function updatePassword({ currentPassword, newPassword }: UpdatePasswordParams) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    // Verificar contraseña actual intentando hacer login
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { error: 'La contraseña actual es incorrecta' };
    }

    // Actualizar contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error('Error updating password:', updateError);
      return { error: 'Error al actualizar la contraseña' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

export async function deleteAccount() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Eliminar usuario (esto eliminará en cascada todos los datos relacionados)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('Error deleting account:', error);
      return { error: 'Error al eliminar la cuenta' };
    }

    // Cerrar sesión
    await supabase.auth.signOut();

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}