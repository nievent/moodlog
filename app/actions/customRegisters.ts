// app/actions/customRegisters.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { AutoRegisterFields } from '@/types/database.types';

interface CreateCustomRegisterParams {
  psychologistId: string;
  name: string;
  description: string | null;
  fields: AutoRegisterFields;
}

export async function createCustomRegister({
  psychologistId,
  name,
  description,
  fields,
}: CreateCustomRegisterParams) {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== psychologistId) {
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

    // Validar que haya al menos un campo
    if (!fields.fields || fields.fields.length === 0) {
      return { error: 'El registro debe tener al menos un campo' };
    }

    // Crear el registro
    const { data: register, error: insertError } = await supabaseAdmin
      .from('auto_registers')
      .insert({
        psychologist_id: psychologistId,
        name: name,
        description: description,
        fields: fields,
        is_active: true,
        source: 'custom', // Marcar como creado desde cero
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating register:', insertError);
      return { error: 'Error al crear el registro' };
    }

    // Revalidar la página de registros
    revalidatePath('/dashboard/psychologist/registers');

    return {
      success: true,
      registerId: register.id,
      message: 'Registro creado exitosamente',
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado al crear el registro' };
  }
}

export async function updateCustomRegister({
  registerId,
  psychologistId,
  name,
  description,
  fields,
}: CreateCustomRegisterParams & { registerId: string }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || user.id !== psychologistId) {
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

    // Verificar que el registro pertenece al psicólogo y es personalizado
    const { data: register } = await supabaseAdmin
      .from('auto_registers')
      .select('id, source')
      .eq('id', registerId)
      .eq('psychologist_id', psychologistId)
      .single();

    if (!register) {
      return { error: 'Registro no encontrado' };
    }

    if (register.source !== 'custom') {
      return { error: 'Solo puedes editar registros personalizados' };
    }

    // Actualizar
    const { error: updateError } = await supabaseAdmin
      .from('auto_registers')
      .update({
        name: name,
        description: description,
        fields: fields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', registerId);

    if (updateError) {
      console.error('Error updating register:', updateError);
      return { error: 'Error al actualizar el registro' };
    }

    revalidatePath('/dashboard/psychologist/registers');

    return {
      success: true,
      message: 'Registro actualizado exitosamente',
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}