import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Convite genérico para membros da campanha (colaborador, coordenador).
 * Usa Supabase inviteUserByEmail com SMTP configurado (nao-responda@idealiscore.com.br).
 *
 * O metadata (role, campanha_id, invited_by) fica disponível em
 * user.user_metadata após o aceite, permitindo que o onboarding
 * saiba qual role e campanha atribuir.
 */

export type InviteMemberRole = 'colaborador' | 'coordenador'

export interface InviteMemberPayload {
  email: string
  role: InviteMemberRole
  campanhaId: string
  invitedBy: string
  /** Nome opcional para personalizar o convite */
  nomeConvidado?: string
  /** Telefone do convidado (obrigatório para coordenador) */
  telefone?: string
}

export interface InviteMemberResult {
  success: boolean
  error: string | null
  userId?: string
}

/**
 * Dispara convite para colaborador ou coordenador via Supabase inviteUserByEmail.
 * Após aceitar o link no email, o usuário é redirecionado para o onboarding
 * específico do role, onde o registro na tabela operacional é criado.
 */
export async function inviteMember(payload: InviteMemberPayload): Promise<InviteMemberResult> {
  try {
    const supabase = createAdminClient()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Rota de onboarding pós-aceite depende do role
    const onboardingPath = payload.role === 'coordenador'
      ? '/onboarding/coordenador'
      : '/onboarding/colaborador'

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(payload.email, {
      redirectTo: `${siteUrl}/auth/confirm?next=${onboardingPath}`,
      data: {
        role: payload.role,
        campanha_id: payload.campanhaId,
        invited_by: payload.invitedBy,
        nome_convidado: payload.nomeConvidado ?? null,
        telefone: payload.telefone ?? null,
      },
    })

    if (error) {
      console.error(`[inviteMember] Erro ao enviar convite de ${payload.role}:`, error.message)
      return { success: false, error: error.message }
    }

    console.log(`[inviteMember] Convite de ${payload.role} enviado:`, {
      email: payload.email,
      userId: data.user.id,
      campanhaId: payload.campanhaId,
    })

    return { success: true, error: null, userId: data.user.id }
  } catch (err) {
    console.error('[inviteMember] Erro inesperado:', err)
    return { success: false, error: 'Erro inesperado ao enviar convite' }
  }
}
