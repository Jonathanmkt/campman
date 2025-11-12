import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ErrorPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Ops, algo deu errado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {params?.error ? (
              <p className="text-sm text-muted-foreground">
                Erro: {decodeURIComponent(params.error)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ocorreu um erro não especificado.
              </p>
            )}
            <Button asChild className="w-full">
              <a href="/auth/login">Voltar para o login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
