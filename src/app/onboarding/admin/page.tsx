'use client';

import React from 'react';
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
import { Check, ChevronLeft, ChevronRight, AlertTriangle, Loader2, Lock } from 'lucide-react';
import {
    useOnboardingAdmin,
    UF_LIST,
    UF_NAMES,
    CARGOS,
    TOTAL_STEPS,
} from './hooks/useOnboardingAdmin';

export default function OnboardingAdminPage() {
    const {
        currentStep,
        formData,
        isInvitedUser,
        ufConfirmed,
        isMunicipal,
        error,
        isSubmitting,
        isLoadingMetadata,
        updateField,
        setUfConfirmed,
        handleNext,
        handlePrev,
        isStepValid,
        handleSubmit,
        planoLabel,
    } = useOnboardingAdmin();

    if (isLoadingMetadata) {
        return (
            <Card className="shadow-xl border-0">
                <CardContent className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    /** Step mínimo visível (se não veio de convite, step 1 é pulado) */
    const minStep = isInvitedUser ? 1 : 2;

    return (
        <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Configurar Campanha</CardTitle>
                <CardDescription>
                    Etapa {currentStep - minStep + 1} de {TOTAL_STEPS - minStep + 1} — Configure os dados da sua campanha
                </CardDescription>

                {/* Progress bar */}
                <div className="flex gap-2 mt-4">
                    {Array.from({ length: TOTAL_STEPS - minStep + 1 }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${i + minStep <= currentStep ? 'bg-primary' : 'bg-muted'}`}
                        />
                    ))}
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* ── Step 1: Definição de senha (só se veio de convite) ── */}
                {currentStep === 1 && isInvitedUser && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-blue-800">Defina sua senha de acesso</p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Você foi convidado para o Idealis Core. Crie uma senha para acessar o painel.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Senha *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repita a senha"
                                value={formData.confirmPassword}
                                onChange={(e) => updateField('confirmPassword', e.target.value)}
                            />
                            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                <p className="text-xs text-destructive">As senhas não coincidem.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Step 2: Dados da campanha ── */}
                {currentStep === 2 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nomeCampanha">Nome da Campanha *</Label>
                            <Input
                                id="nomeCampanha"
                                placeholder="Ex: Campanha João Silva 2026"
                                value={formData.nomeCampanha}
                                onChange={(e) => updateField('nomeCampanha', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nomeCandidato">Nome do Candidato *</Label>
                            <Input
                                id="nomeCandidato"
                                placeholder="Ex: João da Silva"
                                value={formData.nomeCandidato}
                                onChange={(e) => updateField('nomeCandidato', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cargoPretendido">Cargo Pretendido *</Label>
                            <Select
                                value={formData.cargoPretendido}
                                onValueChange={(v) => updateField('cargoPretendido', v)}
                            >
                                <SelectTrigger id="cargoPretendido">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CARGOS.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="partido">Partido</Label>
                                <Input
                                    id="partido"
                                    placeholder="Ex: PSD"
                                    value={formData.partido}
                                    onChange={(e) => updateField('partido', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="numeroCandidato">Número do Candidato</Label>
                                <Input
                                    id="numeroCandidato"
                                    placeholder="Ex: 55123"
                                    value={formData.numeroCandidato}
                                    onChange={(e) => updateField('numeroCandidato', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Estado (UF) — IRREVERSÍVEL ── */}
                {currentStep === 3 && (
                    <div className="space-y-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-amber-800">Atenção: escolha irreversível</p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        O estado selecionado <strong>não poderá ser alterado</strong> depois.
                                        Ele define a região geográfica da campanha, impactando áreas,
                                        coordenadores e o mapa.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="uf">Estado (UF) *</Label>
                            <Select
                                value={formData.uf}
                                onValueChange={(v) => {
                                    updateField('uf', v);
                                    setUfConfirmed(false);
                                }}
                            >
                                <SelectTrigger id="uf">
                                    <SelectValue placeholder="Selecione o estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {UF_LIST.map((uf) => (
                                        <SelectItem key={uf} value={uf}>
                                            {uf} — {UF_NAMES[uf]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.uf && !ufConfirmed && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 mb-3">
                                    Confirma que a campanha será no estado de <strong>{UF_NAMES[formData.uf]} ({formData.uf})</strong>?
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => setUfConfirmed(true)}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    Sim, confirmo
                                </Button>
                            </div>
                        )}

                        {ufConfirmed && (
                            <p className="text-sm text-green-700 flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Estado confirmado: <strong>{UF_NAMES[formData.uf]}</strong>
                            </p>
                        )}

                        {isMunicipal && (
                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade *</Label>
                                <Input
                                    id="cidade"
                                    placeholder="Ex: São Paulo"
                                    value={formData.cidade}
                                    onChange={(e) => updateField('cidade', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Obrigatório para cargos municipais (vereador/prefeito).
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Step 4: Tema de cores (Placeholder — Etapa 2.2) ── */}
                {currentStep === 4 && (
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-6 text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎨</span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Personalização Visual</h3>
                            <p className="text-muted-foreground text-sm">
                                Em breve você poderá escolher o tema de cores da sua campanha.
                                Por enquanto, será usado o tema padrão (azul institucional).
                            </p>
                            <p className="text-xs text-muted-foreground mt-3">
                                Essa funcionalidade será habilitada na próxima atualização.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Step 5: Confirmação ── */}
                {currentStep === 5 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Confirme os dados da campanha</h3>

                        <div className="bg-muted/30 rounded-lg divide-y">
                            <div className="flex justify-between p-3">
                                <span className="text-muted-foreground text-sm">Campanha</span>
                                <span className="font-medium text-sm">{formData.nomeCampanha}</span>
                            </div>
                            <div className="flex justify-between p-3">
                                <span className="text-muted-foreground text-sm">Candidato</span>
                                <span className="font-medium text-sm">{formData.nomeCandidato}</span>
                            </div>
                            <div className="flex justify-between p-3">
                                <span className="text-muted-foreground text-sm">Cargo</span>
                                <span className="font-medium text-sm">
                                    {CARGOS.find((c) => c.value === formData.cargoPretendido)?.label}
                                </span>
                            </div>
                            {formData.partido && (
                                <div className="flex justify-between p-3">
                                    <span className="text-muted-foreground text-sm">Partido</span>
                                    <span className="font-medium text-sm">{formData.partido}</span>
                                </div>
                            )}
                            {formData.numeroCandidato && (
                                <div className="flex justify-between p-3">
                                    <span className="text-muted-foreground text-sm">Número</span>
                                    <span className="font-medium text-sm">{formData.numeroCandidato}</span>
                                </div>
                            )}
                            <div className="flex justify-between p-3">
                                <span className="text-muted-foreground text-sm">Estado</span>
                                <span className="font-medium text-sm">
                                    {UF_NAMES[formData.uf]} ({formData.uf})
                                </span>
                            </div>
                            {isMunicipal && formData.cidade && (
                                <div className="flex justify-between p-3">
                                    <span className="text-muted-foreground text-sm">Cidade</span>
                                    <span className="font-medium text-sm">{formData.cidade}</span>
                                </div>
                            )}
                            <div className="flex justify-between p-3">
                                <span className="text-muted-foreground text-sm">Plano</span>
                                <span className="font-medium text-sm">{planoLabel}</span>
                            </div>
                            <div className="flex justify-between p-3">
                                <span className="text-muted-foreground text-sm">Tema</span>
                                <span className="font-medium text-sm">Azul (padrão)</span>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-700">
                                Após criar, o <strong>estado ({formData.uf})</strong> não poderá ser alterado.
                                Os demais dados podem ser editados em Configurações.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Botões de navegação ── */}
                <div className="flex justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep <= minStep}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Voltar
                    </Button>

                    {currentStep < TOTAL_STEPS ? (
                        <Button onClick={handleNext} disabled={!isStepValid(currentStep)}>
                            Avançar
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-1" />
                                    Criar Campanha
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
