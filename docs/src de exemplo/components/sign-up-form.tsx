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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = useState(false)
  const router = useRouter()

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Padronizando com o mesmo redirecionamento usado no login-form
          redirectTo: `${window.location.origin}/auth/callback?next=/wait`,
        },
      })
      
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro ao tentar fazer login com o Google')
      setIsGoogleLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Usar URL completa para garantir que o Supabase faça o redirecionamento corretamente
          // O formato precisa incluir o origin completo para funcionar corretamente com a API do Supabase
          emailRedirectTo: `${window.location.origin}/wait`,
          data: {
            nome_completo: nomeCompleto
          }
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Ocorreu um erro durante o cadastro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col w-full h-full bg-white/60 backdrop-blur-lg backdrop-saturate-150 pt-16 px-6 pb-8 rounded-lg shadow-lg', className)} {...props}>
      <Card className="w-full border-none bg-transparent shadow-none">
        <CardHeader className="p-0 pb-10 pl-[15%]">
          <CardTitle className="text-3xl font-bold mb-2">Faça seu cadastro</CardTitle>
          <CardDescription className="text-lg">Crie sua conta para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSignUp} className="w-full">
            <div className="flex flex-col w-full space-y-6">
              {error && <p className="text-sm text-destructive-500 -mb-4">{error}</p>}
              
              <div className="w-[70%] mx-auto space-y-1">
                <Label htmlFor="nome-completo" className="text-base block text-left">Nome completo</Label>
                <Input
                  id="nome-completo"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  className="h-12 text-base w-full border-gray-500 focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="w-[70%] mx-auto space-y-1">
                <Label htmlFor="email" className="text-base block text-left">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base w-full border-gray-500 focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="w-[70%] mx-auto space-y-1">
                <Label htmlFor="password" className="text-base block text-left">Senha</Label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 text-base w-full pr-10 border-gray-500 focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
              </div>
              
              <div className="w-[70%] mx-auto space-y-1">
                <Label htmlFor="repeat-password" className="text-base block text-left">Confirme a senha</Label>
                <div className="relative w-full">
                  <Input
                    id="repeat-password"
                    type={showRepeatPassword ? "text" : "password"}
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 text-base w-full pr-10 border-gray-500 focus:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  >
                    {showRepeatPassword ? (
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
              </div>
              
              <div className="w-[70%] mx-auto pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Cadastrar'}
                </Button>
              </div>
              
              {/* Separador */}
              <div className="w-[70%] mx-auto pt-4">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="px-4 text-gray-500 text-sm">ou</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
              
              {/* Botão de cadastro com Google */}
              <div className="w-[70%] mx-auto pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 text-base flex items-center justify-center gap-2 font-medium" 
                  onClick={handleGoogleSignup}
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
                  {isGoogleLoading ? 'Cadastrando...' : 'Continuar com Google'}
                </Button>
              </div>
              
              <div className="w-[70%] mx-auto pt-6">
                <Link href="/auth/login" className="text-primary hover:underline text-base block text-center">
                  Já tem uma conta? Faça login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
