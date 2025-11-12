import { NextRequest } from 'next/server';
import { updateSession } from '@/lib/middleware';

export async function middleware(request: NextRequest) {
  // Processa a sessão e obtém os dados do usuário via headers
  const response = await updateSession(request);

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login',
    '/registro',
    '/esqueci-senha',
    '/api/auth/callback',
    '/api/auth/me',
  ];

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    // Rota pública detectada - Acesso permitido sem autenticação
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
