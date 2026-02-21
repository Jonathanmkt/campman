'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Onboarding para colaboradores convidados via email.
 * Ao chegar aqui o usuário já está autenticado (Supabase Auth confirmou o token).
 * O fluxo:
 * 1. Lê user_metadata (campanha_id, role, invited_by)
 * 2. Cria registro em `colaborador` vinculado à campanha
 * 3. Cria `campanha_membro` com role 'colaborador'
 * 4. Atualiza `profiles` com campanha_id e roles
 * 5. Redireciona para /dashboard
 */
export default function OnboardingColaboradorPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
        // Já processado — redirecionar direto
        router.push('/dashboard');
        return;
      }

      // 1) Criar registro em colaborador
      const { error: colabError } = await supabase.from('colaborador').insert({
        profile_id: user.id,
        funcao: 'colaborador',
        campanha_id: campanhaId,
        status_colaborador: 'ativo',
        ativo: true,
        data_inicio_atividade: new Date().toISOString().split('T')[0],
      });

      if (colabError) {
        console.error('[Onboarding Colaborador] Erro ao criar colaborador:', colabError);
        // Continuar mesmo com erro — pode já existir
      }

      // 2) Criar campanha_membro
      const { error: membroError } = await supabase.from('campanha_membro').insert({
        campanha_id: campanhaId,
        profile_id: user.id,
        role: 'colaborador',
        status: 'ativo',
      });

      if (membroError) {
        console.error('[Onboarding Colaborador] Erro ao criar membro:', membroError);
      }

      // 3) Atualizar profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          campanha_id: campanhaId,
          roles: ['colaborador'],
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('[Onboarding Colaborador] Erro ao atualizar profile:', profileError);
        setError('Erro ao finalizar cadastro. Tente novamente.');
        setIsProcessing(false);
        return;
      }

      setDone(true);
      setIsProcessing(false);

      // Redirecionar após 2s
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      console.error('[Onboarding Colaborador] Erro inesperado:', err);
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
          <p className="text-muted-foreground">Configurando seu acesso...</p>
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

  if (done) {
    return (
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <CardTitle className="text-green-600">Bem-vindo à equipe!</CardTitle>
          <CardDescription>
            Seu acesso como colaborador foi configurado. Redirecionando para o dashboard...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return null;
}
