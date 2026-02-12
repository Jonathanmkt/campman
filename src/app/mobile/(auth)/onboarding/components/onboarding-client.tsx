'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConviteData {
  telefone: string;
  nome: string;
  expires_at: string;
}

export function OnboardingClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [conviteData, setConviteData] = useState<ConviteData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    senha: '',
    confirmarSenha: '',
  });

  useEffect(() => {
    const validarToken = async () => {
      if (!token) {
        setError('Link inválido. Solicite um novo convite ao coordenador.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/mobile/auth/confirmar-convite?token=${token}`);
        const result = await response.json();

        if (result.success) {
          setConviteData(result.data);
        } else {
          setError(result.error || 'Convite inválido ou expirado.');
        }
      } catch (err) {
        console.error('Erro ao validar token:', err);
        setError('Erro ao validar convite. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    validarToken();
  }, [token]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/mobile/auth/confirmar-convite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          senha: formData.senha,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/mobile/login');
        }, 3000);
      } else {
        setError(result.error || 'Erro ao confirmar cadastro.');
      }
    } catch (err) {
      console.error('Erro ao confirmar convite:', err);
      setError('Erro ao confirmar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
            <p className="text-blue-100">Validando convite...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !conviteData) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Ops!
            </h1>
            <p className="text-blue-100 text-lg">
              CampMan
            </p>
          </div>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Convite Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-center text-muted-foreground mb-4">
              Entre em contato com o coordenador que enviou o convite para solicitar um novo link.
            </p>
            <Button variant="outline" className="w-full" onClick={() => router.push('/mobile')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Sucesso!
            </h1>
            <p className="text-blue-100 text-lg">
              CampMan
            </p>
          </div>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-green-600">Cadastro Confirmado!</CardTitle>
            <CardDescription>
              Sua senha foi criada com sucesso. Você será redirecionado para a tela de login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-800">
                Use seu telefone <strong>{conviteData && formatarTelefone(conviteData.telefone)}</strong> e a senha que você acabou de criar para fazer login.
              </p>
            </div>
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/mobile/login')}>
              Ir para Login
            </Button>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Bem-vindo(a)!
          </h1>
          <p className="text-blue-100 text-lg">
            CampMan
          </p>
        </div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Olá, {conviteData?.nome?.split(' ')[0]}!</CardTitle>
          <CardDescription>Crie uma senha para acessar o app da campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Seu telefone</Label>
              <Input value={conviteData ? formatarTelefone(conviteData.telefone) : ''} readOnly className="h-12 bg-gray-50" />
              <p className="text-xs text-muted-foreground">Este será seu login no app</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium">
                Criar senha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                  className="h-12 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-sm font-medium">
                Confirmar senha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmarSenha}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                  className="h-12 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
