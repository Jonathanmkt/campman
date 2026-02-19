'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreditCard, Loader2, AlertTriangle, QrCode, Copy, Check, Barcode } from 'lucide-react';
import Image from 'next/image';

type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

const PLANOS = [
  { slug: 'basico', nome: 'Plano Básico', valor: 9900, descricao: 'Ideal para campanhas pequenas' },
  { slug: 'profissional', nome: 'Plano Profissional', valor: 19900, descricao: 'Recursos avançados' },
];

const PAYMENT_METHODS = [
  { id: 'credit_card' as const, label: 'Cartão', icon: CreditCard },
  { id: 'pix' as const, label: 'PIX', icon: QrCode },
  { id: 'boleto' as const, label: 'Boleto', icon: Barcode },
];

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeUrl: string; orderId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    document: '',
    plano: 'basico',
    cardNumber: '',
    cardExpirationDate: '',
    cardCvv: '',
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

      // Lógica específica por método de pagamento
      if (paymentMethod === 'credit_card') {
        await handleCreditCardPayment();
      } else if (paymentMethod === 'pix') {
        await handlePixPayment();
      } else if (paymentMethod === 'boleto') {
        await handleBoletoPayment();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      console.error('Erro:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreditCardPayment() {
    const [month, year] = formData.cardExpirationDate.split('/');
    if (!month || !year) {
      setError('Data de validade inválida');
      return;
    }

    const payload = {
      customer: {
        name: formData.name,
        email: formData.email,
        document: formData.document.replace(/\D/g, ''),
      },
      items: [
        {
          amount: planoSelecionado!.valor,
          description: planoSelecionado!.nome,
          quantity: 1,
          code: planoSelecionado!.slug,
        },
      ],
      payment_method: 'credit_card',
      card: {
        number: formData.cardNumber.replace(/\s/g, ''),
        holder_name: formData.name,
        exp_month: parseInt(month, 10),
        exp_year: parseInt(year, 10),
        cvv: formData.cardCvv,
      },
    };

    console.log('🔍 [FRONTEND] Payload enviado para API local:', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/pagarme/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = `/payment/success?order_id=${data.data.codigoPedido}`;
    } else {
      setError(data.error || 'Erro ao processar pagamento');
    }
  }

  async function handlePixPayment() {
    const payload = {
      customer: {
        name: formData.name,
        email: formData.email,
        document: formData.document.replace(/\D/g, ''),
      },
      items: [
        {
          amount: planoSelecionado!.valor,
          description: planoSelecionado!.nome,
          quantity: 1,
          code: planoSelecionado!.slug,
        },
      ],
      payment_method: 'pix',
    };

    console.log('🔍 [FRONTEND] Payload enviado (PIX):', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/pagarme/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success && data.data.pixQrCode) {
      setPixData({
        qrCode: data.data.pixQrCode,
        qrCodeUrl: data.data.pixQrCodeUrl,
        orderId: data.data.codigoPedido,
      });
      setPixModalOpen(true);
    } else {
      setError(data.error || 'Erro ao gerar PIX');
    }
  }

  async function handleBoletoPayment() {
    const payload = {
      customer: {
        name: formData.name,
        email: formData.email,
        document: formData.document.replace(/\D/g, ''),
      },
      items: [
        {
          amount: planoSelecionado!.valor,
          description: planoSelecionado!.nome,
          quantity: 1,
          code: planoSelecionado!.slug,
        },
      ],
      payment_method: 'boleto',
    };

    console.log('🔍 [FRONTEND] Payload enviado (Boleto):', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/pagarme/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success && data.data.boletoUrl) {
      window.open(data.data.boletoUrl, '_blank');
      window.location.href = `/payment/success?order_id=${data.data.codigoPedido}`;
    } else {
      setError(data.error || 'Erro ao gerar boleto');
    }
  }

  function copyPixCode() {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl h-[90vh] grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Lado Esquerdo - Arte/Produto */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 flex flex-col text-white">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Idealis Core</h1>
            <p className="text-blue-100 text-sm">
              Plataforma completa para gestão de campanhas eleitorais
            </p>
          </div>

          {planoSelecionado && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-auto">
              <h3 className="text-xl font-semibold mb-1">{planoSelecionado.nome}</h3>
              <p className="text-blue-100 text-sm mb-3">{planoSelecionado.descricao}</p>
              <div className="text-4xl font-bold">{formatCurrency(planoSelecionado.valor)}</div>
              <p className="text-xs text-blue-200 mt-1">Pagamento único</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-blue-200 mt-auto">
            <span>Powered by</span>
            <span className="font-semibold text-white">Pagar.me</span>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="p-8 flex flex-col overflow-y-auto">
          <h2 className="text-lg font-semibold mb-1">Pagamento</h2>
          <p className="text-xs text-gray-500 mb-4">Revise seus dados antes de confirmar</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-center gap-2 mb-4">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-3 flex-1">
            {/* Email separado */}
            <div>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                required
                className="h-10 text-sm border border-gray-300 rounded-md px-3"
              />
            </div>

            {/* Nome + CPF empilhados verticalmente */}
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome"
                required
                className="h-10 text-sm border-0 border-b border-gray-300 rounded-none px-3 focus-visible:ring-0"
              />
              <Input
                id="document"
                value={formData.document}
                onChange={(e) =>
                  setFormData({ ...formData, document: formatCPF(e.target.value) })
                }
                placeholder="CPF"
                maxLength={14}
                required
                className="h-10 text-sm border-0 rounded-none px-3 focus-visible:ring-0"
              />
            </div>

            {/* Método de Pagamento */}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-medium">Método de pagamento</Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        paymentMethod === method.id
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs font-medium">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campos de Cartão (condicional) */}
            {paymentMethod === 'credit_card' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Informações do cartão</Label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                      setFormData({ ...formData, cardNumber: formatted });
                    }}
                    placeholder="1234 1234 1234 1234"
                    maxLength={19}
                    required
                    className="h-10 text-sm border-0 border-b border-gray-300 rounded-none px-3 focus-visible:ring-0"
                  />
                  <div className="flex">
                    <Input
                      id="cardExpirationDate"
                      value={formData.cardExpirationDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                        setFormData({ ...formData, cardExpirationDate: formatted });
                      }}
                      placeholder="MM / YY"
                      maxLength={5}
                      required
                      className="h-10 text-sm border-0 border-r border-gray-300 rounded-none px-3 focus-visible:ring-0 flex-1"
                    />
                    <Input
                      id="cardCvv"
                      value={formData.cardCvv}
                      onChange={(e) =>
                        setFormData({ ...formData, cardCvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                      }
                      placeholder="CVC"
                      maxLength={4}
                      required
                      className="h-10 text-sm border-0 rounded-none px-3 focus-visible:ring-0 flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Pagamento */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {paymentMethod === 'credit_card' && 'Pagar com Cartão'}
                  {paymentMethod === 'pix' && 'Gerar QR Code PIX'}
                  {paymentMethod === 'boleto' && 'Gerar Boleto'}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Modal PIX */}
      <Dialog open={pixModalOpen} onOpenChange={setPixModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento via PIX</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code ou copie o código abaixo para pagar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pixData?.qrCodeUrl && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <Image
                  src={pixData.qrCodeUrl}
                  alt="QR Code PIX"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Código PIX (Copia e Cola)</Label>
              <div className="flex gap-2">
                <Input
                  value={pixData?.qrCode || ''}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPixCode}
                  className="flex-shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Após o pagamento, você receberá o convite de acesso por email
            </p>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
