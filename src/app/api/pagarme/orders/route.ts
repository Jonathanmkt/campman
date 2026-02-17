import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/pagarme/orders?orderId=xxx
 * 
 * Consulta o status de um pedido na Pagar.me.
 * Usado para verificar se o pagamento foi confirmado.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId é obrigatório', data: null },
        { status: 400 }
      );
    }

    console.log('[Pagar.me Orders] Consultando pedido:', orderId);

    const response = await fetch(
      `https://api.pagar.me/core/v5/orders/${orderId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PAGARME_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[Pagar.me Orders] Erro ao consultar:', data);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao consultar pedido',
          data: { details: data },
        },
        { status: response.status }
      );
    }

    console.log('[Pagar.me Orders] Pedido encontrado:', {
      id: data.id,
      status: data.status,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        status: data.status,
        amount: data.amount,
        paid_at: data.paid_at,
        customer: data.customer,
        items: data.items,
        charges: data.charges,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('[Pagar.me Orders] Erro inesperado:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao consultar pedido',
        data: { message: error.message },
      },
      { status: 500 }
    );
  }
}
