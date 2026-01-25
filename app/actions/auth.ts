// app/actions/auth.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Esquemas de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const registerPsychologistSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const registerPatientSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  invitationCode: z.string().min(6, 'Código de invitación inválido'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export async function login(formData: FormData) {
  const supabase = await createClient();

  console.log('🔵 Iniciando login...');

  // Validar datos
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    console.log('❌ Validación fallida');
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;
  console.log('✅ Intentando login para:', email);

  // Intentar login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error('❌ Login error:', authError);
    
    let errorMessage = 'Credenciales incorrectas';
    if (authError.message.includes('Email not confirmed')) {
      errorMessage = 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.';
    } else if (authError.message.includes('Invalid login credentials')) {
      errorMessage = 'Email o contraseña incorrectos';
    }
    
    return {
      error: { general: errorMessage },
    };
  }

  if (!authData.user) {
    console.error('❌ No se obtuvo usuario');
    return {
      error: { general: 'Error al iniciar sesión' },
    };
  }

  console.log('✅ Login exitoso para usuario:', authData.user.id);

  // Obtener datos del usuario (perfil)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, psychologist_id')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profile) {
    console.error('❌ Profile error:', profileError);
    return {
      error: { general: 'Error al cargar el perfil de usuario' },
    };
  }

  console.log('✅ Perfil cargado:', profile);

  // Redirigir según el rol
  revalidatePath('/', 'layout');
  
  console.log('🔵 Redirigiendo a dashboard...');
  
  if (profile.role === 'psychologist') {
    redirect('/dashboard/psychologist');
  } else {
    redirect('/dashboard/patient');
  }
}

export async function registerPsychologist(formData: FormData) {
  const supabase = await createClient();

  console.log('🔵 Iniciando registro de psicólogo...');

  // Validar datos
  const validatedFields = registerPsychologistSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  });

  if (!validatedFields.success) {
    console.log('❌ Validación fallida:', validatedFields.error);
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName } = validatedFields.data;
  console.log('✅ Datos validados para:', email);

  // Crear cuenta en Supabase Auth SIN metadata (para evitar el trigger)
  console.log('🔵 Creando usuario en auth...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {}, // Vacío para no activar trigger con metadata
    },
  });

  if (authError) {
    console.error('❌ Error en signup:', authError);
    
    // Mensajes de error más claros
    let errorMessage = authError.message;
    if (authError.message.includes('invalid')) {
      errorMessage = 'Este email ya está registrado o es inválido. Intenta con otro email.';
    } else if (authError.message.includes('already registered')) {
      errorMessage = 'Este email ya está en uso. ¿Quieres iniciar sesión?';
    }
    
    return {
      error: { general: errorMessage },
    };
  }

  if (!authData.user) {
    console.error('❌ No se obtuvo usuario');
    return {
      error: { general: 'Error al crear la cuenta' },
    };
  }

  console.log('✅ Usuario creado en auth:', authData.user.id);

  // CREAR EL PERFIL MANUALMENTE usando service_role
  // IMPORTANTE: Necesitamos usar un cliente con privilegios admin
  console.log('🔵 Creando perfil en tabla profiles...');
  
  // Crear cliente admin temporal para bypass RLS
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
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

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'psychologist',
      full_name: fullName,
      psychologist_id: null,
    });

  if (profileError) {
    console.error('❌ Error creando perfil:', profileError);
    return {
      error: { general: `Error al crear el perfil: ${profileError.message}` },
    };
  }

  console.log('✅ Perfil creado exitosamente');

  // CREAR EL PERFIL EXTENDIDO DE PSICÓLOGO
  console.log('🔵 Creando perfil extendido de psicólogo...');
  const { error: psychProfileError } = await supabaseAdmin
    .from('psychologist_profiles')
    .insert({
      id: authData.user.id,
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

  if (psychProfileError) {
    console.error('⚠️ Error creando perfil extendido:', psychProfileError);
    // Continuar de todas formas
  } else {
    console.log('✅ Perfil extendido creado');
  }

  // Redirigir
  console.log('✅ Todo exitoso, redirigiendo...');
  revalidatePath('/', 'layout');
  
  // Si Supabase requiere confirmación de email
  if (authData.user.identities && authData.user.identities.length === 0) {
    redirect('/auth/verify-email');
  }
  
  redirect('/dashboard/psychologist');
}

// ESTO VA DENTRO DE app/actions/auth.ts
// Reemplaza SOLO la función registerPatient, deja todo lo demás igual

export async function registerPatient(formData: FormData) {
  const supabase = await createClient();

  // Validar datos
  const validatedFields = registerPatientSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
    invitationCode: formData.get('invitationCode'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password, fullName, invitationCode } = validatedFields.data;

  // Normalizar email y código
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = invitationCode.toUpperCase().trim(); // ✅ Esto está bien

  console.log('🔵 Iniciando registro de paciente');
  console.log('📧 Email normalizado:', normalizedEmail);
  console.log('🔑 Código normalizado:', normalizedCode); // ❌ AQUÍ ESTÁ EL BUG
  
  // VERIFICAR QUE LA KEY EXISTE
  console.log('🔐 Service Role Key existe:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log('🔐 Service Role Key primeros 20 chars:', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20));

  // USAR CLIENTE ADMIN para verificar invitación (bypass RLS)
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
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

  console.log('✅ Cliente admin creado');

  // PRIMERO: Ver TODAS las invitaciones (debug)
  const { data: allInvitationsDebug, error: debugError } = await supabaseAdmin
    .from('patient_invitations')
    .select('*');
  
  console.log('🔍 TODAS las invitaciones en la BD:', allInvitationsDebug);
  console.log('❓ Error al buscar todas:', debugError);

  // Verificar código de invitación con cliente admin
  const { data: invitation, error: invitationError } = await supabaseAdmin
    .from('patient_invitations')
    .select('id, psychologist_id, email, used, code, expires_at')
    .eq('code', normalizedCode)
    .eq('email', normalizedEmail)
    .eq('used', false)
    .maybeSingle();

  console.log('🔍 Buscando invitación para:', normalizedEmail, 'con código:', normalizedCode);
  console.log('📋 Invitación encontrada:', invitation);
  console.log('📋 Error de invitación:', invitationError);

  if (!invitation) {
    console.error('❌ No se encontró invitación');
    
    // Buscar TODAS las invitaciones para este email (debug)
    const { data: allInvites } = await supabaseAdmin
      .from('patient_invitations')
      .select('code, email, used, expires_at, psychologist_id')
      .ilike('email', normalizedEmail);
    
    console.log('📧 Todas las invitaciones para este email:', allInvites);
    
    return {
      error: { invitationCode: ['Código de invitación inválido o ya utilizado. Verifica el email y el código.'] },
    };
  }

  // Verificar si expiró
  if (new Date(invitation.expires_at) < new Date()) {
    console.error('⏰ Invitación expirada:', invitation.expires_at);
    return {
      error: { invitationCode: ['Este código de invitación ha expirado. Solicita uno nuevo a tu psicólogo.'] },
    };
  }

  // Crear cuenta en Supabase Auth SIN metadata
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {}, // Vacío para evitar trigger
    },
  });

  if (authError) {
    console.error('Signup error:', authError);
    return {
      error: { general: authError.message },
    };
  }

  if (!authData.user) {
    return {
      error: { general: 'Error al crear la cuenta' },
    };
  }

  console.log('✅ Usuario creado en auth:', authData.user.id);

  // CREAR EL PERFIL MANUALMENTE usando admin client
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      role: 'patient',
      full_name: fullName,
      psychologist_id: invitation.psychologist_id,
    });

  if (profileError) {
    console.error('Profile creation error:', profileError);
    return {
      error: { general: 'Error al crear el perfil de usuario' },
    };
  }

  console.log('✅ Perfil creado');

  // Marcar invitación como usada usando admin client
  await supabaseAdmin
    .from('patient_invitations')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', invitation.id);

  console.log('✅ Invitación marcada como usada');

  // Redirigir
  revalidatePath('/', 'layout');
  redirect('/dashboard/patient');
}

export async function logout() {
  const supabase = await createClient();
  
  await supabase.auth.signOut();
  
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function resetPassword(email: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return {
      error: { general: error.message },
    };
  }

  return {
    success: true,
    message: 'Se ha enviado un enlace de recuperación a tu correo',
  };
}