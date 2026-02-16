'use client';

import React, { useState, useEffect } from 'react';
import { useCampanha } from '@/hooks/useCampanha';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
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
import { Separator } from '@/components/ui/separator';
import { Save, Loader2, CheckCircle, Lock, AlertTriangle } from 'lucide-react';

const CARGOS = [
    { value: 'deputado_estadual', label: 'Deputado Estadual' },
    { value: 'deputado_federal', label: 'Deputado Federal' },
    { value: 'vereador', label: 'Vereador' },
    { value: 'prefeito', label: 'Prefeito' },
    { value: 'senador', label: 'Senador' },
    { value: 'governador', label: 'Governador' },
];

const UF_NAMES: Record<string, string> = {
    AC: 'Acre', AL: 'Alagoas', AM: 'Amazonas', AP: 'Amapá',
    BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
    GO: 'Goiás', MA: 'Maranhão', MG: 'Minas Gerais', MS: 'Mato Grosso do Sul',
    MT: 'Mato Grosso', PA: 'Pará', PB: 'Paraíba', PE: 'Pernambuco',
    PI: 'Piauí', PR: 'Paraná', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
    RO: 'Rondônia', RR: 'Roraima', RS: 'Rio Grande do Sul', SC: 'Santa Catarina',
    SE: 'Sergipe', SP: 'São Paulo', TO: 'Tocantins',
};

const CARGOS_MUNICIPAIS = ['vereador', 'prefeito'];

export default function ConfiguracoesPage() {
    const { data: userCampanha, isLoading } = useCampanha();
    const queryClient = useQueryClient();

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [nome, setNome] = useState('');
    const [nomeCandidato, setNomeCandidato] = useState('');
    const [cargoPretendido, setCargoPretendido] = useState('');
    const [partido, setPartido] = useState('');
    const [numeroCandidato, setNumeroCandidato] = useState('');
    const [cidade, setCidade] = useState('');

    const campanha = userCampanha?.campanha;
    const isMunicipal = CARGOS_MUNICIPAIS.includes(cargoPretendido);

    // Preencher campos quando dados da campanha carregam
    useEffect(() => {
        if (campanha) {
            setNome(campanha.nome ?? '');
            setNomeCandidato(campanha.nome_candidato ?? '');
            setCargoPretendido(campanha.cargo_pretendido ?? '');
            setPartido(campanha.partido ?? '');
            setNumeroCandidato(campanha.numero_candidato ?? '');
            setCidade(campanha.cidade ?? '');
        }
    }, [campanha]);

    const handleSave = async () => {
        if (!campanha?.id) return;

        setIsSaving(true);
        setError(null);
        setSaved(false);

        try {
            const supabase = createClient();

            const { error: updateError } = await supabase
                .from('campanha')
                .update({
                    nome: nome.trim(),
                    nome_candidato: nomeCandidato.trim(),
                    cargo_pretendido: cargoPretendido,
                    partido: partido.trim() || null,
                    numero_candidato: numeroCandidato.trim() || null,
                    cidade: isMunicipal ? cidade.trim() : null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', campanha.id);

            if (updateError) {
                setError(updateError.message);
                return;
            }

            // Invalidar cache para que Sidebar e demais componentes peguem os dados novos
            queryClient.invalidateQueries({ queryKey: ['user-campanha'] });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Erro ao salvar:', err);
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!campanha) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Nenhuma campanha encontrada.</p>
            </div>
        );
    }

    // Verificar se é admin
    if (userCampanha?.membroRole !== 'admin' && !userCampanha?.roles?.includes('admin')) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Lock className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Apenas administradores podem acessar as configurações.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações da Campanha</h1>
                <p className="text-muted-foreground mt-1">
                    Edite os dados da sua campanha. O estado (UF) não pode ser alterado.
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {saved && (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    Configurações salvas com sucesso!
                </div>
            )}

            {/* Dados Gerais */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Gerais</CardTitle>
                    <CardDescription>Informações básicas da campanha e do candidato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cfg-nome">Nome da Campanha</Label>
                        <Input
                            id="cfg-nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cfg-candidato">Nome do Candidato</Label>
                        <Input
                            id="cfg-candidato"
                            value={nomeCandidato}
                            onChange={(e) => setNomeCandidato(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cfg-cargo">Cargo Pretendido</Label>
                        <Select value={cargoPretendido} onValueChange={setCargoPretendido}>
                            <SelectTrigger id="cfg-cargo">
                                <SelectValue />
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
                            <Label htmlFor="cfg-partido">Partido</Label>
                            <Input
                                id="cfg-partido"
                                value={partido}
                                onChange={(e) => setPartido(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cfg-numero">Número do Candidato</Label>
                            <Input
                                id="cfg-numero"
                                value={numeroCandidato}
                                onChange={(e) => setNumeroCandidato(e.target.value)}
                            />
                        </div>
                    </div>

                    {isMunicipal && (
                        <div className="space-y-2">
                            <Label htmlFor="cfg-cidade">Cidade</Label>
                            <Input
                                id="cfg-cidade"
                                value={cidade}
                                onChange={(e) => setCidade(e.target.value)}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Estado (bloqueado) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Região da Campanha
                    </CardTitle>
                    <CardDescription>
                        O estado foi definido durante a criação da campanha e não pode ser alterado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{campanha.uf}</span>
                        </div>
                        <div>
                            <p className="font-medium">{UF_NAMES[campanha.uf] ?? campanha.uf}</p>
                            <p className="text-xs text-muted-foreground">Estado irreversível</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Fotos (placeholder para futura implementação de upload) */}
            <Card>
                <CardHeader>
                    <CardTitle>Fotos da Campanha</CardTitle>
                    <CardDescription>
                        Upload de fotos será habilitado na próxima atualização.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="aspect-square bg-muted/50 rounded-lg flex flex-col items-center justify-center text-center p-4">
                            <span className="text-2xl mb-2">📷</span>
                            <p className="text-xs text-muted-foreground">Foto do Candidato</p>
                        </div>
                        <div className="aspect-video bg-muted/50 rounded-lg flex flex-col items-center justify-center text-center p-4 col-span-2">
                            <span className="text-2xl mb-2">🖼️</span>
                            <p className="text-xs text-muted-foreground">Capa Desktop</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Em breve: upload de avatar do candidato e capas para desktop/mobile.
                    </p>
                </CardContent>
            </Card>

            <Separator />

            {/* Botão de salvar */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !nome.trim() || !nomeCandidato.trim() || !cargoPretendido}
                    size="lg"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Configurações
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
