'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Search, MapPin, Star, Loader2, Share2, CheckCircle2, MessageCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RangeSlider } from '@/components/ui/range-slider';
import { NovaLiderancaForm } from './components/NovaLiderancaForm';
import type { Tables } from '@/types';

type Lideranca = Tables<'lideranca'> & {
  convite_status?: 'pendente' | 'aceito' | null;
  convite_token?: string | null;
  total_eleitores?: number;
  potencial_votos?: number;
};

type LiderancaArea = {
  area_id: string;
  area: {
    latitude: number | null;
    longitude: number | null;
    cidade: string | null;
    bairro: string | null;
  };
};

type Filtros = {
  conviteStatus: string[];
  cidades: string[];
  bairros: string[];
  tipos: string[];
  niveis: number[];
  alcanceMin: number | null;
  alcanceMax: number | null;
  percentualMin: number | null;
  percentualMax: number | null;
};

export default function CoordenadorPage() {
  const [liderancas, setLiderancas] = useState<Lideranca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChoiceDialogOpen, setIsChoiceDialogOpen] = useState(false);
  const [contactPickerAvailable, setContactPickerAvailable] = useState(false);
  const [isMobileBrowser, setIsMobileBrowser] = useState(false);
  const [prefillData, setPrefillData] = useState<{ nome?: string; telefone?: string } | null>(null);
  const [isImportingContact, setIsImportingContact] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    conviteStatus: [],
    cidades: [],
    bairros: [],
    tipos: [],
    niveis: [],
    alcanceMin: null,
    alcanceMax: null,
    percentualMin: null,
    percentualMax: null,
  });
  const [filtrosTemp, setFiltrosTemp] = useState<Filtros>(filtros);
  const [alcanceRange, setAlcanceRange] = useState<number[]>([0, 1000]);
  const [percentualRange, setPercentualRange] = useState<number[]>([0, 100]);
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState<string[]>([]);

  const fetchLiderancas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/mobile/liderancas');
      const result = await response.json();
      
      if (result.success) {
        setLiderancas(result.data || []);
        
        // Extrair cidades e bairros únicos das áreas
        const cidades = new Set<string>();
        const bairros = new Set<string>();
        
        result.data?.forEach((lideranca: Lideranca & { lideranca_area?: LiderancaArea[] }) => {
          lideranca.lideranca_area?.forEach((la) => {
            if (la.area.cidade) cidades.add(la.area.cidade);
            if (la.area.bairro) bairros.add(la.area.bairro);
          });
        });
        
        setCidadesDisponiveis(Array.from(cidades).sort());
        setBairrosDisponiveis(Array.from(bairros).sort());
      }
    } catch (error) {
      console.error('Erro ao carregar lideranças:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbrirLocalizacao = (lideranca: Lideranca) => {
    const areas = (lideranca as Lideranca & { lideranca_area?: LiderancaArea[] }).lideranca_area;
    const primeiraArea = areas?.[0]?.area;
    
    if (primeiraArea?.latitude && primeiraArea?.longitude) {
      const lat = primeiraArea.latitude;
      const lng = primeiraArea.longitude;
      const label = encodeURIComponent(`${primeiraArea.bairro || ''}, ${primeiraArea.cidade || ''}`.trim());
      
      // Tenta abrir no app de mapas padrão do dispositivo
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
      window.open(mapsUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchLiderancas();
  }, []);

  const calcularPercentual = (lideranca: Lideranca) => {
    const meta = (typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 1;
    return Math.round(((lideranca.total_eleitores || 0) / meta) * 100);
  };

  const filteredLiderancas = liderancas.filter(lideranca => {
    // Filtro de busca
    const matchSearch = lideranca.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lideranca.telefone?.includes(searchTerm) ||
      lideranca.bairro?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;

    // Filtro de status de convite
    if (filtros.conviteStatus.length > 0) {
      const status = lideranca.convite_status || 'sem_convite';
      if (!filtros.conviteStatus.includes(status)) return false;
    }

    // Filtro de cidade
    if (filtros.cidades.length > 0) {
      const areas = (lideranca as Lideranca & { lideranca_area?: LiderancaArea[] }).lideranca_area;
      const cidadesLideranca = areas?.map(la => la.area.cidade).filter(Boolean) || [];
      if (!filtros.cidades.some(c => cidadesLideranca.includes(c))) return false;
    }

    // Filtro de bairro
    if (filtros.bairros.length > 0) {
      const areas = (lideranca as Lideranca & { lideranca_area?: LiderancaArea[] }).lideranca_area;
      const bairrosLideranca = areas?.map(la => la.area.bairro).filter(Boolean) || [];
      if (!filtros.bairros.some(b => bairrosLideranca.includes(b))) return false;
    }

    // Filtro de tipo
    if (filtros.tipos.length > 0 && !filtros.tipos.includes(lideranca.tipo_lideranca || '')) {
      return false;
    }

    // Filtro de nível de influência
    if (filtros.niveis.length > 0 && !filtros.niveis.includes(lideranca.nivel_influencia || 0)) {
      return false;
    }

    // Filtro de alcance estimado
    const alcance = (typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 0;
    if (filtros.alcanceMin !== null && alcance < filtros.alcanceMin) return false;
    if (filtros.alcanceMax !== null && alcance > filtros.alcanceMax) return false;

    // Filtro de percentual alcançado
    const percentual = calcularPercentual(lideranca);
    if (filtros.percentualMin !== null && percentual < filtros.percentualMin) return false;
    if (filtros.percentualMax !== null && percentual > filtros.percentualMax) return false;

    return true;
  });

  const closeSheet = () => {
    setIsSheetOpen(false);
    setPrefillData(null);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setPrefillData(null);
    }
  };

  const handleLiderancaAdded = () => {
    closeSheet();
    fetchLiderancas();
  };

  const toggleConviteStatus = (status: string) => {
    setFiltrosTemp(prev => ({
      ...prev,
      conviteStatus: prev.conviteStatus.includes(status)
        ? prev.conviteStatus.filter(s => s !== status)
        : [...prev.conviteStatus, status]
    }));
  };

  const toggleCidade = (cidade: string) => {
    setFiltrosTemp(prev => ({
      ...prev,
      cidades: prev.cidades.includes(cidade)
        ? prev.cidades.filter(c => c !== cidade)
        : [...prev.cidades, cidade]
    }));
  };

  const toggleBairro = (bairro: string) => {
    setFiltrosTemp(prev => ({
      ...prev,
      bairros: prev.bairros.includes(bairro)
        ? prev.bairros.filter(b => b !== bairro)
        : [...prev.bairros, bairro]
    }));
  };

  const toggleTipoFiltro = (tipo: string) => {
    setFiltrosTemp(prev => ({
      ...prev,
      tipos: prev.tipos.includes(tipo)
        ? prev.tipos.filter(t => t !== tipo)
        : [...prev.tipos, tipo]
    }));
  };

  const selecionarNivelFiltro = (nivel: number) => {
    setFiltrosTemp(prev => ({
      ...prev,
      niveis: prev.niveis.includes(nivel) ? [] : [nivel]
    }));
  };

  const limparFiltros = () => {
    const filtrosVazios = {
      conviteStatus: [],
      cidades: [],
      bairros: [],
      tipos: [],
      niveis: [],
      alcanceMin: null,
      alcanceMax: null,
      percentualMin: null,
      percentualMax: null,
    };
    setFiltrosTemp(filtrosVazios);
    setAlcanceRange([0, 1000]);
    setPercentualRange([0, 100]);
    setShowFilters(false);
  };

  const aplicarFiltros = () => {
    setFiltros({
      ...filtrosTemp,
      alcanceMin: alcanceRange[0] > 0 ? alcanceRange[0] : null,
      alcanceMax: alcanceRange[1] < 1000 ? alcanceRange[1] : null,
      percentualMin: percentualRange[0] > 0 ? percentualRange[0] : null,
      percentualMax: percentualRange[1] < 100 ? percentualRange[1] : null,
    });
    setShowFilters(false);
  };

  const cancelarFiltros = () => {
    setFiltrosTemp(filtros);
    setAlcanceRange([
      filtros.alcanceMin ?? 0,
      filtros.alcanceMax ?? 1000
    ]);
    setPercentualRange([
      filtros.percentualMin ?? 0,
      filtros.percentualMax ?? 100
    ]);
    setShowFilters(false);
  };

  const contarFiltrosAtivos = () => {
    return filtros.conviteStatus.length +
           filtros.cidades.length +
           filtros.bairros.length +
           filtros.tipos.length + 
           filtros.niveis.length + 
           (filtros.alcanceMin !== null ? 1 : 0) + 
           (filtros.alcanceMax !== null ? 1 : 0) + 
           (filtros.percentualMin !== null ? 1 : 0) + 
           (filtros.percentualMax !== null ? 1 : 0);
  };

  const handleCompartilharConvite = (lideranca: Lideranca) => {
    if (!lideranca.convite_token || !lideranca.telefone) return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const linkConvite = `${appUrl}/mobile/onboarding?token=${lideranca.convite_token}`;
    const telefoneNumeros = lideranca.telefone.replace(/\D/g, '');
    const telefoneComDDI = telefoneNumeros.startsWith('55') ? telefoneNumeros : `55${telefoneNumeros}`;
    const primeiroNome = (lideranca.nome_completo || '').trim().split(/\s+/)[0] || lideranca.nome_completo;
    const mensagem = `Oi ${primeiroNome}, tudo bem?\n\nEstou participando da Campanha de Deputado Estadual do meu amigo Thiago Moura e gostaria de lhe convidar pra fazer parte.\n\nPra aceitar basta clicar no link abaixo e cadastrar tua senha.\n\n${linkConvite}`;
    const mensagemCodificada = encodeURIComponent(mensagem);

    window.open(`https://wa.me/${telefoneComDDI}?text=${mensagemCodificada}`, '_blank');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as Navigator & {
      contacts?: {
        select?: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ name?: string | string[]; tel?: string | string[] }>>;
      };
    };

    setContactPickerAvailable(Boolean(nav?.contacts?.select));
    setIsMobileBrowser(/android|iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

  const openManualForm = () => {
    setIsChoiceDialogOpen(false);
    setPrefillData(null);
    setIsSheetOpen(true);
  };

  const handleAddClick = () => {
    if (contactPickerAvailable && isMobileBrowser) {
      setIsChoiceDialogOpen(true);
      return;
    }
    openManualForm();
  };

  const handleImportFromContacts = async () => {
    const nav = navigator as Navigator & {
      contacts?: {
        select?: (properties: string[], options?: { multiple?: boolean }) => Promise<Array<{ name?: string | string[]; tel?: string | string[] }>>;
      };
    };

    if (!nav?.contacts?.select) {
      openManualForm();
      return;
    }

    try {
      setIsImportingContact(true);
      const [selected] = await nav.contacts.select(['name', 'tel'], { multiple: false });

      const rawName = Array.isArray(selected?.name) ? selected?.name[0] : selected?.name;
      const rawTel = Array.isArray(selected?.tel) ? selected?.tel[0] : selected?.tel;

      setPrefillData({
        nome: rawName ?? '',
        telefone: rawTel ?? '',
      });
    } catch (error) {
      console.error('Erro ao abrir contatos do aparelho', error);
      alert('Não foi possível acessar os contatos. Insira os dados manualmente.');
      setPrefillData(null);
    } finally {
      setIsChoiceDialogOpen(false);
      setIsImportingContact(false);
      setIsSheetOpen(true);
    }
  };

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

  return (
    <div className="flex flex-col h-screen">
      {/* Header fixo */}
      <header className="sticky top-0 z-10 bg-blue-600 text-white px-5 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Minhas Lideranças</h1>
          </div>
          <Badge variant="secondary" className="text-sm bg-blue-500 text-white px-3 py-1">
            {liderancas.length}
          </Badge>
        </div>
      </header>

      {/* Barra de busca e filtros */}
      <div className="sticky top-[60px] z-10 bg-gray-50 border-b">
        <div className="px-5 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, telefone ou bairro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 bg-white text-base"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 shrink-0 relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
              {contarFiltrosAtivos() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
                  {contarFiltrosAtivos()}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="border-t bg-white flex flex-col" style={{ maxHeight: '60vh' }}>
            {/* Header fixo */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b bg-white">
              <h3 className="font-semibold text-sm">Filtros</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelarFiltros}
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
                      onClick={() => toggleConviteStatus(value)}
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
                        onClick={() => toggleCidade(cidade)}
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
                        onClick={() => toggleBairro(bairro)}
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
                      onClick={() => toggleTipoFiltro(tipo)}
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
                        onClick={() => selecionarNivelFiltro(nivel)}
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
                  onChange={(val) => setAlcanceRange(val)}
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
                  onChange={(val) => setPercentualRange(val)}
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
                onClick={limparFiltros}
                className="h-9 text-xs"
              >
                Limpar filtros
              </Button>
              <Button
                onClick={aplicarFiltros}
                size="sm"
                className="flex-1 h-9 text-xs bg-blue-600 hover:bg-blue-700"
              >
                Ver resultados
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de lideranças */}
      <main className="flex-1 overflow-y-auto px-5 py-4 pb-28">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredLiderancas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            {contarFiltrosAtivos() > 0 || searchTerm ? (
              <>
                <Filter className="h-16 w-16 text-amber-500 mb-4" />
                <p className="text-base text-foreground font-medium">
                  Nenhum resultado encontrado
                </p>
                <p className="text-sm text-muted-foreground mt-2 mb-4">
                  {searchTerm && contarFiltrosAtivos() > 0
                    ? 'Tente ajustar sua busca ou remover alguns filtros'
                    : searchTerm
                    ? 'Tente usar outros termos de busca'
                    : 'Tente ajustar ou remover alguns filtros'}
                </p>
                {contarFiltrosAtivos() > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      limparFiltros();
                      aplicarFiltros();
                    }}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                )}
              </>
            ) : (
              <>
                <Users className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-base text-muted-foreground font-medium">
                  Nenhuma liderança cadastrada ainda
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Toque no botão + para adicionar
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLiderancas.map((lideranca) => (
              <Card key={lideranca.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-start p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {lideranca.nome_completo}
                        </h3>
                        {lideranca.convite_status === 'pendente' ? (
                          <button
                            onClick={() => handleCompartilharConvite(lideranca)}
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
                      
                      {/* Barra de progresso - linha inteira */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-foreground">
                            {lideranca.total_eleitores || 0} / {(typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 0} eleitores
                          </span>
                          <span className="text-xs font-semibold text-blue-600">
                            {Math.round(
                              ((lideranca.total_eleitores || 0) / 
                              ((typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 1)) * 100
                            )}%
                          </span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                ((lideranca.total_eleitores || 0) / 
                                ((typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 1)) * 100,
                                100
                              )}%`
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
                            <MessageCircle className="h-4 w-4" />
                            <span className="font-medium">{lideranca.telefone}</span>
                          </a>
                        )}
                        {(lideranca.bairro || lideranca.cidade) && (
                          <button
                            onClick={() => handleAbrirLocalizacao(lideranca)}
                            className="flex items-center gap-2 truncate py-1 hover:text-blue-600 active:text-blue-700 transition-colors text-left"
                          >
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>{[lideranca.bairro, lideranca.cidade].filter(Boolean).join(', ')}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isChoiceDialogOpen} onOpenChange={setIsChoiceDialogOpen}>
        <DialogContent className="sm:max-w-[380px] mx-4">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">Adicionar liderança</DialogTitle>
            <DialogDescription className="text-base">
              Escolha se prefere puxar dos contatos do aparelho ou digitar manualmente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Button
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-base"
              onClick={handleImportFromContacts}
              disabled={isImportingContact}
            >
              {isImportingContact ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Abrindo contatos...
                </>
              ) : (
                'Escolher dos contatos'
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full h-14 text-base"
              onClick={openManualForm}
              disabled={isImportingContact}
            >
              Digitar manualmente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botão flutuante para adicionar */}
      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <Button
          size="icon"
          className="fixed bottom-8 right-6 h-16 w-16 rounded-full aspect-square shadow-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition-transform"
          onClick={handleAddClick}
        >
          <Plus className="h-7 w-7" />
        </Button>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl px-5">
          <SheetHeader className="pb-6 pt-2">
            <SheetTitle className="text-xl">Nova Liderança</SheetTitle>
          </SheetHeader>
          <NovaLiderancaForm
            prefillData={prefillData}
            onSuccess={handleLiderancaAdded}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
