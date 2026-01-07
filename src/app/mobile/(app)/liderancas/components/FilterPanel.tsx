import { X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/range-slider';

interface FilterPanelProps {
  show: boolean;
  filtrosTemp: {
    conviteStatus: string[];
    cidades: string[];
    bairros: string[];
    tipos: string[];
    niveis: number[];
  };
  cidadesDisponiveis: string[];
  bairrosDisponiveis: string[];
  alcanceRange: number[];
  percentualRange: number[];
  onToggleConviteStatus: (status: string) => void;
  onToggleCidade: (cidade: string) => void;
  onToggleBairro: (bairro: string) => void;
  onToggleTipo: (tipo: string) => void;
  onSelecionarNivel: (nivel: number) => void;
  onAlcanceChange: (value: number[]) => void;
  onPercentualChange: (value: number[]) => void;
  onLimpar: () => void;
  onAplicar: () => void;
  onCancelar: () => void;
}

const getTipoLiderancaLabel = (tipo: string) => {
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
  return tipos[tipo] || tipo;
};

export function FilterPanel({
  show,
  filtrosTemp,
  cidadesDisponiveis,
  bairrosDisponiveis,
  alcanceRange,
  percentualRange,
  onToggleConviteStatus,
  onToggleCidade,
  onToggleBairro,
  onToggleTipo,
  onSelecionarNivel,
  onAlcanceChange,
  onPercentualChange,
  onLimpar,
  onAplicar,
  onCancelar,
}: FilterPanelProps) {
  if (!show) return null;

  return (
    <div className="border-t bg-white flex flex-col" style={{ maxHeight: '60vh' }}>
      {/* Header fixo */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b bg-white">
        <h3 className="font-semibold text-sm">Filtros</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancelar}
          className="h-8 w-8 -mr-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Opções com scroll */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Status do Convite */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Status do Convite</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'pendente', label: 'Pendente' },
              { value: 'aceito', label: 'Aceito' }
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => onToggleConviteStatus(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filtrosTemp.conviteStatus.includes(value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cidade */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Cidade</label>
          <div className="flex flex-wrap gap-2">
            {cidadesDisponiveis.length > 0 ? (
              cidadesDisponiveis.map(cidade => (
                <button
                  key={cidade}
                  onClick={() => onToggleCidade(cidade)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filtrosTemp.cidades.includes(cidade)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cidade}
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Nenhuma cidade cadastrada</p>
            )}
          </div>
        </div>

        {/* Bairro */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Bairro</label>
          <div className="flex flex-wrap gap-2">
            {bairrosDisponiveis.length > 0 ? (
              bairrosDisponiveis.map(bairro => (
                <button
                  key={bairro}
                  onClick={() => onToggleBairro(bairro)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filtrosTemp.bairros.includes(bairro)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {bairro}
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">Nenhum bairro cadastrado</p>
            )}
          </div>
        </div>

        {/* Tipo de Liderança */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Tipo de Liderança</label>
          <div className="flex flex-wrap gap-2">
            {['comunitaria', 'religiosa', 'sindical', 'empresarial', 'politica', 'social', 'esportiva', 'cultural'].map(tipo => (
              <button
                key={tipo}
                onClick={() => onToggleTipo(tipo)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filtrosTemp.tipos.includes(tipo)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getTipoLiderancaLabel(tipo)}
              </button>
            ))}
          </div>
        </div>

        {/* Nível de Influência */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Nível de Influência</label>
          <div className="flex items-center gap-1 bg-gray-50 p-2 rounded-lg w-fit">
            {[1, 2, 3, 4, 5].map((nivel) => {
              const nivelSelecionado = filtrosTemp.niveis[0] || 0;
              const isPreenchida = nivel <= nivelSelecionado;
              return (
                <button
                  key={nivel}
                  onClick={() => onSelecionarNivel(nivel)}
                  className="p-1 hover:scale-110 transition-transform"
                  aria-label={`Selecionar ${nivel} estrela${nivel > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      isPreenchida
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Alcance Estimado */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Alcance Estimado: {alcanceRange[0]} - {alcanceRange[1]}
          </label>
          <RangeSlider
            value={[alcanceRange[0], alcanceRange[1]]}
            onChange={(val) => onAlcanceChange(val)}
            min={0}
            max={1000}
            step={10}
            className="mt-2"
          />
        </div>

        {/* Percentual Alcançado */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Percentual Alcançado: {percentualRange[0]}% - {percentualRange[1]}%
          </label>
          <RangeSlider
            value={[percentualRange[0], percentualRange[1]]}
            onChange={(val) => onPercentualChange(val)}
            min={0}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>
      </div>

      {/* Botões fixos no rodapé */}
      <div className="flex gap-2 px-5 py-3 border-t bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLimpar}
          className="h-9 text-xs"
        >
          Limpar filtros
        </Button>
        <Button
          onClick={onAplicar}
          size="sm"
          className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700"
        >
          Ver resultados
        </Button>
      </div>
    </div>
  );
}
