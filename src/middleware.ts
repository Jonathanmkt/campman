import { type NextRequest } from 'next/server'
// TODO: TEMPORÁRIO - Middleware desabilitado durante desenvolvimento
// import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // TODO: TEMPORÁRIO - Middleware de autenticação desabilitado para desenvolvimento
  // Reativar antes do deploy em produção descomentando a linha abaixo:
  // return await updateSession(request)
  
  // Por enquanto, permite acesso a todas as rotas
  return
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
