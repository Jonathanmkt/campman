'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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

interface OrderStatus {
  id: string;
  status: string;
  amount: number;
  paid_at?: string;
  customer?: {
    name: string;
    email: string;
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('order_id');

    if (orderId) {
      fetch(`/api/pagarme/orders?orderId=${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrderStatus(data.data);
          } else {
            setError(data.error || 'Erro ao buscar pedido');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Erro ao buscar pedido:', err);
          setError('Erro ao carregar informações do pedido');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  }

  function formatDate(dateString?: string) {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dateString));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">
              Pagamento Realizado!
            </CardTitle>
            <CardDescription>
              Obrigado pela sua contribuição. Seu pedido foi processado com sucesso.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {orderStatus && (
              <>
                <div className="bg-muted/40 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{orderStatus.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pedido:</span>
                    <span className="font-mono text-xs">{orderStatus.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">{formatCurrency(orderStatus.amount)}</span>
                  </div>
                  {orderStatus.paid_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pago em:</span>
                      <span className="font-medium">{formatDate(orderStatus.paid_at)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-800 text-sm">
                        Verifique seu email
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Enviamos um convite para{' '}
                        <strong>{orderStatus.customer?.email}</strong> com instruções para
                        acessar o painel.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Link href="/dashboard">
                <Button className="w-full" size="lg">
                  Ir para o Dashboard
                </Button>
              </Link>
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
