import { Share2, CheckCircle2, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tables } from '@/types';
import Image from 'next/image';

type Lideranca = Tables<'lideranca'> & {
  convite_status?: 'pendente' | 'aceito' | null;
  convite_token?: string | null;
  total_eleitores?: number;
  potencial_votos?: number;
};

interface LiderancaCardProps {
  lideranca: Lideranca;
  onCompartilharConvite: (lideranca: Lideranca) => void;
  onAbrirLocalizacao: (lideranca: Lideranca) => void;
}

const getTipoLiderancaLabel = (tipo: string | null) => {
  const tipos: Record<string, string> = {
    comunitaria: 'Comunitária',
    religiosa: 'Religiosa',
    sindical: 'Sindical',
    empresarial: 'Empresarial',
    politica: 'Política',
    social: 'Social',
    esportiva: 'Esportiva',
    cultural: 'Cultural',
  };
  return tipo ? tipos[tipo] || tipo : 'Não definido';
};

const getNivelInfluenciaStars = (nivel: number | null) => {
  const n = nivel || 1;
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-3 w-3 ${i < n ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
    />
  ));
};

export function LiderancaCard({ lideranca, onCompartilharConvite, onAbrirLocalizacao }: LiderancaCardProps) {
  const calcularPercentual = () => {
    const meta = (typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 1;
    return Math.round(((lideranca.total_eleitores || 0) / meta) * 100);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex items-start p-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">
                {lideranca.nome_completo}
              </h3>
              {lideranca.convite_status === 'pendente' ? (
                <button
                  onClick={() => onCompartilharConvite(lideranca)}
                  className="shrink-0 p-2 hover:bg-amber-50 active:bg-amber-100 rounded-full transition-colors"
                  aria-label="Compartilhar convite"
                >
                  <Share2 className="h-5 w-5 text-amber-600" />
                </button>
              ) : lideranca.convite_status === 'aceito' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              ) : null}
            </div>
            
            {lideranca.nome_popular && (
              <p className="text-sm text-muted-foreground italic mb-3">
                &ldquo;{lideranca.nome_popular}&rdquo;
              </p>
            )}
            
            {/* Barra de progresso */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">
                  {lideranca.total_eleitores || 0} / {(typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 0} eleitores
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  {calcularPercentual()}%
                </span>
              </div>
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(calcularPercentual(), 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Tipo e nível de influência */}
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {getTipoLiderancaLabel(lideranca.tipo_lideranca)}
              </Badge>
              <div className="flex items-center gap-0.5">
                {getNivelInfluenciaStars(lideranca.nivel_influencia)}
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {lideranca.telefone && (
                <a 
                  href={`https://wa.me/55${lideranca.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-green-600 active:text-green-700 py-1 transition-colors"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-green-100 bg-green-50">
                    <Image
                      src="/whatsapp-icon.svg"
                      alt="WhatsApp"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  </span>
                  <span className="font-medium">{lideranca.telefone}</span>
                </a>
              )}
              {(lideranca.bairro || lideranca.cidade) && (
                <button
                  onClick={() => onAbrirLocalizacao(lideranca)}
                  className="flex items-center gap-2 truncate py-1 hover:text-blue-600 active:text-blue-700 transition-colors text-left"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 shrink-0">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </span>
                  <span>{[lideranca.bairro, lideranca.cidade].filter(Boolean).join(', ')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
