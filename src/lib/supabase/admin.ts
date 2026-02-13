import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client Supabase com SERVICE_ROLE_KEY — bypassa RLS.
 * 
 * QUANDO USAR:
 * - API Routes que precisam de operações administrativas (auth.admin, criar usuários, etc.)
 * - Operações que precisam ignorar RLS (ex: confirmar convite antes do usuário ter sessão)
 * 
 * QUANDO NÃO USAR:
 * - Qualquer operação onde o usuário já está autenticado via cookies (usar server.ts)
 * - Client-side (usar client.ts)
 * 
 * SEGURANÇA: Nunca expor este client no frontend. Apenas em API Routes server-side.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para o admin client'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey)
}
