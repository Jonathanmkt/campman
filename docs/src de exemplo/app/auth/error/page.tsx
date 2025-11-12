'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Componente interno que utiliza o hook useSearchParams
function ErrorPageContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  // Decodificar a mensagem de erro se existir
  const decodedError = error ? decodeURIComponent(error) : null
  
  // Mapear códigos de erro comuns para mensagens mais amigáveis
  const getFriendlyErrorMessage = (error: string | null) => {
    if (!error) return 'Ocorreu um erro desconhecido durante a autenticação.'
    
    // Verificar por códigos de erro comuns
    if (error.includes('invalid_grant')) {
      return 'Sessão expirada ou código de autorização inválido. Por favor, tente novamente.'
    }
    
    if (error.includes('invalid_credentials')) {
      return 'Credenciais inválidas. Verifique seus dados e tente novamente.'
    }
    
    if (error.includes('email_not_confirmed')) {
      return 'Por favor, verifique seu e-mail e confirme seu cadastro antes de fazer login.'
    }
    
    if (error.includes('user_not_found')) {
      return 'Usuário não encontrado. Verifique se o e-mail está correto.'
    }
    
    // Se não for um erro conhecido, retornar a mensagem original
    return error
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Erro na Autenticação</h1>
            <p className="text-muted-foreground mt-2">
              Não foi possível completar o processo de autenticação.
            </p>
          </div>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Detalhes do Erro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription className="mt-2">
                  {getFriendlyErrorMessage(decodedError)}
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 flex flex-col gap-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">O que fazer agora?</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Tente novamente mais tarde</li>
                    <li>Verifique sua conexão com a internet</li>
                    <li>Entre em contato com o suporte se o problema persistir</li>
                  </ul>
                </div>
                
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar para o login
                    </Link>
                  </Button>
                  <Button asChild variant="default" className="w-full">
                    <Link href="/">
                      Ir para a página inicial
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {process.env.NODE_ENV === 'development' && decodedError && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm">
              <p className="font-medium mb-2">Detalhes técnicos (apenas em desenvolvimento):</p>
              <pre className="bg-background p-3 rounded overflow-auto text-xs">
                {JSON.stringify(decodedError, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente principal que envolve o conteúdo com Suspense
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-svh w-full items-center justify-center p-6">Carregando...</div>}>
      <ErrorPageContent />
    </Suspense>
  )
}
