'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
import { Check, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';

/** Lista de UFs brasileiras */
const UF_LIST = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'PR',
    'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

/** Nomes completos dos estados */
const UF_NAMES: Record<string, string> = {
    AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
    BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
    GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
    MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
    PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina',
    SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

const CARGOS = [
    { value: 'deputado_estadual', label: 'Deputado Estadual' },
    { value: 'deputado_federal', label: 'Deputado Federal' },
    { value: 'vereador', label: 'Vereador' },
    { value: 'prefeito', label: 'Prefeito' },
    { value: 'senador', label: 'Senador' },
    { value: 'governador', label: 'Governador' },
];

const CARGOS_MUNICIPAIS = ['vereador', 'prefeito'];

const TOTAL_STEPS = 4;

interface FormData {
    nomeCampanha: string;
    nomeCandidato: string;
    cargoPretendido: string;
    partido: string;
    numeroCandidato: string;
    uf: string;
    cidade: string;
}

export default function OnboardingAdminPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ufConfirmed, setUfConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<FormData>({
        nomeCampanha: '',
        nomeCandidato: '',
        cargoPretendido: '',
        partido: '',
        numeroCandidato: '',
        uf: '',
        cidade: '',
    });

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setError(null);
    };

    const isMunicipal = CARGOS_MUNICIPAIS.includes(formData.cargoPretendido);

    /** Validação por step */
    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(
                    formData.nomeCampanha.trim() &&
                    formData.nomeCandidato.trim() &&
                    formData.cargoPretendido
                );
            case 2:
                return !!(formData.uf && ufConfirmed && (!isMunicipal || formData.cidade.trim()));
            case 3:
                // Tema de cores é placeholder (Etapa 2.2)
                return true;
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS && isStepValid(currentStep)) {
            setCurrentStep((s) => s + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep((s) => s - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setError('Sessão expirada. Faça login novamente.');
                return;
            }

            // 1. Criar a campanha
            const { data: campanha, error: campanhaError } = await supabase
                .from('campanha')
                .insert({
                    nome: formData.nomeCampanha.trim(),
                    nome_candidato: formData.nomeCandidato.trim(),
                    cargo_pretendido: formData.cargoPretendido,
                    partido: formData.partido.trim() || null,
                    numero_candidato: formData.numeroCandidato.trim() || null,
                    uf: formData.uf,
                    cidade: isMunicipal ? formData.cidade.trim() : null,
                    status: 'ativa',
                })
                .select('id')
                .single();

            if (campanhaError || !campanha) {
                console.error('Erro ao criar campanha:', campanhaError);
                setError(campanhaError?.message ?? 'Erro ao criar campanha');
                return;
            }

            // 2. Criar vínculo como admin na campanha_membro
            const { error: membroError } = await supabase.from('campanha_membro').insert({
                campanha_id: campanha.id,
                profile_id: user.id,
                role: 'admin',
                status: 'ativo',
            });

            if (membroError) {
                console.error('Erro ao criar membro:', membroError);
                setError(membroError.message);
                return;
            }

            // 3. Atualizar profile com campanha_id e role admin
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    campanha_id: campanha.id,
                    roles: ['admin'],
                })
                .eq('id', user.id);

            if (profileError) {
                console.error('Erro ao atualizar perfil:', profileError);
                setError(profileError.message);
                return;
            }

            // Redirecionar para o dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('Erro no onboarding:', err);
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">Configurar Campanha</CardTitle>
                <CardDescription>
                    Etapa {currentStep} de {TOTAL_STEPS} — Configure os dados da sua campanha
                </CardDescription>

                {/* Progress bar */}
                <div className="flex gap-2 mt-4">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                                }`}
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

                {/* ── Step 1: Dados da campanha ── */}
                {currentStep === 1 && (
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

                {/* ── Step 2: Estado (UF) — IRREVERSÍVEL ── */}
                {currentStep === 2 && (
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

                {/* ── Step 3: Tema de cores (Placeholder — Etapa 2.2) ── */}
                {currentStep === 3 && (
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

                {/* ── Step 4: Confirmação ── */}
                {currentStep === 4 && (
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
                                <span className="text-muted-foreground text-sm">Tema</span>
                                <span className="font-medium text-sm">Azul (padrão)</span>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-700">
                                ⚠️ Após criar, o <strong>estado ({formData.uf})</strong> não poderá ser alterado.
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
                        disabled={currentStep === 1}
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
