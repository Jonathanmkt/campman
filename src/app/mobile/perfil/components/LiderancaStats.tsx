import { Users, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiderancaStatsProps {
  nivel?: string;
  tipo?: string;
  alcanceEstimado?: number;
  areas?: Array<{
    id: string;
    nome: string;
    tipo: string;
    cidade?: string;
    bairro?: string;
  }>;
}

export function LiderancaStats({ nivel, tipo, alcanceEstimado, areas }: LiderancaStatsProps) {
  const nivelLabels: Record<string, string> = {
    micro: 'Micro',
    pequeno: 'Pequeno',
    medio: 'Médio',
    grande: 'Grande',
    mega: 'Mega',
  };

  const tipoLabels: Record<string, string> = {
    comunitaria: 'Comunitária',
    religiosa: 'Religiosa',
    cultural: 'Cultural',
    esportiva: 'Esportiva',
    sindical: 'Sindical',
    empresarial: 'Empresarial',
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {nivel && (
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Nível
              </p>
              <p className="text-sm font-semibold">
                {nivelLabels[nivel] || nivel}
              </p>
            </CardContent>
          </Card>
        )}

        {tipo && (
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Tipo
              </p>
              <p className="text-sm font-semibold">
                {tipoLabels[tipo] || tipo}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {alcanceEstimado !== undefined && alcanceEstimado > 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Alcance Estimado
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {alcanceEstimado}
            </p>
            <p className="text-xs text-muted-foreground mt-1">pessoas</p>
          </CardContent>
        </Card>
      )}

      {areas && areas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Áreas de Atuação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {areas.map((area) => (
              <div
                key={area.id}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <Badge variant="outline" className="shrink-0">
                  {area.tipo}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{area.nome}</p>
                  {(area.cidade || area.bairro) && (
                    <p className="text-xs text-muted-foreground">
                      {[area.bairro, area.cidade].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
