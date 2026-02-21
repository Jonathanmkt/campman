'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Onboarding para coordenadores convidados via email SMTP.
 * Ao chegar aqui o usuário já está autenticado (Supabase Auth confirmou o token).
 * O fluxo:
 * 1. Lê user_metadata (campanha_id, role, telefone)
 * 2. Cria registro em `coordenador_regional` vinculado à campanha
 * 3. Cria `campanha_membro` com role 'coordenador'
 * 4. Atualiza `profiles` com campanha_id, roles e telefone
 * 5. Redireciona para /mobile/liderancas (rota padrão do coordenador)
 */
export default function OnboardingCoordenadorPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const processOnboarding = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Sessão expirada. Faça login novamente.');
        setIsProcessing(false);
        return;
      }

      const metadata = user.user_metadata ?? {};
      const campanhaId = metadata.campanha_id as string | undefined;
      const telefone = metadata.telefone as string | undefined;

      if (!campanhaId) {
        setError('Convite inválido: campanha não identificada. Contate o administrador.');
        setIsProcessing(false);
        return;
      }

      // Verificar se já foi processado (profile já tem campanha_id)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('campanha_id')
        .eq('id', user.id)
        .single();

      if (existingProfile?.campanha_id) {
        router.push('/mobile/liderancas');
        return;
      }

      // 1) Criar registro em coordenador_regional
      const { error: coordError } = await supabase.from('coordenador_regional').insert({
        profile_id: user.id,
        campanha_id: campanhaId,
      });

      if (coordError) {
        console.error('[Onboarding Coordenador] Erro ao criar coordenador_regional:', coordError);
        // Continuar — pode já existir
      }

      // 2) Criar campanha_membro
      const { error: membroError } = await supabase.from('campanha_membro').insert({
        campanha_id: campanhaId,
        profile_id: user.id,
        role: 'coordenador',
        status: 'ativo',
      });

      if (membroError) {
        console.error('[Onboarding Coordenador] Erro ao criar membro:', membroError);
      }

      // 3) Atualizar profile com campanha_id, roles e telefone
      const profileUpdate: Record<string, unknown> = {
        campanha_id: campanhaId,
        roles: ['coordenador'],
      };
      if (telefone) {
        profileUpdate.telefone = telefone;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);

      if (profileError) {
        console.error('[Onboarding Coordenador] Erro ao atualizar profile:', profileError);
        setError('Erro ao finalizar cadastro. Tente novamente.');
        setIsProcessing(false);
        return;
      }

      setIsDone(true);
      setIsProcessing(false);

      // Redirecionar para app mobile do coordenador após 2s
      setTimeout(() => router.push('/mobile/liderancas'), 2000);
    } catch (err) {
      console.error('[Onboarding Coordenador] Erro inesperado:', err);
      setError('Erro inesperado. Tente novamente.');
      setIsProcessing(false);
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    processOnboarding().then(() => {
      if (cancelled) return;
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isProcessing) {
    return (
      <Card className="shadow-xl">
        <CardContent className="py-12 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Configurando seu acesso como coordenador...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
          <CardTitle className="text-red-600">Erro no Cadastro</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button variant="outline" onClick={() => router.push('/auth/login')}>
            Ir para Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isDone) {
    return (
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-green-600">Bem-vindo, Coordenador!</CardTitle>
          <CardDescription>
            Seu acesso foi configurado. Redirecionando para o app...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return null;
}
