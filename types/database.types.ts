// types/database.types.ts
// Tipos de TypeScript para la base de datos de MoodLog

export type UserRole = 'psychologist' | 'patient';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'past_due';
export type Frequency = 'daily' | 'weekly' | 'as_needed';

// Tipos para campos dinámicos de formularios
export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'scale' | 'date' | 'time' | 'textarea';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[]; // Para select y multiselect
  min?: number; // Para number y scale
  max?: number; // Para number y scale
  placeholder?: string;
}

export interface AutoRegisterFields {
  fields: FormField[];
  version?: number;
}

export interface RegisterEntryData {
  [fieldId: string]: string | number | string[] | boolean | null;
}

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  psychologist_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PsychologistProfile {
  id: string;
  license_number: string | null;
  specialization: string | null;
  organization: string | null;
  phone: string | null;
  timezone: string;
  subscription_status: SubscriptionStatus;
  subscription_id: string | null;
  stripe_customer_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientInvitation {
  id: string;
  psychologist_id: string;
  email: string;
  code: string;
  used: boolean;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export interface AutoRegister {
  id: string;
  psychologist_id: string;
  name: string;
  description: string | null;
  fields: AutoRegisterFields; // JSONB - estructura dinámica tipada
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientAssignment {
  id: string;
  auto_register_id: string;
  patient_id: string;
  psychologist_id: string;
  frequency: Frequency | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterEntry {
  id: string;
  assignment_id: string;
  patient_id: string;
  data: RegisterEntryData; // JSONB - datos del formulario completado tipados
  entry_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Tipos para las relaciones (joins)
export interface ProfileWithPsychologist extends Profile {
  psychologist?: Profile;
}

export interface PatientWithProfile extends Profile {
  psychologist_profile?: PsychologistProfile;
}

export interface AssignmentWithDetails extends PatientAssignment {
  auto_register?: AutoRegister;
  patient?: Profile;
}

export interface EntryWithDetails extends RegisterEntry {
  assignment?: PatientAssignment;
  patient?: Profile;
}