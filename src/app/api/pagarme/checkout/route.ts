import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/pagarme/checkout
 *
 * Fluxo race-condition-safe:
 * 1. Gera código local (ped_...)
 * 2. Insere pedido no Supabase com status=pending ANTES de chamar a Pagar.me
 * 3. Envia para Pagar.me com local_order_id no metadata
 * 4. Atualiza pedido com pagarme_order_id
 * 5. Webhook order.paid atualiza para paid e envia convite
 */

const cardSchema = z.object({
  number: z.string().min(13, 'Número do cartão obrigatório'),
  holder_name: z.string().min(1, 'Nome no cartão obrigatório'),
  exp_month: z.number().min(1).max(12),
  exp_year: z.number().min(25),
  cvv: z.string().min(3, 'CVV obrigatório'),
});

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    document: z.string().min(11, 'CPF obrigatório'),
  }),
  items: z.array(z.object({
    amount: z.number().positive('Valor deve ser positivo'),
    description: z.string().min(1, 'Descrição obrigatória'),
    quantity: z.number().positive().default(1),
    code: z.string().optional().default('plano'),
  })).min(1, 'Pelo menos um item é obrigatório'),
  payment_method: z.enum(['credit_card', 'pix', 'boleto']).optional().default('credit_card'),
  card: cardSchema.optional(),
});

function gerarCodigoPedido(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ped_${timestamp}_${random}`;
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message, data: null },
        { status: 400 }
      );
    }

    const { customer, items, payment_method, card } = parsed.data;

    if (payment_method === 'credit_card' && !card) {
      return NextResponse.json(
        { success: false, error: 'Dados do cartão obrigatórios para pagamento com cartão', data: null },
        { status: 400 }
      );
    }

    const cleanDocument = customer.document.replace(/\D/g, '');
    const firstItem = items[0];
    const codigoPedido = gerarCodigoPedido();

    // PASSO 1: Inserir pedido local com status=pending ANTES de qualquer chamada à Pagar.me
    const { error: insertError } = await supabase.from('pedidos').insert({
      codigo: codigoPedido,
      email: customer.email,
      nome: customer.name,
      documento: cleanDocument,
      plano_slug: firstItem.code || 'basico',
      plano_nome: firstItem.description,
      valor: firstItem.amount / 100,
      meio_pagamento: payment_method === 'credit_card' ? 'cartao_credito' : payment_method,
      status: 'pending',
    });

    if (insertError) {
      console.error('[Checkout] Erro ao criar pedido local:', insertError.message);
      return NextResponse.json(
        { success: false, error: 'Erro ao iniciar pedido. Tente novamente.', data: null },
        { status: 500 }
      );
    }

    console.log('[Checkout] Pedido local criado:', codigoPedido);

    // PASSO 2: Montar payload Pagar.me com nosso código no metadata
    const pagarmeOrder: Record<string, unknown> = {
      customer: {
        name: customer.name,
        email: customer.email,
        document: cleanDocument,
        type: 'individual',
        document_type: 'CPF',
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: '11',
            number: '999999999',
          },
        },
      },
      items: items.map((item) => ({
        amount: item.amount,
        description: item.description,
        quantity: item.quantity,
        code: item.code || 'plano',
      })),
      metadata: {
        origin: 'public_checkout',
        local_order_id: codigoPedido,
        target_email: customer.email,
        payment_method: payment_method,
      },
    };

    if (payment_method === 'credit_card' && card) {
      pagarmeOrder.payments = [{
        payment_method: 'credit_card',
        credit_card: {
          installments: 1,
          statement_descriptor: 'IDEALISCORE',
          card: {
            number: card.number.replace(/\s/g, ''),
            holder_name: card.holder_name,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
            cvv: card.cvv,
            billing_address: {
              line_1: '1, Rua Teste, Centro',
              zip_code: '01001000',
              city: 'São Paulo',
              state: 'SP',
              country: 'BR',
            },
          },
        },
      }];
    } else if (payment_method === 'pix') {
      pagarmeOrder.payments = [{ payment_method: 'pix', pix: { expires_in: 3600 } }];
    } else if (payment_method === 'boleto') {
      pagarmeOrder.payments = [{
        payment_method: 'boleto',
        boleto: {
          instructions: 'Pagar até o vencimento',
          due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          document_number: '123456',
          type: 'DM',
        },
      }];
    }

    console.log('🔍 [BACKEND] Payload enviado para Pagar.me:', JSON.stringify(pagarmeOrder, null, 2));

    // PASSO 3: Enviar para Pagar.me
    const authToken = Buffer.from(`${process.env.PAGARME_SECRET_KEY}:`).toString('base64');
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${authToken}` },
      body: JSON.stringify(pagarmeOrder),
    });

    const data = await response.json();
    console.log('🔍 [BACKEND] Resposta completa da Pagar.me:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      // Marcar pedido como failed se Pagar.me retornar erro
      await supabase.from('pedidos')
        .update({ status: 'failed', pagarme_data: data })
        .eq('codigo', codigoPedido);

      return NextResponse.json(
        { success: false, error: data.message || 'Erro ao criar pedido', data: null },
        { status: response.status }
      );
    }

    const charge = data.charges?.[0];
    const tx = charge?.last_transaction;

    if (data.status === 'failed' || charge?.status === 'failed') {
      const gatewayErrors = tx?.gateway_response?.errors || [];
      const errorMsg = gatewayErrors[0]?.message || tx?.acquirer_message || 'Transação recusada';

      await supabase.from('pedidos')
        .update({ status: 'failed', pagarme_order_id: data.id, pagarme_data: data })
        .eq('codigo', codigoPedido);

      return NextResponse.json(
        { success: false, error: errorMsg, data: null },
        { status: 422 }
      );
    }

    // PASSO 4: Atualizar pedido com pagarme_order_id (status ainda pending — webhook confirmará)
    await supabase.from('pedidos')
      .update({
        status: 'processing',
        pagarme_order_id: data.id,
        pagarme_charge_id: charge?.id || null,
        pagarme_data: data,
      })
      .eq('codigo', codigoPedido);

    console.log('[Checkout] Pedido atualizado para processing:', {
      codigo: codigoPedido,
      pagarme_order_id: data.id,
      status: data.status,
    });

    // Montar resposta para o frontend — usa nosso código como referência
    const responseData: Record<string, unknown> = {
      codigoPedido,
      pagarmeOrderId: data.id,
      status: data.status,
    };

    if (payment_method === 'pix' && tx) {
      responseData.pixQrCode = tx.qr_code;
      responseData.pixQrCodeUrl = tx.qr_code_url;
    }

    if (payment_method === 'boleto' && tx) {
      responseData.boletoUrl = tx.url;
      responseData.boletoBarcode = tx.barcode;
      responseData.boletoDueAt = tx.due_at;
    }

    return NextResponse.json({ success: true, data: responseData, error: null });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[Checkout] Erro inesperado:', message);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar checkout', data: null },
      { status: 500 }
    );
  }
}
