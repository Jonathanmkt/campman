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
import { useState } from 'react'

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col w-full h-full bg-white/60 backdrop-blur-lg backdrop-saturate-150 pt-16 px-6 pb-8 rounded-lg shadow-lg', className)} {...props}>
      {success ? (
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardHeader className="p-0 pb-10 text-center">
            <CardTitle className="text-3xl font-bold mb-2">Verifique seu email</CardTitle>
            <CardDescription className="text-lg">Instruções para redefinição de senha enviadas</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col w-full space-y-6">
              <p className="text-base w-[70%] mx-auto text-center">
                Se você se registrou usando seu email e senha, você receberá um email para redefinição de senha.
                Verifique sua caixa de entrada e spam.
              </p>
              
              <div className="w-[70%] mx-auto pt-4">
                <Button 
                  type="button" 
                  className="w-full h-12 text-base" 
                  onClick={() => window.location.href = '/auth/login'}
                >
                  Fazer login novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full border-none bg-transparent shadow-none">
          <CardHeader className="p-0 pb-10 text-center">
            <CardTitle className="text-3xl font-bold mb-2">Recuperar senha</CardTitle>
            <CardDescription className="text-lg">
              Digite seu email e enviaremos um link para redefinir sua senha
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleForgotPassword} className="w-full">
              <div className="flex flex-col w-full space-y-6">
                {error && <p className="text-sm text-destructive-500 w-[70%] mx-auto -mb-4">{error}</p>}
                
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
                
                <div className="w-[70%] mx-auto pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar email de recuperação'}
                  </Button>
                </div>
              </div>
              
              <div className="w-[70%] mx-auto pt-6 text-center">
                <Link href="/auth/login" className="text-primary hover:underline text-base">
                  Já tem uma conta? Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
