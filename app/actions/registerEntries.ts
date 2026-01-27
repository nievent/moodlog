// app/actions/registerEntries.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { RegisterEntryData } from '@/types/database.types';

interface SubmitEntryParams {
  assignmentId: string;
  data: RegisterEntryData;
  entryDate: string;
  notes: string | null;
}

export async function submitRegisterEntry({
  assignmentId,
  data,
  entryDate,
  notes,
}: SubmitEntryParams) {
  const supabase = await createClient();

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    // Verificar que la asignación pertenece al usuario
    const { data: assignment, error: assignmentError } = await supabase
      .from('patient_assignments')
      .select('id, patient_id, is_active')
      .eq('id', assignmentId)
      .eq('patient_id', user.id)
      .single();

    if (assignmentError || !assignment) {
      return { error: 'Asignación no encontrada' };
    }

    if (!assignment.is_active) {
      return { error: 'Esta asignación ya no está activa' };
    }

    // Crear cliente admin para insertar
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

    // Guardar la entrada
    const { data: entry, error: insertError } = await supabaseAdmin
      .from('register_entries')
      .insert({
        assignment_id: assignmentId,
        patient_id: user.id,
        data: data,
        entry_date: entryDate,
        notes: notes,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting entry:', insertError);
      return { error: 'Error al guardar la entrada' };
    }

    // Revalidar páginas
    revalidatePath('/dashboard/patient');
    revalidatePath('/dashboard/psychologist/registers');

    return {
      success: true,
      entryId: entry.id,
      message: 'Entrada guardada exitosamente',
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado al guardar la entrada' };
  }
}

export async function deleteRegisterEntry(entryId: string) {
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

    // Verificar que la entrada pertenece al usuario
    const { data: entry } = await supabaseAdmin
      .from('register_entries')
      .select('patient_id')
      .eq('id', entryId)
      .single();

    if (!entry || entry.patient_id !== user.id) {
      return { error: 'Entrada no encontrada' };
    }

    // Eliminar entrada
    const { error } = await supabaseAdmin
      .from('register_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting entry:', error);
      return { error: 'Error al eliminar la entrada' };
    }

    revalidatePath('/dashboard/patient');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

export async function updateRegisterEntry({
  entryId,
  data,
  entryDate,
  notes,
}: {
  entryId: string;
  data: RegisterEntryData;
  entryDate: string;
  notes: string | null;
}) {
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

    // Verificar que la entrada pertenece al usuario
    const { data: entry } = await supabaseAdmin
      .from('register_entries')
      .select('patient_id')
      .eq('id', entryId)
      .single();

    if (!entry || entry.patient_id !== user.id) {
      return { error: 'Entrada no encontrada' };
    }

    // Actualizar entrada
    const { error } = await supabaseAdmin
      .from('register_entries')
      .update({
        data: data,
        entry_date: entryDate,
        notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId);

    if (error) {
      console.error('Error updating entry:', error);
      return { error: 'Error al actualizar la entrada' };
    }

    revalidatePath('/dashboard/patient');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}