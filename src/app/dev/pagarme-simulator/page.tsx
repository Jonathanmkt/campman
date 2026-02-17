'use client';

import React, { useState } from 'react';
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
import { AlertTriangle, CreditCard, Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Página de simulação de webhook Pagar.me — APENAS DESENVOLVIMENTO.
 *
 * Simula o payload que o Pagar.me enviaria ao endpoint /api/webhooks/pagarme
 * após um pagamento aprovado. Permite testar o fluxo completo:
 * pagamento → webhook → convite → email → onboarding.
 */

const PLANOS_DISPONIVEIS = [
    { slug: 'cortesia', label: 'Cortesia Idealis (gratuito)' },
    { slug: 'basico', label: 'Básico' },
    { slug: 'profissional', label: 'Profissional' },
];

interface SimulationResult {
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
}

export default function PagarmeSimulatorPage() {
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [planoSlug, setPlanoSlug] = useState('basico');
    const [valor, setValor] = useState('9900');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<SimulationResult | null>(null);

    // Bloqueia em produção
    if (process.env.NODE_ENV === 'production') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <p className="font-semibold text-lg">Página indisponível</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Este simulador só funciona em ambiente de desenvolvimento.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSimulate = async () => {
        setIsSubmitting(true);
        setResult(null);

        try {
            // Gerar IDs fictícios simulando Pagar.me
            const timestamp = Date.now();
            const chargeId = `sim_ch_${timestamp}`;
            const subscriptionId = `sim_sub_${timestamp}`;

            const payload = {
                email,
                nome,
                valor: Number(valor),
                charge_id: chargeId,
                subscription_id: subscriptionId,
                plano_slug: planoSlug,
            };

            console.log('[Pagar.me Simulator] Enviando payload:', payload);

            const response = await fetch('/api/webhooks/pagarme', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    success: true,
                    message: `Convite enviado para ${email}. O usuário receberá um email com link de aceite.`,
                    data,
                });
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Erro desconhecido ao processar webhook.',
                    data,
                });
            }
        } catch (err) {
            console.error('[Pagar.me Simulator] Erro:', err);
            setResult({
                success: false,
                message: 'Erro de rede ao chamar o webhook.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = email.trim() && nome.trim() && planoSlug && Number(valor) > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg space-y-4">
                {/* Banner dev-only */}
                <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-700 flex-shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        Simulador Pagar.me — apenas desenvolvimento. Não disponível em produção.
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="text-center pb-2">
                        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CreditCard className="h-7 w-7 text-orange-600" />
                        </div>
                        <CardTitle className="text-xl font-bold">Simular Pagamento Pagar.me</CardTitle>
                        <CardDescription>
                            Preencha os campos abaixo para simular um webhook de pagamento aprovado.
                            Isso disparará um convite de admin via Supabase.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email do cliente *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="cliente@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                O convite será enviado para este email.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do cliente *</Label>
                            <Input
                                id="nome"
                                placeholder="João da Silva"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="plano">Plano contratado *</Label>
                            <Select value={planoSlug} onValueChange={setPlanoSlug}>
                                <SelectTrigger id="plano">
                                    <SelectValue placeholder="Selecione o plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PLANOS_DISPONIVEIS.map((p) => (
                                        <SelectItem key={p.slug} value={p.slug}>
                                            {p.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor (centavos) *</Label>
                            <Input
                                id="valor"
                                type="number"
                                placeholder="9900 = R$ 99,00"
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Valor em centavos (ex: 9900 = R$ 99,00). Padrão Pagar.me.
                            </p>
                        </div>

                        {/* Campos auto-gerados (read-only info) */}
                        <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Campos auto-gerados na simulação:</p>
                            <p className="text-xs text-muted-foreground">charge_id: <code>sim_ch_[timestamp]</code></p>
                            <p className="text-xs text-muted-foreground">subscription_id: <code>sim_sub_[timestamp]</code></p>
                        </div>

                        <Button
                            className="w-full"
                            onClick={handleSimulate}
                            disabled={!isFormValid || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Simulando pagamento...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Efetuar Pagamento (simulação)
                                </>
                            )}
                        </Button>

                        {/* Resultado */}
                        {result && (
                            <div className={`rounded-lg p-4 flex items-start gap-3 ${
                                result.success
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                {result.success ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                        {result.success ? 'Sucesso!' : 'Erro'}
                                    </p>
                                    <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {result.message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
