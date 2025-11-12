import { redirect } from 'next/navigation'
import Image from 'next/image'
import { LogoutButton } from '@/components/logout-button'
import { RefreshButton } from '@/components/refresh-button'
import { createClient } from '@/lib/supabase/server'
import styles from './styles.module.css'
import { Card, CardContent } from '@/components/ui/card'

export default async function WaitPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  // Obter o nome do usuário do perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome_completo')
    .eq('id', data.user.id)
    .single()

  const userName = profile?.nome_completo || data.user.email?.split('@')[0] || 'Usuário'

  return (
    <div className={styles.waitPageContainer}>
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
            <h1 className="text-2xl font-bold text-white">Área do Associado</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Removido o botão de logout do cabeçalho */}
          </div>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <Card className="w-full border-none bg-white/60 backdrop-blur-lg backdrop-saturate-150 rounded-lg shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  <h2 className="text-4xl font-bold text-gray-900">
                    Bem-vindo(a), <span className="text-primary-600">{userName}</span>
                  </h2>
                  <div className="space-y-4">
                    <p className="text-lg text-gray-700">
                      Seu login foi realizado com sucesso!
                    </p>
                    <p className="text-lg text-gray-700">
                      Para ter acesso à área administrativa, entre em contato com o administrador do sistema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Botões de ação */}
            <div className="w-[70%] mx-auto flex flex-col sm:flex-row gap-4 justify-center">
              <RefreshButton />
              <LogoutButton />
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
