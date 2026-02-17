import { inviteAdmin } from '@/lib/services/invite-admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * POST /api/webhooks/pagarme
 *
 * Recebe webhook de pagamento aprovado do Pagar.me (ou simulação dev).
 * Valida o payload, extrai email do cliente e dispara convite admin via Supabase.
 *
 * Em produção: validar assinatura HMAC do webhook.
 * Em dev: aceita payload direto do simulador /dev/pagarme-simulator.
 */

const webhookSchema = z.object({
  /** Email do cliente que pagou */
  email: z.string().email('Email inválido'),
  /** Nome do cliente */
  nome: z.string().min(1, 'Nome obrigatório'),
  /** Valor cobrado em centavos */
  valor: z.number().positive('Valor deve ser positivo'),
  /** ID da cobrança no Pagar.me */
  charge_id: z.string().min(1, 'charge_id obrigatório'),
  /** ID da assinatura no Pagar.me */
  subscription_id: z.string().optional(),
  /** Slug do plano contratado */
  plano_slug: z.string().min(1, 'plano_slug obrigatório'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Em produção, validar HMAC do webhook aqui
    // const signature = request.headers.get('x-pagarme-signature')
    // if (!isValidSignature(signature, body)) { return 401 }

    const parsed = webhookSchema.safeParse(body)

    if (!parsed.success) {
      console.error('[Webhook Pagar.me] Payload inválido:', parsed.error.errors)
      return NextResponse.json(
        { success: false, data: null, error: 'Payload inválido' },
        { status: 400 }
      )
    }

    const { email, nome, charge_id, subscription_id, plano_slug } = parsed.data

    // Determinar origem: se charge_id começa com "sim_" é simulação dev
    const isSimulation = charge_id.startsWith('sim_')
    const origemConvite = isSimulation ? 'pagarme_simulator' as const : 'pagarme_webhook' as const

    // Determinar tipo do plano baseado no slug
    const planoTipo = plano_slug === 'cortesia' ? 'cortesia' as const : 'pago' as const

    console.log('[Webhook Pagar.me] Processando pagamento:', {
      email,
      nome,
      charge_id,
      plano_slug,
      origemConvite,
    })

    // Disparar convite
    const result = await inviteAdmin({
      email,
      planoTipo,
      origemConvite,
      pagarmeChargeId: charge_id,
      pagarmeSubscriptionId: subscription_id,
    })

    if (!result.success) {
      console.error('[Webhook Pagar.me] Erro ao enviar convite:', result.error)
      return NextResponse.json(
        { success: false, data: null, error: result.error },
        { status: 500 }
      )
    }

    console.log('[Webhook Pagar.me] Convite enviado com sucesso:', {
      email,
      userId: result.userId,
    })

    return NextResponse.json({
      success: true,
      data: { userId: result.userId, email },
      error: null,
    })
  } catch (error) {
    console.error('[Webhook Pagar.me] Erro inesperado:', error)
    return NextResponse.json(
      { success: false, data: null, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
