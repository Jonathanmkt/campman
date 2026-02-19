import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/pedidos/[codigo]
 *
 * Consulta o status de um pedido local pelo nosso código (ped_...).
 * Usado pela página de sucesso para polling de status.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;

    if (!codigo) {
      return NextResponse.json(
        { success: false, error: 'Código do pedido obrigatório', data: null },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select('codigo, email, nome, plano_slug, plano_nome, valor, meio_pagamento, status, pagarme_order_id, convite_enviado_em, created_at, webhook_recebido_em')
      .eq('codigo', codigo)
      .single();

    if (error || !pedido) {
      return NextResponse.json(
        { success: false, error: 'Pedido não encontrado', data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pedido, error: null });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('[Pedidos] Erro inesperado:', message);
    return NextResponse.json(
      { success: false, error: 'Erro ao consultar pedido', data: null },
      { status: 500 }
    );
  }
}
