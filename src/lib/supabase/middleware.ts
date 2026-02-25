import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verifica se o usuário está logado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define rotas públicas (acessíveis sem login)
  const publicRoutes = ['/login', '/serwist', '/offline'];
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Regra de Ouro da Proteção:
  // 1. Se NÃO estiver logado e tentar acessar rota privada...
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. Se ESTIVER logado e tentar acessar rotas públicas (login/signup)...
  if (user && isPublicRoute) {
    // Busca role e redireciona direto para /manager ou /operator (evita carregar /)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = (profile as { role?: string } | null)?.role ?? 'OPERATOR';
    const url = request.nextUrl.clone();
    url.pathname = role === 'MANAGER' ? '/manager' : '/operator';
    return NextResponse.redirect(url);
  }

  // 3. Otimização: raiz (/) — redirect por role no middleware evita carregar a página
  if (user && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = (profile as { role?: string } | null)?.role ?? 'OPERATOR';
    const url = request.nextUrl.clone();
    url.pathname = role === 'MANAGER' ? '/manager' : '/operator';
    return NextResponse.redirect(url);
  }

  return response;
}
