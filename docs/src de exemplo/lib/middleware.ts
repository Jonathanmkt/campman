import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server';
import logger from './logger';
import { getIronSession } from 'iron-session';
import { saveSessionData, getSession } from '@/lib/session';

// Configurar o logger para o middleware
const middlewareLogger = logger.getLogger('middleware');

// Configuração do matcher para filtrar recursos estáticos e APIs
export const config = {
  matcher: [
    // Incluir apenas rotas de página e excluir recursos estáticos/API
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp|css|js)$).*)'
  ],
};

// Lista de rotas públicas que não requerem autenticação
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup', 
  '/auth/sign-up',
  '/auth/callback',
  '/auth/forgot-password',
  '/api',
  '/_next',
  '/favicon.ico',
];

// Lista de recursos estáticos que devem ser ignorados
const STATIC_RESOURCES = [
  '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.css', '.js'
];

// Função auxiliar para verificar se é uma rota pública
function isPublicRoute(pathname: string): boolean {
  if (STATIC_RESOURCES.some(ext => pathname.endsWith(ext))) {
    return true;
  }
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

// Função auxiliar para verificar se é uma rota de autenticação
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth/');
}

// ✅ FUNÇÃO MELHORADA: Detectar reload vs navegação com filtros para API e recursos estáticos
function detectRequestType(request: NextRequest) {
  const referer = request.headers.get('referer');
  const currentUrl = request.nextUrl.href;
  const pathname = request.nextUrl.pathname;
  
  // Verificar se é uma requisição de API ou recurso estático
  const isApiRequest = pathname.startsWith('/api/');
  const isStaticResource = STATIC_RESOURCES.some(ext => pathname.endsWith(ext));
  const isWellKnownResource = pathname.includes('/.well-known/');
  const isNextInternal = pathname.startsWith('/_next/');
  
  // Verificar se é uma requisição que deve ser ignorada para detecção de reload
  const shouldIgnoreForReloadDetection = isApiRequest || isStaticResource || isWellKnownResource || isNextInternal;
  
  // Se for uma requisição que deve ser ignorada, não é considerada reload nem navegação
  if (shouldIgnoreForReloadDetection) {
    return { 
      isReload: false, 
      isNavigation: false,
      isApiRequest,
      isStaticResource,
      isWellKnownResource,
      isNextInternal,
      shouldIgnoreForReloadDetection
    };
  }
  
  // Para outras requisições, aplicar a lógica normal de detecção
  const isReload = !referer || referer === currentUrl;
  const isNavigation = referer && referer !== currentUrl;
  
  return { 
    isReload, 
    isNavigation,
    isApiRequest,
    isStaticResource,
    isWellKnownResource,
    isNextInternal,
    shouldIgnoreForReloadDetection
  };
}

// ✅ FUNÇÃO SIMPLIFICADA: Verificar apenas a Iron Session para dados válidos
async function hasValidSessionData(): Promise<{ isValid: boolean; roles?: string[]; isSpecialUser?: boolean; }> {
  try {
    const session = await getSession();
    
    if (session && session.roles && Array.isArray(session.roles)) {
      // Verificar se é tesoureiro ou secretário
      const isTreasurer = session.roles.includes('tesoureiro');
      const isSecretary = session.roles.includes('secretario');
      const isSpecialUser = isTreasurer || isSecretary;
      
      console.log('[Middleware] Dados válidos encontrados na Iron Session:', {
        roles: session.roles,
        isSpecialUser
      });
      
      return { isValid: true, roles: session.roles, isSpecialUser };
    }
  } catch (error) {
    console.log('[Middleware] Erro ao verificar Iron Session:', error);
  }
  
  console.log('[Middleware] Nenhum dado válido encontrado na Iron Session');
  return { isValid: false };
}

// ✅ FUNÇÃO CORRIGIDA: Aplicar regras de direcionamento baseadas nas roles
async function applyDirectionRules(roles: string[], request: NextRequest, supabaseResponse: NextResponse) {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  
  // Verificar se tem apenas role "usuario"
  const hasOnlyUsuario = roles.length === 1 && roles.includes('usuario');
  
  // Verificar se tem roles administrativas além de "usuario"
  const hasAdminRoles = roles.includes('tesoureiro') || roles.includes('secretario');
  
  console.log('[Middleware] Aplicando regras de direcionamento:', {
    roles,
    hasOnlyUsuario,
    hasAdminRoles,
    pathname
  });
  
  // ✅ REGRA CORRIGIDA: Para usuários autenticados que tentam acessar rotas auth
  if (isAuthRoute(pathname)) {
    console.log('[Middleware] Usuário autenticado tentando acessar rota de autenticação - redirecionando conforme roles');
    
    if (hasOnlyUsuario) {
      url.pathname = '/wait';
    } else if (hasAdminRoles) {
      url.pathname = '/painel';
    }
    
    const redirectResponse = NextResponse.redirect(url);
    
    // Copiar cookies da resposta original
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return redirectResponse;
  }
  
  // REGRA: Apenas "usuario" → sempre vai para /wait
  if (hasOnlyUsuario) {
    if (pathname.startsWith('/wait')) {
      return supabaseResponse; // Já está no local correto
    }
    
    console.log('[Middleware] Usuário apenas com role "usuario" - redirecionando para /wait');
    url.pathname = '/wait';
    const redirectResponse = NextResponse.redirect(url);
    
    // Copiar cookies da resposta original
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return redirectResponse;
  }
  
  // REGRA: "usuario" + roles administrativas → sempre vai para /painel
  if (hasAdminRoles) {
    // Verificar se já está na rota correta
    if (pathname.startsWith('/painel') || pathname === '/') {
      return supabaseResponse; // Já está no local correto
    }
    
    // Verificar se é tesoureiro ou secretário (perfis que usam o novo fluxo)
    const isTreasurer = roles.includes('tesoureiro');
    const isSecretary = roles.includes('secretario');
    const isSpecialUser = isTreasurer || isSecretary;
    
    // Verificar se é navegação interna ou reload
    const { isNavigation, isReload } = detectRequestType(request);
    
    // Para navegação interna de tesoureiro/secretário, não verificar confirmação do UserContext
    if (isSpecialUser) {
      if (isNavigation) {
        // Em navegação interna, não verificar confirmação do UserContext
        console.log('[Middleware] NAVEGAÇÃO INTERNA para tesoureiro/secretário - não aguardando confirmação do UserContext');
      } else if (isReload) {
        // Apenas em reload, verificar confirmação do UserContext
        const session = await getSession();
        const userContextReady = session?.userContextReady === true;
        
        console.log('[Middleware] RELOAD para tesoureiro/secretário - verificando confirmação do UserContext:', {
          userContextReady,
          timestamp: new Date().toISOString()
        });
        
        // Se o UserContext ainda não confirmou recebimento, retornar página de espera
        if (!userContextReady) {
          console.log('[Middleware] UserContext ainda não confirmou recebimento - redirecionando para página de espera');
          
          // Redirecionar para página de espera (pode ser uma página especial ou a atual com parâmetro)
          url.pathname = '/loading';
          url.searchParams.set('redirect', '/painel');
          
          const waitResponse = NextResponse.redirect(url);
          
          // Copiar cookies da resposta original
          supabaseResponse.cookies.getAll().forEach(cookie => {
            waitResponse.cookies.set(cookie.name, cookie.value);
          });
          
          return waitResponse;
        }
        
        // Se chegou aqui, o UserContext já confirmou recebimento
        console.log('[Middleware] UserContext confirmou recebimento - redirecionando para /painel');
      }
    } else {
      console.log('[Middleware] Usuário com roles administrativas (não especial) - redirecionando para /painel');
    }
    
    // Redirecionar para /painel
    url.pathname = '/painel'; // ATENÇÃO: Rota base /painel, não subpáginas
    const redirectResponse = NextResponse.redirect(url);
    
    // Copiar cookies da resposta original
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    
    return redirectResponse;
  }
}

// Caso padrão: permitir acesso à página solicitada
// ✅ FUNÇÃO PRINCIPAL CORRIGIDA - REGRA DE OURO IMPLEMENTADA
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  // 1. Detectar e ignorar requisições de prefetch
  const isPrefetch = 
    request.headers.get('sec-fetch-mode') === 'cors' ||
    request.headers.get('sec-fetch-dest') === 'empty' ||
    request.headers.get('next-router-prefetch') ||
    request.headers.get('purpose') === 'prefetch';

  if (isPrefetch) {
    console.log('[Middleware] Ignorando requisição de prefetch:', request.nextUrl.pathname);
    return NextResponse.next();
  }

  // 2. Tratar bug de execução duplicada do Next.js
  if (request.headers.get('x-action-redirect')) {
    console.log('[Middleware] Ignorando requisição com redirecionamento de action');
    return NextResponse.next();
  }
  
  const pathname = request.nextUrl.pathname;
  console.log(`[Middleware] Processando rota: ${pathname}`);
  
  const isRoutePublic = isPublicRoute(pathname);
  const isAuthRoutePage = isAuthRoute(pathname);
  
  // Se for uma rota pública (recursos estáticos, API), permitir acesso sem verificação adicional
  if (isRoutePublic && !isAuthRoutePage) {
    console.log(`[Middleware] Rota pública detectada: ${pathname} - Acesso permitido sem autenticação`);
    return supabaseResponse;
  }
  
  // Cria o cliente Supabase no servidor
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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  
  // ✅ REGRA DE OURO: SEMPRE VERIFICAR AUTENTICAÇÃO PRIMEIRO
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log('[Middleware] Verificação de autenticação:', {
    autenticado: !!user,
    rotaAuth: isAuthRoutePage
  });
  
  // ✅ FLUXO CORRIGIDO: Usuários NÃO autenticados
  if (!user) {
    console.log('[Middleware] Usuário NÃO autenticado');
    
    if (isAuthRoutePage) {
      console.log('[Middleware] Permitindo acesso à rota de autenticação');
      return supabaseResponse; // ✅ Permitir acesso às rotas auth
    } else {
      console.log('[Middleware] Redirecionando para login');
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
  }
  
  // ✅ FLUXO CORRIGIDO: Usuários AUTENTICADOS - sempre verificar roles primeiro
  console.log('[Middleware] Usuário AUTENTICADO - verificando roles e tipo de requisição');
  
  // ✅ LÓGICA MELHORADA: Detectar reload vs navegação com filtros
  const { 
    isReload, 
    isNavigation, 
    isApiRequest, 
    isStaticResource,
    isWellKnownResource,
    isNextInternal,
    shouldIgnoreForReloadDetection 
  } = detectRequestType(request);
  
  console.log('[Middleware] Tipo de requisição detectado:', {
    isReload,
    isNavigation,
    isApiRequest,
    isStaticResource,
    isWellKnownResource,
    isNextInternal,
    shouldIgnoreForReloadDetection,
    referer: request.headers.get('referer'),
    pathname: request.nextUrl.pathname
  });
  
  // ✅ OTIMIZAÇÃO: Pular processamento completo para recursos que devem ser ignorados
  if (shouldIgnoreForReloadDetection) {
    console.log('[Middleware] Ignorando processamento completo para recurso estático ou API');
    return NextResponse.next();
  }
  
  // ✅ CONDICIONAL PRINCIPAL: Reload vs Navegação
  if (isNavigation) {
    // NAVEGAÇÃO: Verificar dados do UserContext ou Iron Session
    console.log('[Middleware] NAVEGAÇÃO detectada - verificando dados');
    
    // Verificar se tem dados válidos na Iron Session
    const sessionData = await hasValidSessionData();
    
    if (sessionData.isValid && sessionData.roles) {
      // Dados válidos encontrados na Iron Session
      console.log('[Middleware] NAVEGAÇÃO - dados válidos encontrados na Iron Session:', {
        roles: sessionData.roles,
        isSpecialUser: sessionData.isSpecialUser
      });
      
      // Aplicar regras de direcionamento com base nas roles da sessão
      return await applyDirectionRules(sessionData.roles, request, supabaseResponse);
    }
    
    // IMPORTANTE: Para navegação interna, NUNCA fazer chamadas às APIs
    // Redirecionar para login se não encontrou dados válidos
    console.log('[Middleware] NAVEGAÇÃO - dados não encontrados, redirecionando para login');
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  } else {
    // RELOAD: Buscar dados completos das APIs
    console.log('[Middleware] RELOAD detectado - buscando dados completos das APIs');
    
    // Buscar perfil do usuário diretamente do banco de dados
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nome_completo, roles, permissions, access_level, foto_url, chatwoot_api_key, is_chatwoot_admin')
      .eq('id', user.id)
      .single();
    
    // Log detalhado da primeira chamada (Supabase)
    console.log(`[Middleware] CHAMADA 1 - Resultado da consulta ao Supabase:`, {
      sucesso: !!profile,
      erro: profileError ? `${profileError.code}: ${profileError.message}` : null,
      chatwoot_api_key: profile?.chatwoot_api_key ? profile.chatwoot_api_key.trim() : 'não definido',
      is_chatwoot_admin: profile?.is_chatwoot_admin,
      userId: user.id, // Usando o ID do usuário diretamente do objeto user
      roles: profile?.roles
    });
    
    // Interface para os dados consolidados
    interface ConsolidatedUserData {
      supabase_id: string | undefined;
      roles: string[];
      is_chatwoot_admin: boolean;
      nome_completo: string | undefined;
      foto_url: string | null | undefined;
      api_access_token?: string;
      account_id?: number;
      chatwoot_id?: number;
      pubsub_token?: string;
    }
    
    // Dados consolidados que serão armazenados
    let consolidatedData: ConsolidatedUserData = {
      supabase_id: user.id, // Usando o ID do usuário diretamente do objeto user
      roles: profile?.roles || [],
      is_chatwoot_admin: profile?.is_chatwoot_admin || false,
      nome_completo: profile?.nome_completo,
      foto_url: profile?.foto_url
    };
    
    // Interface para a resposta da API do Chatwoot
    interface ChatwootProfileResponse {
      id: number;
      account_id: number;
      access_token: string;
      pubsub_token: string;
      available_name: string;
      avatar_url?: string;
      display_name?: string;
      email: string;
      message_signature?: string;
      accounts: Array<{
        id: number;
        name: string;
        role: string;
      }>;
      ui_settings?: Record<string, any>;
    }
    
    // Segunda chamada: API do Chatwoot para obter dados adicionais
    try {
      const apiKey = profile?.chatwoot_api_key ? profile.chatwoot_api_key.trim() : '';
      
      console.log(`[Middleware] CHAMADA 2 - Iniciando busca de perfil Chatwoot:`, {
        userId: user.id, // Usando o ID do usuário diretamente do objeto user
        apiKeyLength: apiKey.length,
        apiKeyInicio: apiKey.length > 0 ? `${apiKey.substring(0, 5)}...` : 'não disponível'
      });
      
      const response = await fetch('https://chatwoot.virtuetech.com.br/api/v1/profile', {
        method: 'GET',
        headers: {
          'api_access_token': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`[Middleware] CHAMADA 2 - URL e headers:`, {
        url: 'https://chatwoot.virtuetech.com.br/api/v1/profile',
        headers: {
          api_access_token_length: apiKey.length,
          api_access_token_inicio: apiKey.length > 0 ? `${apiKey.substring(0, 5)}...` : 'não disponível'
        }
      });
      
      if (response.ok) {
        const chatwootData = await response.json() as ChatwootProfileResponse;
        
        console.log(`[Middleware] CHAMADA 2 - Resposta da API Chatwoot:`, {
          statusCode: response.status,
          chatwootId: chatwootData.id,
          accountId: chatwootData.account_id,
          accessToken: chatwootData.access_token?.substring(0, 5) + '...',
          pubsubToken: chatwootData.pubsub_token?.substring(0, 5) + '...'
        });
        
        // Adicionar dados do Chatwoot aos dados consolidados
        consolidatedData = {
          ...consolidatedData,
          api_access_token: chatwootData.access_token?.trim(),
          account_id: chatwootData.account_id,
          chatwoot_id: chatwootData.id,
          pubsub_token: chatwootData.pubsub_token
        };
      } else {
        console.log(`[Middleware] CHAMADA 2 - Erro na API Chatwoot:`, {
          statusCode: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      console.log(`[Middleware] CHAMADA 2 - Exceção na API Chatwoot:`, error);
    }
    
    // Verificar se o usuário é tesoureiro ou secretário
    const isTreasurer = consolidatedData.roles?.includes('tesoureiro');
    const isSecretary = consolidatedData.roles?.includes('secretario');
    const isSpecialUser = isTreasurer || isSecretary;
    
    if (isSpecialUser) {
      // Para tesoureiro ou secretário: salvar TODOS os dados na Iron Session
      try {
        // Adicionar flag para indicar que todos os dados estão na sessão
        const allUserData = {
          ...consolidatedData,
          userContextReady: true,
          allDataInSession: true
        };
        
        await saveSessionData(allUserData);
        console.log('[Middleware] IRON SESSION - Todos os dados salvos para tesoureiro/secretário:', {
          temApiAccessToken: !!consolidatedData.api_access_token,
          temAccountId: !!consolidatedData.account_id,
          temChatwootId: !!consolidatedData.chatwoot_id,
          temPubsubToken: !!consolidatedData.pubsub_token,
          isChatwootAdmin: consolidatedData.is_chatwoot_admin,
          roles: consolidatedData.roles,
          allDataInSession: true
        });
        
        // Criar resposta sem header x-user-data
        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
      } catch (error) {
        console.error('[Middleware] ERRO ao salvar na Iron Session:', error);
      }
    } else {
      // Para outros usuários: salvar apenas dados sensíveis e os três campos públicos necessários
      const sessionData = {
        // Dados sensíveis
        api_access_token: consolidatedData.api_access_token?.trim(),
        account_id: consolidatedData.account_id,
        chatwoot_id: consolidatedData.chatwoot_id,
        pubsub_token: consolidatedData.pubsub_token,
        supabase_id: consolidatedData.supabase_id,
        
        // Apenas os três campos públicos necessários
        is_chatwoot_admin: consolidatedData.is_chatwoot_admin,
        nome_completo: consolidatedData.nome_completo,
        foto_url: consolidatedData.foto_url
      };
      
      // Salvar dados na sessão Iron
      try {
        await saveSessionData(sessionData);
        console.log('[Middleware] IRON SESSION - Dados salvos:', {
          temApiAccessToken: !!sessionData.api_access_token,
          temAccountId: !!sessionData.account_id,
          temChatwootId: !!sessionData.chatwoot_id,
          temPubsubToken: !!sessionData.pubsub_token,
          isChatwootAdmin: sessionData.is_chatwoot_admin,
          temNomeCompleto: !!sessionData.nome_completo,
          temFotoUrl: !!sessionData.foto_url
        });
      } catch (error) {
        console.error('[Middleware] ERRO ao salvar na Iron Session:', error);
      }
      
      // Criar nova resposta sem headers de dados públicos
      supabaseResponse = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      
      console.log('[Middleware] HEADER - Nenhum dado público enviado via header');
    }
    
    // ✅ APLICAR REGRAS DE DIRECIONAMENTO (incluindo verificação para rotas auth)
    return await applyDirectionRules(consolidatedData.roles, request, supabaseResponse);
  }
}
