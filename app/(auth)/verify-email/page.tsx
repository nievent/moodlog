
// app/auth/verify-email/page.tsx
export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verifica tu correo
          </h1>
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de verificación a tu correo electrónico. 
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Consejo:</strong> Si no ves el email, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
          <a 
            href="/login"
            className="mt-6 inline-block text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}