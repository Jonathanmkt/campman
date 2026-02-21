import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Hierarquia de roles do Idealis Core (em ordem de prioridade):
 * masteradmin > admin > coordenador > lideranca > colaborador > eleitor
 */
export type UserRole = 'masteradmin' | 'admin' | 'coordenador' | 'lideranca' | 'colaborador' | 'eleitor' | null;

/**
 * Determina o papel primário do usuário a partir do array de roles.
 * A prioridade segue a hierarquia: admin > coordenador > lideranca > colaborador > eleitor.
 */
function getPrimaryRole(roles: string[] | null): UserRole {
  if (!roles || roles.length === 0) return null;

  if (roles.includes('masteradmin')) return 'masteradmin';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('coordenador')) return 'coordenador';
  if (roles.includes('lideranca')) return 'lideranca';
  if (roles.includes('colaborador')) return 'colaborador';
  if (roles.includes('eleitor')) return 'eleitor';

  return null;
}

/**
 * Retorna a rota padrão (home) para cada role.
 */
function getRouteForRole(role: UserRole): string {
  switch (role) {
    case 'masteradmin':
      return '/dashboard';
    case 'admin':
      return '/dashboard';
    case 'coordenador':
      return '/mobile/liderancas';
    case 'lideranca':
      return '/mobile/eleitores';
    case 'colaborador':
      return '/dashboard';
    case 'eleitor':
      return '/mobile/perfil';
    default:
      return '/sem-acesso';
  }
}

/**
 * Verifica se o usuário com determinado role pode acessar a rota atual.
 * Admin tem acesso total a todas as rotas do dashboard e mobile.
 */
function isAllowedRoute(pathname: string, role: UserRole): boolean {
  // Masteradmin e Admin têm acesso total
  if (role === 'masteradmin' || role === 'admin') {
    return pathname.startsWith('/dashboard') ||
      pathname.startsWith('/mobile') ||
      pathname.startsWith('/onboarding');
  }

  // Rotas exclusivas de admin — bloquear para outros roles
  if (pathname.startsWith('/dashboard/configuracoes')) {
    return false;
  }

  // Rotas comuns a todos os usuários mobile
  if (pathname.startsWith('/mobile/perfil')) {
    return role === 'coordenador' || role === 'lideranca' || role === 'eleitor';
  }

  if (role === 'coordenador') {
    return pathname.startsWith('/mobile/liderancas') || pathname.startsWith('/mobile/eleitores');
  }
  if (role === 'lideranca') {
    return pathname.startsWith('/mobile/eleitores');
  }
  if (role === 'colaborador') {
    return pathname.startsWith('/dashboard') || pathname.startsWith('/mobile');
  }
  if (role === 'eleitor') {
    return pathname.startsWith('/mobile/perfil') || pathname.startsWith('/mobile/eleitores');
  }
  return pathname === '/sem-acesso';
}

const PUBLIC_ROUTES = ['/auth', '/sem-acesso', '/_next', '/api', '/favicon.ico', '/mobile/login', '/mobile/onboarding', '/onboarding', '/convite'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname;

  // Rotas públicas não precisam de verificação
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Usuário não autenticado: redireciona para login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Buscar roles do perfil e membro da campanha
  const { data: profile } = await supabase
    .from('profiles')
    .select('roles, campanha_id')
    .eq('id', user.id)
    .single();

  const primaryRole = getPrimaryRole(profile?.roles ?? null);

  // Se o admin ainda não completou o onboarding (sem campanha_id),
  // redireciona para o fluxo de onboarding
  if ((primaryRole === 'admin' || primaryRole === 'masteradmin') && !profile?.campanha_id && !pathname.startsWith('/onboarding')) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding/admin'
    return NextResponse.redirect(url)
  }

  const allowedRoute = getRouteForRole(primaryRole);

  // Rota raiz: redireciona para a rota permitida
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = allowedRoute
    return NextResponse.redirect(url)
  }

  // Verifica se o usuário pode acessar a rota atual
  if (!isAllowedRoute(pathname, primaryRole)) {
    const url = request.nextUrl.clone()
    url.pathname = allowedRoute
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
