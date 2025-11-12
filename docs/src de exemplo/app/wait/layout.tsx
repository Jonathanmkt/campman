import React from 'react';
import log from '@/lib/logger';

export default function WaitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const waitLayoutId = Math.random().toString(36).substring(2, 8);
  
  log.info(`[WaitLayout:${waitLayoutId}] INICIALIZAÇÃO - Renderizando layout de espera`);
  
  // O middleware já verifica as permissões antes de carregar esta página
  log.info(`[WaitLayout:${waitLayoutId}] Renderizando componentes filhos`);
  
  const result = <>{children}</>;
  
  log.info(`[WaitLayout:${waitLayoutId}] FINALIZAÇÃO - Renderização do layout de espera concluída`);
  
  return result;
}
