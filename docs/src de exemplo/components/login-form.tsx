'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useToast } from '@/components/ui/useToast'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const toast = useToast()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [debugMessage, setDebugMessage] = useState<string | null>(null)

  // Efeito para verificar o status de autenticação na inicialização
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getSession()
        
        if (data?.session) {
          // Se já existe uma sessão ativa, redireciona para o painel
          setDebugMessage('Usuário já está autenticado. Redirecionando para /painel...')
          setTimeout(() => {
            // Pequeno delay para dar tempo de exibir a mensagem de debug
            router.push('/painel')
          }, 500)
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error)
      }
    }
    
    checkSession()
  }, [router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setDebugMessage(null)

    try {
      // Faz o login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error('Login ou senha inválidos', 'Verifique suas credenciais e tente de novo')
        setDebugMessage(`Erro no login: ${error.message}`)
        throw error
      }
      
      // Verifica se o usuário foi autenticado com sucesso
      if (data?.user) {
        setDebugMessage(`Autenticado com sucesso como ${data.user.email}. Redirecionando para o painel...`)
        
        // Simplificando o fluxo: sempre redireciona para o painel
        // O componente RoleProtection no painel vai verificar as permissões
        // e redirecionar conforme necessário
        router.push('/painel')
        return
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro durante o login'
      setError(errorMessage)
      setDebugMessage(`Exceção capturada: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)
    setDebugMessage(null)

    try {
      // O login social com Google funciona diferente, pois redireciona para o provedor
      // Ao retornar, o callback irá processar a sessão
      // Vamos apenas configurar a URL de redirecionamento para voltar ao nosso site
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Após autenticação bem-sucedida no Google, será redirecionado para o callback
          // O callback deverá então redirecionar para o painel
          redirectTo: `${window.location.origin}/auth/callback?next=/painel`,
        },
      })

      if (error) {
        toast.error('Ocorreu um erro durante o login com Google', 'Tente novamente mais tarde')
        setDebugMessage(`Erro no login com Google: ${error.message}`)
        throw error
      }
      
      // Neste ponto, o usuário será redirecionado para o Google
      // e posteriormente para o callback
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro durante o login com Google'
      setError(errorMessage)
      setDebugMessage(`Exceção capturada no login Google: ${errorMessage}`)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6 w-full h-full bg-white/60 backdrop-blur-lg backdrop-saturate-150 pt-[60px] px-6 pb-6 rounded-lg shadow-lg', className)} {...props}>
      <Card className="w-full border-none bg-transparent shadow-none">
        <CardHeader className="p-0 pb-8 space-y-3 pl-[15%]">
          <CardTitle className="text-3xl font-bold">Bem-vindo!</CardTitle>
          <CardDescription className="text-lg">Entre na sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-6">
          <div className="flex flex-col gap-8 items-center">
            {/* Área de diagnóstico - só visível em desenvolvimento */}
            {debugMessage && process.env.NODE_ENV !== 'production' && (
              <div className="w-[90%] mx-auto p-3 border border-yellow-500 bg-yellow-50 rounded-md mb-4">
                <h3 className="font-medium">Diagnóstico:</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{debugMessage}</p>
              </div>
            )}
            
            {/* Formulário de login com email/senha */}
            <form onSubmit={handleEmailLogin} className="w-full">
              <div className="flex flex-col gap-6 w-full">
                {error && <p className="text-sm text-destructive-500">{error}</p>}
                
                <div className="flex flex-col gap-2 w-full">
                  <div className="w-[70%] mx-auto">
                    <Label htmlFor="email" className="text-base block text-left">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="h-12 text-base w-full mt-1 border-gray-500 focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <div className="w-[70%] mx-auto">
                    <Label htmlFor="password" className="text-base block text-left">Senha</Label>
                    <div className="relative w-full">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-base w-full pr-10 mt-1 border-gray-500 focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Link href="/auth/forgot-password" className="text-primary hover:underline text-xs">
                        Esqueceu sua senha?
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="w-[70%] mx-auto">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base mt-6 font-medium" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar com Email'}
                  </Button>
                </div>
              </div>
            </form>
            
            {/* Separador */}
            <div className="w-[70%] mx-auto my-2">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">ou</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
            </div>
            
            {/* Botão de login com Google */}
            <div className="w-[70%] mx-auto">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 text-base flex items-center justify-center gap-2 font-medium" 
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
              >
                {!isGoogleLoading && (
                  <Image 
                    src="/google-logo.svg" 
                    alt="Google" 
                    width={20} 
                    height={20} 
                  />
                )}
                {isGoogleLoading ? 'Entrando...' : 'Continuar com Google'}
              </Button>
            </div>
            
            {/* Link para cadastro */}
            <div className="w-[70%] mx-auto mt-6">
              <Link href="/auth/sign-up" className="text-primary hover:underline text-base block text-center">
                Não tem uma conta? Cadastre-se
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
