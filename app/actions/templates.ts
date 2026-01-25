// app/actions/templates.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function copyTemplateToMyRegisters(templateId: string) {
  const supabase = await createClient();

  // Obtener usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'No autenticado' };
  }

  try {
    // Obtener la plantilla
    const { data: template, error: templateError } = await supabase
      .from('register_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return { error: 'Plantilla no encontrada' };
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

    // Copiar la plantilla a auto_registers del psicólogo
    const { data: newRegister, error: insertError } = await supabaseAdmin
      .from('auto_registers')
      .insert({
        psychologist_id: user.id,
        name: template.name,
        description: template.description,
        fields: template.fields,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting register:', insertError);
      return { error: 'Error al copiar la plantilla' };
    }

    // Revalidar la página
    revalidatePath('/dashboard/psychologist/registers');

    return { 
      success: true, 
      registerId: newRegister.id,
      message: 'Plantilla copiada exitosamente'
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { error: 'Error inesperado' };
  }
}