import { SignUpForm } from '@/components/sign-up-form'
import Image from 'next/image'
import styles from './styles.module.css'

export default function Page() {
  return (
    <div className={`${styles.signupPageContainer} flex min-h-svh w-full`}>
      {/* Camada de sobreposição */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Coluna da esquerda - Formulário de cadastro */}
      <div className="w-1/2 p-6 relative z-10">
        <SignUpForm className="h-full" />
      </div>
      
      {/* Coluna da direita - Logo e título */}
      <div className="w-1/2 p-6 flex flex-col relative z-10">
        <div className="flex items-center gap-4 mb-10 ml-auto">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Singaerj
          </h1>
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
        </div>
      </div>
    </div>
  )
}
