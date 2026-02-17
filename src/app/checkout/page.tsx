'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CreditCard, Loader2, AlertTriangle } from 'lucide-react';

const PLANOS = [
  { slug: 'basico', nome: 'Plano Básico', valor: 9900, descricao: 'Ideal para campanhas pequenas' },
  { slug: 'profissional', nome: 'Plano Profissional', valor: 19900, descricao: 'Recursos avançados' },
];

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    plano: 'basico',
  });

  const planoSelecionado = PLANOS.find((p) => p.slug === formData.plano);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!planoSelecionado) {
        setError('Plano não encontrado');
        return;
      }

      const response = await fetch('/api/pagarme/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            document: formData.document.replace(/\D/g, ''),
          },
          items: [
            {
              amount: planoSelecionado.valor,
              description: planoSelecionado.nome,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setError(data.error || 'Erro ao criar checkout');
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(cents: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  }

  function formatCPF(value: string) {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      return [match[1], match[2], match[3], match[4]].filter(Boolean).join('.');
    }
    return value;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Checkout Idealis Core</CardTitle>
            <CardDescription>
              Escolha seu plano e preencha os dados para continuar
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plano">Plano *</Label>
                <Select
                  value={formData.plano}
                  onValueChange={(v) => setFormData({ ...formData, plano: v })}
                >
                  <SelectTrigger id="plano">
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLANOS.map((p) => (
                      <SelectItem key={p.slug} value={p.slug}>
                        {p.nome} - {formatCurrency(p.valor)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {planoSelecionado && (
                  <p className="text-xs text-muted-foreground">
                    {planoSelecionado.descricao}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="João da Silva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Você receberá o convite de acesso neste email após o pagamento.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">CPF *</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) =>
                    setFormData({ ...formData, document: formatCPF(e.target.value) })
                  }
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>

              {planoSelecionado && (
                <div className="bg-muted/40 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total a pagar:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(planoSelecionado.valor)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Pagamento único. Você será redirecionado para a página segura da Pagar.me.
                  </p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Ir para Pagamento
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
