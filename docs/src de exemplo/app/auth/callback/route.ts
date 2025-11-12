import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Função para logar informações detalhadas
function logRequestDetails(request: Request, code: string | null) {
  console.log('=== Início da Requisição de Callback de Autenticação ===')
  console.log('URL:', request.url)
  console.log('Método:', request.method)
  console.log('Cabeçalhos:', Object.fromEntries(request.headers.entries()))
  console.log('Código de autorização presente:', !!code)
  console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  console.log('===========================================')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Log detalhado da requisição
  logRequestDetails(request, code)
  
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code) {
    try {
      const supabase = await createClient()
      console.log('Tentando trocar código por sessão...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Erro ao trocar código por sessão:', error)
        throw error
      }
      
      console.log('Sessão criada com sucesso para o usuário:', data.session?.user?.email)
      
      // Construir URL de redirecionamento
      const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
      const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
      const redirectUrl = `${forwardedProto}://${forwardedHost}${next}`
      
      console.log('Redirecionando para:', redirectUrl)
      return NextResponse.redirect(redirectUrl)
      
    } catch (error) {
      console.error('Erro durante o processo de autenticação:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      // Redirecionar para página de erro com detalhes
      const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
      const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
      const errorUrl = new URL(`${forwardedProto}://${forwardedHost}/auth/error`)
      errorUrl.searchParams.set('error', encodeURIComponent(errorMessage))
      
      return NextResponse.redirect(errorUrl.toString())
    }
  }

  // Se não houver código, redirecionar para erro
  console.error('Nenhum código de autorização encontrado na URL')
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  const errorUrl = new URL(`${forwardedProto}://${forwardedHost}/auth/error`)
  errorUrl.searchParams.set('error', 'Código de autorização não encontrado')
  
  return NextResponse.redirect(errorUrl.toString())
}
