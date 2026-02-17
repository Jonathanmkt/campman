import { inviteAdmin } from '@/lib/services/invite-admin'
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

/**
 * Extrai email do payload Pagar.me (customer.email)
 */
function extractCustomerEmail(orderData: any): string | null {
  return orderData?.customer?.email || null
}

/**
 * Extrai plano do primeiro item (items[0].description ou items[0].id)
 */
function extractPlanSlug(orderData: any): string {
  const firstItem = orderData?.items?.[0]
  if (!firstItem) return 'basico' // fallback

  // Tentar extrair do ID ou description
  const itemId = firstItem.id?.toLowerCase() || ''
  const itemDesc = firstItem.description?.toLowerCase() || ''

  if (itemId.includes('profissional') || itemDesc.includes('profissional')) {
    return 'profissional'
  }
  if (itemId.includes('cortesia') || itemDesc.includes('cortesia')) {
    return 'cortesia'
  }

  return 'basico' // padrão
}

/**
 * Handler para evento order.paid
 */
async function handleOrderPaid(orderData: any) {
  const email = extractCustomerEmail(orderData)
  const planoSlug = extractPlanSlug(orderData)
  const chargeId = orderData?.charges?.[0]?.id || orderData?.id

  if (!email) {
    console.error('[Webhook] order.paid sem email:', orderData.id)
    return
  }

  console.log('[Webhook] 💰 Pedido PAGO:', {
    orderId: orderData.id,
    email,
    planoSlug,
    chargeId,
  })

  // Determinar tipo do plano
  const planoTipo = planoSlug === 'cortesia' ? 'cortesia' as const : 'pago' as const

  // Disparar convite
  const result = await inviteAdmin({
    email,
    planoTipo,
    origemConvite: 'pagarme_webhook',
    pagarmeChargeId: chargeId,
  })

  if (!result.success) {
    console.error('[Webhook] Erro ao enviar convite:', result.error)
  } else {
    console.log('[Webhook] Convite enviado:', { email, userId: result.userId })
  }
}

/**
 * Handler para evento order.payment_failed
 */
async function handlePaymentFailed(orderData: any) {
  console.log('[Webhook] ❌ Pagamento FALHOU:', {
    orderId: orderData.id,
    email: extractCustomerEmail(orderData),
  })
  // TODO: Notificar usuário, registrar no banco
}

/**
 * Handler para evento order.canceled
 */
async function handleOrderCanceled(orderData: any) {
  console.log('[Webhook] 🚫 Pedido CANCELADO:', {
    orderId: orderData.id,
    email: extractCustomerEmail(orderData),
  })
}

/**
 * Handler para evento charge.paid
 */
async function handleChargePaid(chargeData: any) {
  console.log('[Webhook] 💳 Cobrança PAGA:', chargeData.id)
}

/**
 * Handler para evento charge.pending (PIX/Boleto)
 */
async function handleChargePending(chargeData: any) {
  console.log('[Webhook] ⏳ Cobrança PENDENTE (PIX/Boleto):', chargeData.id)
}

/**
 * Handler para evento charge.refunded
 */
async function handleChargeRefunded(chargeData: any) {
  console.log('[Webhook] ↩️ Cobrança ESTORNADA:', chargeData.id)
}

/**
 * Handler para evento charge.payment_failed
 */
async function handleChargePaymentFailed(chargeData: any) {
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
  } catch (error: any) {
    console.error('[Webhook Pagar.me] ❌ Erro:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Webhook error',
        data: { message: error.message },
      },
      { status: 400 }
    )
  }
}
