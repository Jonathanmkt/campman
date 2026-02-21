'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

interface CampanhaInfo {
  nome: string;
  nome_candidato: string;
  cargo_pretendido: string;
  partido: string | null;
}

/**
 * Página pública de cadastro de eleitor via link compartilhado.
 * Não requer autenticação — qualquer pessoa com o link pode se cadastrar.
 * Inclui tela de consentimento LGPD antes do cadastro.
 */
export default function ConviteEleitorPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campanha, setCampanha] = useState<CampanhaInfo | null>(null);
  const [success, setSuccess] = useState(false);
  const [linkCompartilhar, setLinkCompartilhar] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    aceite_lgpd: false,
  });

  // Validar token ao carregar
  useEffect(() => {
    const validarToken = async () => {
      if (!token) {
        setError('Link inválido. Solicite um novo convite.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/public/convite-eleitor?token=${token}`);
        const result = await response.json();

        if (result.success) {
          setCampanha(result.data.campanha as CampanhaInfo);
        } else {
          setError(result.error || 'Convite inválido.');
        }
      } catch {
        setError('Erro ao validar convite. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    validarToken();
  }, [token]);

  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 11) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome_completo.trim()) {
      setError('Informe seu nome completo.');
      return;
    }

    if (!formData.telefone.replace(/\D/g, '').match(/^\d{10,11}$/)) {
      setError('Informe um telefone válido com DDD.');
      return;
    }

    if (!formData.aceite_lgpd) {
      setError('É necessário aceitar os termos para prosseguir.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/public/convite-eleitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          nome_completo: formData.nome_completo.trim(),
          telefone: formData.telefone.replace(/\D/g, ''),
          aceite_lgpd: formData.aceite_lgpd,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setLinkCompartilhar(result.data.linkCompartilhar);
      } else {
        setError(result.error || 'Erro ao cadastrar.');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copiarLink = async () => {
    if (!linkCompartilhar) return;
    try {
      await navigator.clipboard.writeText(linkCompartilhar);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  const compartilharWhatsApp = () => {
    if (!linkCompartilhar || !campanha) return;
    const mensagem = encodeURIComponent(
      `Conheça a campanha de ${campanha.nome_candidato}! Cadastre-se aqui: ${linkCompartilhar}`
    );
    window.open(`https://wa.me/?text=${mensagem}`, '_blank');
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Erro sem campanha
  if (error && !campanha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Convite Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Sucesso — mostrar link para compartilhar
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-600">Cadastro Realizado!</CardTitle>
            <CardDescription>
              Obrigado por apoiar a campanha de {campanha?.nome_candidato}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkCompartilhar && (
              <>
                <p className="text-sm text-center text-muted-foreground">
                  Convide seus amigos para apoiar também:
                </p>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white p-2 rounded border truncate">
                      {linkCompartilhar}
                    </code>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={copiarLink}>
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={compartilharWhatsApp}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar no WhatsApp
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de cadastro com aceite LGPD
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">
            {campanha?.nome_candidato}
          </CardTitle>
          <CardDescription>
            {campanha?.cargo_pretendido && (
              <span className="capitalize">{campanha.cargo_pretendido.replace('_', ' ')}</span>
            )}
            {campanha?.partido && ` - ${campanha.partido}`}
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Preencha seus dados para apoiar a campanha
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Seu nome completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_completo: e.target.value }))}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">
                Telefone com DDD <span className="text-red-500">*</span>
              </Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: formatarTelefone(e.target.value) }))}
                className="h-12"
                maxLength={16}
              />
            </div>

            {/* Aceite LGPD */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 bg-gray-50">
              <Checkbox
                id="lgpd"
                checked={formData.aceite_lgpd}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, aceite_lgpd: checked === true }))
                }
              />
              <label htmlFor="lgpd" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Autorizo o uso dos meus dados pessoais (nome e telefone) para fins de comunicação
                desta campanha eleitoral, conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                Posso solicitar a exclusão dos meus dados a qualquer momento.
              </label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !formData.aceite_lgpd}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Cadastrar meu apoio'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
