import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, BarChart3, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const stats = [
    {
      title: 'Total de Eleitores',
      value: '2,847',
      description: '+12% em relação ao mês passado',
      icon: Users,
    },
    {
      title: 'Eventos Realizados',
      value: '23',
      description: '+3 eventos esta semana',
      icon: Calendar,
    },
    {
      title: 'Taxa de Engajamento',
      value: '68%',
      description: '+5% em relação ao mês passado',
      icon: TrendingUp,
    },
    {
      title: 'Pesquisas Ativas',
      value: '4',
      description: '2 finalizadas recentemente',
      icon: BarChart3,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.email}! Aqui está um resumo da sua campanha.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas ações realizadas na campanha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Novo evento cadastrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reunião com lideranças locais - Hoje às 14:30
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Pesquisa finalizada
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Intenção de voto - Bairro Centro - Ontem
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Novos eleitores cadastrados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    47 novos cadastros esta semana
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Agenda dos próximos compromissos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Caminhada no Centro
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Amanhã às 16:00
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Debate na TV Local
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sexta-feira às 20:00
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Reunião com Empresários
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sábado às 10:00
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
