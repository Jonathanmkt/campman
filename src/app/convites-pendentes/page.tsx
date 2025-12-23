'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Copy, Check, ExternalLink, MessageCircle, Clock, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Convite {
  id: string;
  telefone: string;
  token: string;
  nome_convidado: string;
  nome_completo: string;
  nome_popular: string | null;
  tipo_lideranca: string;
  status: string;
  expires_at: string;
  created_at: string;
  link_onboarding: string;
}

export default function ConvitesPendentesPage() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  const fetchConvites = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mobile/convites');
      const result = await response.json();

      if (result.success) {
        setConvites(result.data || []);
        setUltimaAtualizacao(new Date());
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConvites();
  }, [fetchConvites]);

  const formatarTelefone = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcularTempoRestante = (expiresAt: string) => {
    const agora = new Date();
    const expiracao = new Date(expiresAt);
    const diffMs = expiracao.getTime() - agora.getTime();

    if (diffMs <= 0) return 'Expirado';

    const horas = Math.floor(diffMs / (1000 * 60 * 60));
    const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
      return `${horas}h ${minutos}min restantes`;
    }
    return `${minutos}min restantes`;
  };

  const copiarParaClipboard = async (texto: string, id: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch {
      alert('Não foi possível copiar. Selecione o texto manualmente.');
    }
  };

  const abrirWhatsApp = (convite: Convite) => {
    const telefoneNumeros = convite.telefone.replace(/\D/g, '');
    const telefoneFormatado = telefoneNumeros.startsWith('55') ? telefoneNumeros : `55${telefoneNumeros}`;
    const mensagem = `Olá ${convite.nome_convidado?.split(' ')[0] || 'Liderança'}! Você foi convidado(a) para fazer parte da equipe de campanha. Clique no link abaixo para criar sua senha e acessar o app:\n\n${convite.link_onboarding}`;
    const mensagemCodificada = encodeURIComponent(mensagem);
    window.open(`https://wa.me/${telefoneFormatado}?text=${mensagemCodificada}`, '_blank');
  };

  const getTipoLiderancaLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      comunitaria: 'Comunitária',
      religiosa: 'Religiosa',
      sindical: 'Sindical',
      empresarial: 'Empresarial',
      politica: 'Política',
      social: 'Social',
      esportiva: 'Esportiva',
      cultural: 'Cultural',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white px-4 py-4 shadow-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">Convites Pendentes</h1>
              <p className="text-xs text-blue-100">
                Página temporária para testes (sem integração uazapi)
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-500 text-white">
              {convites.length} pendentes
            </Badge>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Botão de atualizar */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-muted-foreground">
            {ultimaAtualizacao && (
              <>Atualizado em {ultimaAtualizacao.toLocaleTimeString('pt-BR')}</>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConvites}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Alerta informativo */}
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            Esta página é temporária. Quando a integração com uazapi estiver pronta, os convites serão enviados automaticamente por WhatsApp.
          </AlertDescription>
        </Alert>

        {/* Lista de convites */}
        {isLoading && convites.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : convites.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum convite pendente</p>
              <p className="text-sm text-muted-foreground mt-1">
                Crie novos convites na tela do coordenador
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {convites.map((convite) => (
              <Card key={convite.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {convite.nome_convidado || convite.nome_completo}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {formatarTelefone(convite.telefone)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {getTipoLiderancaLabel(convite.tipo_lideranca)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Link de onboarding */}
                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground mb-1">Link de cadastro:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white p-2 rounded border truncate">
                        {convite.link_onboarding}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => copiarParaClipboard(convite.link_onboarding, convite.id)}
                      >
                        {copiado === convite.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Info de expiração */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Criado em {formatarData(convite.created_at)}</span>
                    <span className="text-amber-600 font-medium">
                      {calcularTempoRestante(convite.expires_at)}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(convite.link_onboarding, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir link
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => abrirWhatsApp(convite)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
