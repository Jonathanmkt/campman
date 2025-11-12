import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NovoLancamentoModal } from './components/NovoLancamentoModal';
import { StatsCards } from './components/StatsCards';
import { FileText, Ticket, DollarSign, Users, MoreVertical, CreditCard, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';

export default function PainelTesouraria() {
  // Dados de exemplo - substitua por dados reais da sua aplicação
  const statsData = {
    totalTaloes: 42,
    ticketsDisponiveis: 1250,
    valorTotal: 12500,
    ultimoLancamento: '26/06/2025',
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel da Tesouraria</h1>
          <p className="text-muted-foreground">
            Gerencie os lançamentos financeiros e acompanhe as estatísticas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <NovoLancamentoModal />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <StatsCards {...statsData} />

      {/* Seção de Atividades Recentes */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Novo lote de talões adicionado</p>
                    <p className="text-sm text-muted-foreground">Série 1, 1001-1500</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Hoje, 14:30</span>
              </div>
              
              <div className="flex items-center justify-between rounded-lg p-4 hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Pagamento recebido</p>
                    <p className="text-sm text-muted-foreground">R$ 1.250,00 - Talão #42</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">Ontem, 16:45</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Status dos Talões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Disponíveis</span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  25 talões
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Em uso</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  15 talões
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Encerrados</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  2 talões
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Exemplo de dropdown com kebab menu */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle>Teste do Menu Kebab</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Exemplo isolado do dropdown menu com botão kebab. Clique nos três pontos abaixo:</p>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Crachá</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Mensalidades</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <span className="text-sm text-muted-foreground">Este é um exemplo isolado do dropdown menu</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}