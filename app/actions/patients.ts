// app/actions/patients.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Función para generar código de invitación
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface CreateInvitationParams {
  psychologistId: string;
  patientName: string;
  patientEmail: string;
  notes?: string;
}

export async function createPatientInvitation({
  psychologistId,
  patientName,
  patientEmail,
  notes,
}: CreateInvitationParams) {
  const supabase = await createClient();

  try {
    // Verificar que no exista ya una invitación activa para este email
    const { data: existingInvitation } = await supabase
      .from('patient_invitations')
      .select('id')
      .eq('psychologist_id', psychologistId)
      .eq('email', patientEmail)
      .eq('used', false)
      .single();

    if (existingInvitation) {
      return {
        error: 'Ya existe una invitación activa para este email',
      };
    }

    // Generar código único
    let code = generateInvitationCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('patient_invitations')
        .select('id')
        .eq('code', code)
        .single();

      if (!existing) {
        isUnique = true;
      } else {
        code = generateInvitationCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return {
        error: 'No se pudo generar un código único. Por favor, inténtalo de nuevo.',
      };
    }

    // Crear la invitación
    const { data: invitation, error: invitationError } = await supabase
      .from('patient_invitations')
      .insert({
        psychologist_id: psychologistId,
        email: patientEmail,
        code: code,
        used: false,
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      return {
        error: 'Error al crear la invitación',
      };
    }

    // TODO: Enviar email con el código
    // Aquí se integraría con un servicio de email como Resend o SendGrid
    console.log(`📧 Email a enviar a ${patientEmail}:`);
    console.log(`Hola ${patientName},`);
    console.log(`Tu código de invitación para MoodLog es: ${code}`);
    console.log(`Accede a la app y regístrate como paciente usando este código.`);

    // Revalidar la página de pacientes
    revalidatePath('/dashboard/psychologist/patients');

    return {
      success: true,
      code: code,
      invitationId: invitation.id,
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      error: 'Ha ocurrido un error inesperado',
    };
  }
}