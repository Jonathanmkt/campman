import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText, Ticket, Users } from 'lucide-react';

interface StatsCardsProps {
  totalTaloes: number;
  ticketsDisponiveis: number;
  valorTotal: number;
  ultimoLancamento: string;
}

export function StatsCards({ 
  totalTaloes, 
  ticketsDisponiveis, 
  valorTotal, 
  ultimoLancamento 
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total de Talões',
      value: totalTaloes.toLocaleString('pt-BR'),
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
      description: 'Talões cadastrados no sistema',
    },
    {
      title: 'Tickets Disponíveis',
      value: ticketsDisponiveis.toLocaleString('pt-BR'),
      icon: <Ticket className="h-5 w-5 text-muted-foreground" />,
      description: 'Tickets disponíveis para venda',
    },
    {
      title: 'Valor Total',
      value: new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valorTotal),
      icon: <DollarSign className="h-5 w-5 text-muted-foreground" />,
      description: 'Valor total em caixa',
    },
    {
      title: 'Último Lançamento',
      value: ultimoLancamento,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      description: 'Data do último lançamento',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className="h-5 w-5 text-muted-foreground">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
