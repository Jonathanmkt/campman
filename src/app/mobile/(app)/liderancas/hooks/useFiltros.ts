import { useState } from 'react';
import type { Tables } from '@/types';

type Lideranca = Tables<'lideranca'> & {
  convite_status?: 'pendente' | 'aceito' | null;
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

export type Filtros = {
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

export function useFiltros() {
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

  const calcularPercentual = (lideranca: Lideranca) => {
    const meta = (typeof lideranca.alcance_estimado === 'number' ? lideranca.alcance_estimado : lideranca.potencial_votos) || 1;
    return Math.round(((lideranca.total_eleitores || 0) / meta) * 100);
  };

  const filtrarLiderancas = (liderancas: Lideranca[], searchTerm: string) => {
    return liderancas.filter(lideranca => {
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
        const cidadesLideranca = areas?.map((la: LiderancaArea) => la.area.cidade).filter(Boolean) || [];
        if (!filtros.cidades.some(c => cidadesLideranca.includes(c))) return false;
      }

      // Filtro de bairro
      if (filtros.bairros.length > 0) {
        const areas = (lideranca as Lideranca & { lideranca_area?: LiderancaArea[] }).lideranca_area;
        const bairrosLideranca = areas?.map((la: LiderancaArea) => la.area.bairro).filter(Boolean) || [];
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

  return {
    showFilters,
    setShowFilters,
    filtros,
    filtrosTemp,
    alcanceRange,
    setAlcanceRange,
    percentualRange,
    setPercentualRange,
    filtrarLiderancas,
    toggleConviteStatus,
    toggleCidade,
    toggleBairro,
    toggleTipoFiltro,
    selecionarNivelFiltro,
    limparFiltros,
    aplicarFiltros,
    cancelarFiltros,
    contarFiltrosAtivos,
  };
}
