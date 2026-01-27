// app/actions/clinicalNotes.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CreateNoteParams {
  entryId: string;
  note: string;
}

export async function createClinicalNote({ entryId, note }: CreateNoteParams) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    // Verificar que el psicólogo puede acceder a esta entrada
    const { data: entry } = await supabase
      .from('register_entries')
      .select(`
        id,
        patient_assignments!inner (
          psychologist_id
        )
      `)
      .eq('id', entryId)
      .single();

    if (!entry) {
      return { error: 'Entrada no encontrada' };
    }

    // Verificar que es el psicólogo correcto
    const assignment = Array.isArray(entry.patient_assignments) 
      ? entry.patient_assignments[0] 
      : entry.patient_assignments;
    
    if (assignment?.psychologist_id !== user.id) {
      return { error: 'No tienes permiso para añadir notas a esta entrada' };
    }

    // Crear la nota
    const { data: clinicalNote, error: insertError } = await supabase
      .from('clinical_notes')
      .insert({
        entry_id: entryId,
        psychologist_id: user.id,
        note: note,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating note:', insertError);
      return { error: 'Error al crear la nota' };
    }

    revalidatePath('/dashboard/psychologist/entries');
    
    return {
      success: true,
      note: clinicalNote,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

export async function updateClinicalNote(noteId: string, note: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    const { error } = await supabase
      .from('clinical_notes')
      .update({ note: note })
      .eq('id', noteId)
      .eq('psychologist_id', user.id);

    if (error) {
      console.error('Error updating note:', error);
      return { error: 'Error al actualizar la nota' };
    }

    revalidatePath('/dashboard/psychologist/entries');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

export async function deleteClinicalNote(noteId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    const { error } = await supabase
      .from('clinical_notes')
      .delete()
      .eq('id', noteId)
      .eq('psychologist_id', user.id);

    if (error) {
      console.error('Error deleting note:', error);
      return { error: 'Error al eliminar la nota' };
    }

    revalidatePath('/dashboard/psychologist/entries');
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

export async function getClinicalNotes(entryId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado', notes: [] };
  }

  try {
    const { data: notes, error } = await supabase
      .from('clinical_notes')
      .select('*')
      .eq('entry_id', entryId)
      .eq('psychologist_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      return { error: 'Error al cargar las notas', notes: [] };
    }

    return { notes: notes || [] };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado', notes: [] };
  }
}