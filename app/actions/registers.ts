// app/actions/registers.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

interface AssignRegisterParams {
  registerId: string;
  isGlobal: boolean; // true = plantilla global, false = registro personalizado
  patientIds: string[];
  frequency: 'daily' | 'weekly' | 'as_needed';
  startDate: string;
  endDate: string | null;
  notes: string | null;
}

export async function assignRegisterToPatients({
  registerId,
  isGlobal,
  patientIds,
  frequency,
  startDate,
  endDate,
  notes,
}: AssignRegisterParams) {
  const supabase = await createClient();

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    // Crear cliente admin
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

    let actualRegisterId = registerId;

    // Si es una plantilla global, primero la copiamos a auto_registers
    if (isGlobal) {
      const { data: template } = await supabase
        .from('register_templates')
        .select('*')
        .eq('id', registerId)
        .single();

      if (!template) {
        return { error: 'Plantilla no encontrada' };
      }

      // Copiar plantilla a auto_registers
      const { data: newRegister, error: copyError } = await supabaseAdmin
        .from('auto_registers')
        .insert({
          psychologist_id: user.id,
          name: template.name,
          description: template.description,
          fields: template.fields,
          is_active: true,
          source: 'template', // Marcar como copiada de plantilla
        })
        .select()
        .single();

      if (copyError || !newRegister) {
        console.error('Error copying template:', copyError);
        return { error: 'Error al copiar la plantilla' };
      }

      actualRegisterId = newRegister.id;
    }

    // Crear asignaciones para cada paciente
    const assignments = patientIds.map(patientId => ({
      auto_register_id: actualRegisterId,
      patient_id: patientId,
      psychologist_id: user.id,
      frequency,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
      notes,
    }));

    const { error: assignError } = await supabaseAdmin
      .from('patient_assignments')
      .insert(assignments);

    if (assignError) {
      console.error('Error creating assignments:', assignError);
      return { error: 'Error al crear las asignaciones' };
    }

    // Revalidar las páginas relevantes
    revalidatePath('/dashboard/psychologist/registers');
    revalidatePath('/dashboard/psychologist/patients');

    return {
      success: true,
      message: `Registro asignado a ${patientIds.length} ${patientIds.length === 1 ? 'paciente' : 'pacientes'}`,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado al asignar el registro' };
  }
}

export async function deleteAssignment(assignmentId: string) {
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

    // Marcar como inactiva en lugar de eliminar
    const { error } = await supabaseAdmin
      .from('patient_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId)
      .eq('psychologist_id', user.id);

    if (error) {
      console.error('Error deleting assignment:', error);
      return { error: 'Error al eliminar la asignación' };
    }

    revalidatePath('/dashboard/psychologist/registers');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}

export async function deleteCustomRegister(registerId: string) {
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

    // Verificar si tiene asignaciones activas
    const { data: assignments } = await supabaseAdmin
      .from('patient_assignments')
      .select('id')
      .eq('auto_register_id', registerId)
      .eq('is_active', true);

    if (assignments && assignments.length > 0) {
      return { error: 'No se puede eliminar un registro con asignaciones activas' };
    }

    // Eliminar el registro
    const { error } = await supabaseAdmin
      .from('auto_registers')
      .delete()
      .eq('id', registerId)
      .eq('psychologist_id', user.id);

    if (error) {
      console.error('Error deleting register:', error);
      return { error: 'Error al eliminar el registro' };
    }

    revalidatePath('/dashboard/psychologist/registers');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}