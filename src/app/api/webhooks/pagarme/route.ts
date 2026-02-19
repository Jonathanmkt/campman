import { inviteAdmin } from '@/lib/services/invite-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/webhooks/pagarme
 *
 * Recebe webhook REAL da Pagar.me com autenticação Basic Auth.
 * Processa eventos de pagamento e dispara convite admin via Supabase.
 *
 * IMPORTANTE: Pagar.me usa APENAS Basic Authentication (usuário/senha).
 * NÃO usa HMAC/signatures.
 */

/**
 * Valida Basic Authentication do webhook Pagar.me
 */
function verifyBasicAuth(authHeader: string | null): boolean {
  if (!authHeader) {
    console.error('[Webhook Pagar.me] Header de autenticação ausente')
    return false
  }

  try {
    const [type, credentials] = authHeader.split(' ')

    if (type !== 'Basic') {
      console.error('[Webhook Pagar.me] Tipo de autenticação inválido:', type)
      return false
    }

    const decoded = Buffer.from(credentials, 'base64').toString('utf-8')
    const [username, password] = decoded.split(':')

    const validUsername = process.env.PAGARME_WEBHOOK_USER
    const validPassword = process.env.PAGARME_WEBHOOK_PASSWORD

    if (!validUsername || !validPassword) {
      console.error('[Webhook Pagar.me] Credenciais não configuradas no .env')
      return false
    }

    if (username !== validUsername || password !== validPassword) {
      console.error('[Webhook Pagar.me] Credenciais inválidas')
      return false
    }

    return true
  } catch (error) {
    console.error('[Webhook Pagar.me] Erro ao validar Basic Auth:', error)
    return false
  }
}

type PagarmeOrderData = Record<string, unknown>

function extractCustomerEmail(orderData: PagarmeOrderData): string | null {
  const customer = orderData?.customer as Record<string, unknown> | undefined
  return (customer?.email as string) || null
}

function extractPlanSlug(orderData: PagarmeOrderData): string {
  const items = orderData?.items as Array<Record<string, unknown>> | undefined
  const firstItem = items?.[0]
  if (!firstItem) return 'basico'

  const itemCode = String(firstItem.code || '').toLowerCase()
  const itemDesc = String(firstItem.description || '').toLowerCase()

  if (itemCode.includes('profissional') || itemDesc.includes('profissional')) return 'profissional'
  if (itemCode.includes('cortesia') || itemDesc.includes('cortesia')) return 'cortesia'
  return itemCode || 'basico'
}

/**
 * Handler para evento order.paid
 * Fluxo: atualiza pedido local → envia convite via Supabase auth
 */
async function handleOrderPaid(orderData: PagarmeOrderData) {
  const supabase = createAdminClient()
  const email = extractCustomerEmail(orderData)
  const planoSlug = extractPlanSlug(orderData)
  const pagarmeOrderId = orderData?.id as string
  const charges = orderData?.charges as Array<Record<string, unknown>> | undefined
  const chargeId = (charges?.[0]?.id as string) || pagarmeOrderId
  const localOrderId = (orderData?.metadata as Record<string, unknown>)?.local_order_id as string | undefined

  if (!email) {
    console.error('[Webhook] order.paid sem email:', pagarmeOrderId)
    return
  }

  console.log('[Webhook] 💰 Pedido PAGO:', { pagarmeOrderId, localOrderId, email, planoSlug, chargeId })

  // Atualizar pedido local para paid (se tiver local_order_id no metadata)
  if (localOrderId) {
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        status: 'paid',
        pagarme_charge_id: chargeId,
        webhook_recebido_em: new Date().toISOString(),
      })
      .eq('codigo', localOrderId)

    if (updateError) {
      console.error('[Webhook] Erro ao atualizar pedido local:', updateError.message)
    } else {
      console.log('[Webhook] Pedido local atualizado para paid:', localOrderId)
    }
  } else {
    // Fallback: buscar por pagarme_order_id se não tiver local_order_id
    await supabase
      .from('pedidos')
      .update({
        status: 'paid',
        pagarme_charge_id: chargeId,
        webhook_recebido_em: new Date().toISOString(),
      })
      .eq('pagarme_order_id', pagarmeOrderId)
  }

  // Disparar convite via Supabase auth
  const planoTipo = planoSlug === 'cortesia' ? 'cortesia' as const : 'pago' as const
  const result = await inviteAdmin({
    email,
    planoTipo,
    origemConvite: 'pagarme_webhook',
    pagarmeChargeId: chargeId,
  })

  if (!result.success) {
    console.error('[Webhook] Erro ao enviar convite:', result.error)
  } else {
    console.log('[Webhook] ✅ Convite enviado:', { email, userId: result.userId })

    // Marcar convite_enviado_em no pedido local
    if (localOrderId) {
      await supabase
        .from('pedidos')
        .update({ convite_enviado_em: new Date().toISOString() })
        .eq('codigo', localOrderId)
    }
  }
}

async function handlePaymentFailed(orderData: PagarmeOrderData) {
  const supabase = createAdminClient()
  const pagarmeOrderId = orderData?.id as string
  const localOrderId = (orderData?.metadata as Record<string, unknown>)?.local_order_id as string | undefined

  console.log('[Webhook] ❌ Pagamento FALHOU:', { pagarmeOrderId, email: extractCustomerEmail(orderData) })

  if (localOrderId) {
    await supabase.from('pedidos').update({ status: 'failed' }).eq('codigo', localOrderId)
  }
}

async function handleOrderCanceled(orderData: PagarmeOrderData) {
  console.log('[Webhook] 🚫 Pedido CANCELADO:', {
    orderId: orderData.id,
    email: extractCustomerEmail(orderData),
  })
}

async function handleChargePaid(chargeData: PagarmeOrderData) {
  console.log('[Webhook] 💳 Cobrança PAGA:', chargeData.id)
}

async function handleChargePending(chargeData: PagarmeOrderData) {
  console.log('[Webhook] ⏳ Cobrança PENDENTE (PIX/Boleto):', chargeData.id)
}

async function handleChargeRefunded(chargeData: PagarmeOrderData) {
  console.log('[Webhook] ↩️ Cobrança ESTORNADA:', chargeData.id)
}

async function handleChargePaymentFailed(chargeData: PagarmeOrderData) {
  console.log('[Webhook] ⚠️ Cobrança FALHOU:', chargeData.id)
}

export async function POST(request: NextRequest) {
  try {
    // Validar Basic Authentication
    const authHeader = request.headers.get('authorization')

    if (!verifyBasicAuth(authHeader)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', data: null },
        { status: 401 }
      )
    }

    // Processar evento
    const payload = await request.text()
    const event = JSON.parse(payload)

    console.log('[Webhook Pagar.me] 📥 Evento recebido:', {
      type: event.type,
      id: event.data?.id,
      timestamp: new Date().toISOString(),
    })

    // Processar eventos
    switch (event.type) {
      case 'order.paid':
        await handleOrderPaid(event.data)
        break

      case 'order.payment_failed':
        await handlePaymentFailed(event.data)
        break

      case 'order.canceled':
        await handleOrderCanceled(event.data)
        break

      case 'charge.paid':
        await handleChargePaid(event.data)
        break

      case 'charge.pending':
        await handleChargePending(event.data)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data)
        break

      case 'charge.payment_failed':
        await handleChargePaymentFailed(event.data)
        break

      default:
        console.log('[Webhook] ⚠️ Evento não tratado:', event.type)
    }

    return NextResponse.json({
      success: true,
      data: {
        received: true,
        event_type: event.type,
        processed_at: new Date().toISOString(),
      },
      error: null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('[Webhook Pagar.me] ❌ Erro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook error',
        data: { message },
      },
      { status: 400 }
    )
  }
}
