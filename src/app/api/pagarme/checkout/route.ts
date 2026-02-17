import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * POST /api/pagarme/checkout
 * 
 * Cria uma sessão de checkout na Pagar.me e retorna a URL de pagamento.
 * O cliente será redirecionado para a página de pagamento da Pagar.me.
 */

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
  })).min(1, 'Pelo menos um item é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message, data: null },
        { status: 400 }
      );
    }

    const { customer, items } = parsed.data;

    // Determinar URL pública definitiva
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error('[Pagar.me Checkout] NEXT_PUBLIC_SITE_URL não configurada');
      return NextResponse.json(
        {
          success: false,
          error: 'NEXT_PUBLIC_SITE_URL não configurada no ambiente',
          data: null,
        },
        { status: 500 }
      );
    }

    // Remover formatação do CPF
    const cleanDocument = customer.document.replace(/\D/g, '');

    // Montar payload Pagar.me
    const pagarmeOrder = {
      customer: {
        name: customer.name,
        email: customer.email,
        document: cleanDocument,
        type: 'individual',
        document_type: 'CPF',
      },
      items: items.map((item) => ({
        amount: item.amount,
        description: item.description,
        quantity: item.quantity,
      })),
      payments: [
        {
          payment_method: 'checkout',
          checkout: {
            expires_in: 1800, // 30 minutos
            billing_address_editable: false,
            customer_editable: true,
            accepted_payment_methods: ['credit_card', 'debit_card', 'pix', 'boleto'],
            success_url: `${siteUrl}/payment/success`,
            skip_checkout_success_page: false,
            pix: {
              expires_in: 3600, // 1 hora para PIX
            },
            boleto: {
              bank: '001', // Banco do Brasil
              instructions: 'Pagar até o vencimento',
              due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
            },
          },
        },
      ],
    };

    console.log('[Pagar.me Checkout] Criando pedido:', {
      customer: customer.email,
      items: items.length,
    });

    // Chamar API Pagar.me
    // IMPORTANTE: Pagar.me usa Basic Auth com secret_key como user e senha vazia
    const authToken = Buffer.from(`${process.env.PAGARME_SECRET_KEY}:`).toString('base64');
    
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authToken}`,
      },
      body: JSON.stringify(pagarmeOrder),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Pagar.me Checkout] Erro completo:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: data.message || 'Erro ao criar checkout',
          data: data,
        },
        { status: response.status }
      );
    }

    console.log('[Pagar.me Checkout] Pedido criado:', {
      orderId: data.id,
      checkoutUrl: data.checkouts?.[0]?.payment_url,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutUrl: data.checkouts[0].payment_url,
        orderId: data.id,
        expiresAt: data.checkouts[0].expires_at,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('[Pagar.me Checkout] Erro inesperado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar checkout',
        data: { message: error.message },
      },
      { status: 500 }
    );
  }
}
