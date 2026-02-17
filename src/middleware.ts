import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? ''
  const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent)

  if (pathname.startsWith('/auth/login') && isMobileDevice) {
    const url = request.nextUrl.clone()
    url.pathname = '/mobile/login'
    return NextResponse.redirect(url)
  }

  // Rotas públicas que não passam pelo updateSession
  if (
    pathname.startsWith('/convites-pendentes') ||
    pathname.startsWith('/mobile/onboarding') ||
    pathname.startsWith('/mobile/login') ||
    pathname.startsWith('/roadmap') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/payment/') ||
    (pathname.startsWith('/dev/') && process.env.NODE_ENV === 'development') ||
    pathname === '/fluxo-convites.html'
  ) {
    return NextResponse.next()
  }

  return await updateSession(request)
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
    '/((?!_next/static|_next/image|favicon.ico|convites-pendentes|mobile/onboarding|mobile/login|roadmap|api/webhooks|checkout|payment|onboarding|dev|fluxo-convites\.html|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
