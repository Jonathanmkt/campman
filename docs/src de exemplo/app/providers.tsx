'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { UserProvider } from '@/contexts/UserContext';
import log from '@/lib/logger';

// ID estático para o Providers para evitar remontagens desnecessárias
const STATIC_PROVIDERS_ID = 'providers-global';

export function Providers({ 
  children
}: { 
  children: React.ReactNode
}) {
  // Usando ID estático para evitar remontagens desnecessárias
  const providersId = STATIC_PROVIDERS_ID;
  
  log.info(`[Providers:${providersId}] INICIALIZAÇÃO - Renderizando Providers`);
  
  const [queryClient] = useState(
    () => {
      log.info(`[Providers:${providersId}] Criando QueryClient`);
      return new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      });
    }
  );
  
  useEffect(() => {
    log.info(`[Providers:${providersId}] Providers montado`);
    
    return () => {
      log.info(`[Providers:${providersId}] Providers desmontado`);
    };
    // providersId é estático e não muda entre renderizações
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  log.info(`[Providers:${providersId}] Renderizando componentes filhos`);
  
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider providersId={providersId}>
        {children}
      </UserProvider>
    </QueryClientProvider>
  );
}
