import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import styles from './styles.module.css'

export default function SignUpSuccessPage() {
  return (
    <div className={styles.signUpSuccessContainer}>
      {/* Overlay escuro para melhorar a legibilidade */}
      <div className={styles.overlay}></div>
      
      {/* Conteúdo principal */}
      <div className={styles.content}>
        {/* Cabeçalho */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image 
              src="/logo-large.webp" 
              alt="Logo Singaerj" 
              width={120}
              height={48}
              priority
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-white">Cadastro Realizado</h1>
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <Card className="w-full border-none bg-white/60 backdrop-blur-lg backdrop-saturate-150 rounded-lg shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  <h2 className="text-4xl font-bold text-gray-900">
                    Obrigado por se cadastrar!
                  </h2>
                  <div className="space-y-4">
                    <p className="text-lg text-gray-700">
                      Seu cadastro foi realizado com sucesso.
                    </p>
                    <p className="text-lg text-gray-700">
                      Por favor, verifique seu e-mail para confirmar sua conta antes de fazer login.
                    </p>
                    <p className="text-lg text-gray-700 font-medium mt-6">
                      Enviamos um e-mail de confirmação para o endereço fornecido.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Botão de voltar para login */}
            <div className="w-[70%] mx-auto flex justify-center">
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-2 border-white text-gray-800 bg-white/80 hover:bg-white hover:text-gray-900 flex items-center justify-center gap-2 font-medium text-base px-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </div>
        </main>

        {/* Rodapé */}
        <footer className="text-center text-sm text-gray-300 pt-8 pb-4">
          <p>© {new Date().getFullYear()} Singaerj - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  )
}
