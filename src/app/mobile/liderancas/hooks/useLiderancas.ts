import { useState, useEffect } from 'react';
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

export function useLiderancas() {
  const [liderancas, setLiderancas] = useState<Lideranca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          lideranca.lideranca_area?.forEach((la: LiderancaArea) => {
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

  const handleAbrirLocalizacao = (lideranca: Lideranca) => {
    const areas = (lideranca as Lideranca & { lideranca_area?: LiderancaArea[] }).lideranca_area;
    const primeiraArea = areas?.[0]?.area;
    
    if (primeiraArea?.latitude && primeiraArea?.longitude) {
      const lat = primeiraArea.latitude;
      const lng = primeiraArea.longitude;
      const label = encodeURIComponent(`${primeiraArea.bairro || ''}, ${primeiraArea.cidade || ''}`.trim());
      
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`;
      window.open(mapsUrl, '_blank');
    }
  };

  useEffect(() => {
    fetchLiderancas();
  }, []);

  return {
    liderancas,
    isLoading,
    cidadesDisponiveis,
    bairrosDisponiveis,
    fetchLiderancas,
    handleCompartilharConvite,
    handleAbrirLocalizacao,
  };
}
