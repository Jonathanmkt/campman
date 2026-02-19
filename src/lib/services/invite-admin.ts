import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Tipos de origem de convite para admin.
 * - masteradmin: convite manual feito por um admin Idealis (cortesia)
 * - pagarme_webhook: convite disparado automaticamente após pagamento confirmado
 * - pagarme_simulator: convite disparado pela página de simulação (dev only)
 */
export type OrigemConvite = 'masteradmin' | 'pagarme_webhook' | 'pagarme_simulator'

/**
 * Tipos de plano que podem ser atribuídos via convite.
 */
export type PlanoTipo = 'cortesia' | 'pago'

/**
 * Payload para disparar convite de admin.
 */
export interface InviteAdminPayload {
  email: string
  planoTipo: PlanoTipo
  origemConvite: OrigemConvite
  /** ID do admin que está enviando o convite (quando aplicável) */
  invitedBy?: string
  /** IDs externos do Pagar.me (quando aplicável) */
  pagarmeChargeId?: string
  pagarmeSubscriptionId?: string
}

/**
 * Resultado do disparo de convite.
 */
export interface InviteAdminResult {
  success: boolean
  error: string | null
  userId?: string
}

/**
 * Dispara convite para um novo admin via Supabase inviteUserByEmail.
 *
 * O metadata (role, plano_tipo, origem_convite) fica disponível em
 * user.user_metadata após o aceite do convite, permitindo que o
 * onboarding saiba qual plano ativar.
 *
 * O redirectTo aponta para /auth/oauth?next=/onboarding/admin,
 * que já faz exchangeCodeForSession e redireciona o usuário
 * autenticado para o onboarding.
 */
export async function inviteAdmin(payload: InviteAdminPayload): Promise<InviteAdminResult> {
  try {
    const supabase = createAdminClient()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(payload.email, {
      redirectTo: `${siteUrl}/auth/confirm?next=/onboarding/admin`,
      data: {
        role: 'admin',
        plano_tipo: payload.planoTipo,
        origem_convite: payload.origemConvite,
        invited_by: payload.invitedBy ?? null,
        pagarme_charge_id: payload.pagarmeChargeId ?? null,
        pagarme_subscription_id: payload.pagarmeSubscriptionId ?? null,
      },
    })

    if (error) {
      console.error('[inviteAdmin] Erro ao enviar convite:', error.message)
      return { success: false, error: error.message }
    }

    console.log('[inviteAdmin] Convite enviado com sucesso:', {
      email: payload.email,
      userId: data.user.id,
      planoTipo: payload.planoTipo,
      origemConvite: payload.origemConvite,
    })

    return { success: true, error: null, userId: data.user.id }
  } catch (err) {
    console.error('[inviteAdmin] Erro inesperado:', err)
    return { success: false, error: 'Erro inesperado ao enviar convite' }
  }
}
