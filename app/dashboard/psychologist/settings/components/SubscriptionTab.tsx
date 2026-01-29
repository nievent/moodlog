// app/dashboard/psychologist/settings/components/SubscriptionTab.tsx
'use client';

import { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Users, 
  FileText, 
  TrendingUp,
  Crown,
  Sparkles,
  Calendar,
  Download
} from 'lucide-react';

interface PsychologistProfile {
  id: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

interface Props {
  psychProfile: PsychologistProfile | null;
  userId: string;
}

const PLANS = [
  {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    period: '',
    description: 'Perfecto para empezar',
    features: [
      'Hasta 3 pacientes',
      '5 registros personalizados',
      'Análisis básico',
      'Soporte por email',
    ],
    color: 'from-gray-400 to-gray-600',
    icon: Users,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: 29,
    period: '/mes',
    description: 'Para psicólogos activos',
    features: [
      'Pacientes ilimitados',
      'Registros ilimitados',
      'Análisis avanzado',
      'Exportar datos',
      'Soporte prioritario',
      'Notas clínicas privadas',
    ],
    color: 'from-teal-500 to-purple-600',
    icon: Zap,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Clínica',
    price: 99,
    period: '/mes',
    description: 'Para equipos y centros',
    features: [
      'Todo lo del plan Pro',
      'Múltiples profesionales',
      'Dashboard de equipo',
      'API personalizada',
      'Gestor de cuenta dedicado',
      'Cumplimiento HIPAA/GDPR',
    ],
    color: 'from-purple-500 to-pink-600',
    icon: Crown,
    popular: false,
  },
];

export default function SubscriptionTab({ psychProfile, userId }: Props) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const currentStatus = psychProfile?.subscription_status || 'trialing';
  const trialEndsAt = psychProfile?.trial_ends_at;

  const handleUpgrade = (planId: string) => {
    // TODO: Integrar con Stripe
    alert(`Upgrade a ${planId} - Integración con Stripe próximamente`);
  };

  const getDaysRemaining = () => {
    if (!trialEndsAt) return 0;
    const now = new Date();
    const end = new Date(trialEndsAt); // trialEndsAt ya está verificado como no-null arriba
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const daysRemaining = getDaysRemaining();
  
  // Helper para formatear fecha de forma segura
  const formatTrialEndDate = () => {
    if (!trialEndsAt) return '';
    return new Date(trialEndsAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Suscripción y Facturación</h2>
        <p className="text-gray-600 text-sm mt-1">
          Gestiona tu plan y métodos de pago
        </p>
      </div>

      {/* Current Status */}
      {currentStatus === 'trialing' && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                🎉 Prueba Gratuita Activa
              </h3>
              <p className="text-gray-700 mb-3">
                Tienes acceso completo a todas las funcionalidades del plan Profesional.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">
                    {daysRemaining} días restantes
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  Termina el {formatTrialEndDate()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === 'pro' && currentStatus === 'trialing';
          
          return (
            <div
              key={plan.id}
              className={`
                relative bg-white rounded-2xl border-2 p-6 transition-all
                ${plan.popular 
                  ? 'border-teal-400 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
                }
                ${isCurrentPlan ? 'ring-2 ring-purple-400' : ''}
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-teal-500 to-purple-600 text-white text-xs font-bold rounded-full">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    ACTUAL
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Plan Info */}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? 'Gratis' : `${plan.price}€`}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isCurrentPlan}
                className={`
                  w-full px-6 py-3 rounded-xl font-semibold transition-all
                  ${plan.popular
                    ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  ${isCurrentPlan ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isCurrentPlan 
                  ? 'Plan Actual' 
                  : plan.price === 0 
                  ? 'Continuar Gratis' 
                  : 'Seleccionar Plan'
                }
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Method (Mock) */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Método de Pago</h3>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Durante la prueba gratuita no necesitas añadir un método de pago.
            Podrás hacerlo cuando elijas tu plan.
          </p>
        </div>
      </div>

      {/* Billing History (Mock) */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Historial de Facturación</h3>
          </div>
        </div>

        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            No tienes facturas todavía. Aparecerán aquí cuando realices tu primer pago.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-3">💡 Preguntas Frecuentes</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-1">¿Puedo cancelar en cualquier momento?</p>
            <p>Sí, puedes cancelar tu suscripción cuando quieras sin penalización.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">¿Qué pasa al final de la prueba gratuita?</p>
            <p>Podrás elegir continuar con el plan gratuito o actualizar a un plan de pago.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">¿Los datos están seguros?</p>
            <p>Sí, cumplimos con GDPR y usamos encriptación de nivel bancario.</p>
          </div>
        </div>
      </div>
    </div>
  );
}