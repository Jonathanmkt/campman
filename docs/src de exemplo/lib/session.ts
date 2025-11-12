import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Tipos para os dados sensíveis que ficam no servidor
export interface SessionData {
  // Dados comuns para todos os usuários
  is_chatwoot_admin: boolean;
  api_access_token?: string;
  account_id?: number;
  chatwoot_id?: number;
  pubsub_token?: string;
  supabase_id?: string;
  
  // Dados adicionais para tesoureiro/secretário
  roles?: string[];
  nome_completo?: string;
  foto_url?: string | null;
  
  // Flags de controle
  userContextReady?: boolean;
  allDataInSession?: boolean;
}

// Configuração da sessão
const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
  cookieName: 'singaerj-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
};

// Função para obter a sessão
export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}

// Função para salvar dados na sessão
export async function saveSessionData(data: SessionData) {
  const session = await getSession();
  Object.assign(session, data);
  await session.save();
}

// Função para limpar a sessão
export async function clearSession() {
  const session = await getSession();
  session.destroy();
}
