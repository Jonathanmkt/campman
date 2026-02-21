'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FeedbackModal } from '@/components/ui/feedback-modal';

interface PedidoLocal {
  codigo: string;
  email: string;
  nome: string;
  plano_nome: string;
  valor: number;
  meio_pagamento: string;
  status: string;
  convite_enviado_em: string | null;
  webhook_recebido_em: string | null;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [pedido, setPedido] = useState<PedidoLocal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const codigo = searchParams.get('order_id');
    if (!codigo) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    let tentativas = 0;
    const MAX_TENTATIVAS = 20; // 20 × 3s = 60s de polling

    async function buscarPedido() {
      try {
        const res = await fetch(`/api/pedidos/${codigo}`);
        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Pedido não encontrado');
          setLoading(false);
          return;
        }

        setPedido(data.data);
        setLoading(false);

        // Continuar polling se ainda não confirmado
        if (data.data.status === 'processing' && tentativas < MAX_TENTATIVAS) {
          tentativas++;
          setTimeout(buscarPedido, 3000);
        }
      } catch {
        setError('Erro ao carregar informações do pedido');
        setLoading(false);
      }
    }

    buscarPedido();
  }, [searchParams]);

  const isPaid = pedido?.status === 'paid';
  const isProcessing = pedido?.status === 'processing';

  // Estado: carregando pedido pela primeira vez
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl border-0 bg-white/5 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#ffda42]" />
            <p className="text-white/70 text-sm">Carregando informações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado: erro ao buscar pedido
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <FeedbackModal
          isOpen
          type="error"
          message="Não encontramos seu pedido"
          subtitle={error}
          onClose={() => { window.location.href = '/checkout'; }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      {/* Estado: aguardando webhook confirmar pagamento */}
      <FeedbackModal
        isOpen={isProcessing}
        type="processing"
        message="Aguardando confirmação..."
        subtitle="Estamos verificando seu pagamento. Isso pode levar alguns segundos."
        onClose={() => {}}
      />

      {/* Estado: pagamento confirmado — orienta a verificar o e-mail */}
      <FeedbackModal
        isOpen={isPaid}
        type="email"
        message="Pagamento confirmado!"
        subtitle={`Enviamos um convite para ${pedido?.email ?? 'seu e-mail'}. Verifique sua caixa de entrada para acessar o painel.`}
        onClose={() => {}}
      />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-xl border-0 bg-white/5 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#ffda42]" />
            <p className="text-white/70 text-sm">Carregando informações...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
