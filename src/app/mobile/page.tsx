'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { LiderancaMobilePage } from './components/LiderancaMobilePage';
import { CoordenadorMobilePage } from './components/CoordenadorMobilePage';

type UserRole = 'lideranca' | 'coordenador' | null;

export default function MobilePage() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUserRole() {
      const supabase = createClient();
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Para testes, vamos simular um coordenador regional
          // Em produção, redirecionar para login
          setUserRole('coordenador');
          setUserId('test-user');
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Verificar se é coordenador
        const { data: coordenador } = await supabase
          .from('coordenador_regional')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (coordenador) {
          setUserRole('coordenador');
          setIsLoading(false);
          return;
        }

        // Verificar se é liderança
        const { data: lideranca } = await supabase
          .from('lideranca')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (lideranca) {
          setUserRole('lideranca');
          setIsLoading(false);
          return;
        }

        // Usuário sem papel definido - para testes, mostrar como coordenador
        setUserRole('coordenador');
      } catch (error) {
        console.error('Erro ao verificar papel do usuário:', error);
        // Para testes, mostrar como liderança
        setUserRole('lideranca');
      } finally {
        setIsLoading(false);
      }
    }

    checkUserRole();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (userRole === 'coordenador') {
    return <CoordenadorMobilePage userId={userId} />;
  }

  return <LiderancaMobilePage userId={userId} />;
}
