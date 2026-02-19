'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';

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

  function formatCurrency(valor: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }

  function labelMeioPagamento(meio: string) {
    const labels: Record<string, string> = {
      cartao_credito: 'Cartão de Crédito',
      pix: 'PIX',
      boleto: 'Boleto',
    };
    return labels[meio] || meio;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando informações...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/checkout">
              <Button>Voltar ao Checkout</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPaid = pedido?.status === 'paid';
  const isProcessing = pedido?.status === 'processing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isPaid ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {isPaid
                ? <CheckCircle2 className="h-10 w-10 text-green-600" />
                : <Loader2 className="h-10 w-10 text-yellow-600 animate-spin" />
              }
            </div>
            <CardTitle className={`text-2xl font-bold ${isPaid ? 'text-green-700' : 'text-yellow-700'}`}>
              {isPaid ? 'Pagamento Confirmado!' : 'Aguardando Confirmação...'}
            </CardTitle>
            <CardDescription>
              {isPaid
                ? 'Seu pagamento foi processado com sucesso.'
                : 'Estamos aguardando a confirmação do seu pagamento.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {pedido && (
              <>
                <div className="bg-muted/40 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pedido:</span>
                    <span className="font-mono text-xs">{pedido.codigo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano:</span>
                    <span className="font-medium">{pedido.plano_nome}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">{formatCurrency(pedido.valor)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <span className="font-medium">{labelMeioPagamento(pedido.meio_pagamento)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isPaid ? 'Pago' : isProcessing ? 'Processando...' : pedido.status}
                    </span>
                  </div>
                </div>

                {isPaid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-blue-800 text-sm">
                          Verifique seu email
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          Enviamos um convite para <strong>{pedido.email}</strong> com
                          instruções para acessar o painel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 text-center">
                    Verificando confirmação do pagamento automaticamente...
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              {isPaid && (
                <Link href="/dashboard">
                  <Button className="w-full" size="lg">
                    Ir para o Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/checkout">
                <Button variant="outline" className="w-full">
                  Fazer outro pagamento
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando informações...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
