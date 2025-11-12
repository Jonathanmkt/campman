import PainelLayout from '@/components/layout/PainelLayout';
import log from '@/lib/logger';

export default function PainelRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const painelLayoutId = Math.random().toString(36).substring(2, 8);
  
  log.info(`[PainelRootLayout:${painelLayoutId}] INICIALIZAÇÃO - Renderizando layout do painel`);
  
  // O middleware já verifica as permissões antes de carregar esta página
  log.info(`[PainelRootLayout:${painelLayoutId}] Renderizando PainelLayout`);
  
  const result = <PainelLayout layoutId={painelLayoutId}>{children}</PainelLayout>;
  
  log.info(`[PainelRootLayout:${painelLayoutId}] FINALIZAÇÃO - Renderização do layout do painel concluída`);
  
  return result;
}