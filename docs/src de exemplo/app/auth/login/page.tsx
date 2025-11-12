import { LoginForm } from '@/components/login-form'
import Image from 'next/image'
import styles from './styles.module.css'
import log from '@/lib/logger'

export default function Page() {
  const loginPageId = Math.random().toString(36).substring(2, 8);
  
  log.info(`[LoginPage:${loginPageId}] INICIALIZAÇÃO - Renderizando página de login`);
  
  const result = (
    <div className={`${styles.loginPageContainer} flex min-h-svh w-full`}>
      {/* Camada de sobreposição */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>
      {/* Coluna da esquerda - Logo e títulos animados */}
      <div className="w-1/2 p-6 flex flex-col relative z-10">
        <div className="flex items-center gap-4 mb-10">
          <div>
            <Image 
              src="/logo-large.webp" 
              alt="Logo Singaerj" 
              width={96} 
              height={38} 
              priority 
              className="object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight">
            Singaerj
          </h1>
        </div>
        
        <div className="flex-1 flex flex-col justify-start pt-40 items-center">
          <h2 className={`${styles.animatedSubtitle} text-6xl text-white text-center font-bold leading-snug`}>
            Respeito e Confiança<br />Desde 1949
          </h2>
        </div>
      </div>
      
      {/* Coluna da direita - Formulário de login */}
      <div className="w-1/2 p-6 relative z-10">
        <LoginForm className="h-full" />
      </div>
    </div>
  );
  
  log.info(`[LoginPage:${loginPageId}] FINALIZAÇÃO - Renderização da página de login concluída`);
  
  return result;
}
