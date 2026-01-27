// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Cambiar el nombre de la función a updateSession
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas protegidas
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Si NO hay usuario y está intentando acceder a ruta protegida
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si HAY usuario y está en /login, redirigir a su dashboard
  if (user && pathname === '/login') {
    // Obtener el rol del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    
    if (profile?.role === 'psychologist') {
      url.pathname = '/dashboard/psychologist';
    } else if (profile?.role === 'patient') {
      url.pathname = '/dashboard/patient';
    } else {
      // Si no tiene rol definido, dejar en login
      return supabaseResponse;
    }
    
    return NextResponse.redirect(url);
  }

  // IMPORTANTE: Si el usuario está accediendo a /dashboard/patient o /dashboard/psychologist
  // NO hacer nada, dejar pasar
  return supabaseResponse;
}