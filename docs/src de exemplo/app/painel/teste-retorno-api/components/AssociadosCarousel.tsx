import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, UserX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAreaAssociados } from '../hooks/useAreaAssociados';

interface AssociadosCarouselProps {
  areaId: number;
  onCountChange?: (count: number) => void;
}

export function AssociadosCarousel({ areaId, onCountChange }: AssociadosCarouselProps) {
  // Todos os hooks primeiro, no topo do componente
  const { associados, loading } = useAreaAssociados(areaId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const lastCountRef = useRef<number>(-1);
  
  // Dados do associado atual - calcular mesmo durante carregamento para evitar erros
  const currentAssociado = !loading && associados && associados.length > 0 
    ? associados[currentIndex] 
    : null;
    
  // Usar useMemo antes de qualquer retorno condicional
  const initials = useMemo(() => {
    if (!currentAssociado) return '';
    return currentAssociado.nome
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }, [currentAssociado]);
  
  const primeiroNome = currentAssociado ? currentAssociado.nome.split(' ')[0] : '';
  
  // Resetar o índice quando mudar de área
  useEffect(() => {
    setCurrentIndex(0);
  }, [areaId]);

  // Resetar erro da imagem quando mudar de associado
  useEffect(() => {
    setImageError(false);
  }, [currentAssociado]);

  // Notificar o componente pai sobre a quantidade de associados
  useEffect(() => {
    if (onCountChange && !loading && lastCountRef.current !== (associados?.length || 0)) {
      lastCountRef.current = associados?.length || 0;
      onCountChange(associados?.length || 0);
    }
  }, [associados?.length, loading, onCountChange]);

  // Auto-rotação do carrossel a cada 3 segundos
  useEffect(() => {
    if (!associados || associados.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % associados.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [associados]);

  // Handlers de navegação
  const goToPrevious = useCallback(() => {
    if (!associados || associados.length <= 1) return;
    setCurrentIndex((prev) => 
      prev === 0 ? associados.length - 1 : prev - 1
    );
  }, [associados]);

  const goToNext = useCallback(() => {
    if (!associados || associados.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % associados.length);
  }, [associados]);

  // Estado de carregamento
  if (loading) {
    return (
      <CarouselContainer>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </CarouselContainer>
    );
  }

  // Estado vazio - mostrar ícone UserX centralizado
  if (!associados || associados.length === 0) {
    return (
      <CarouselContainer>
        <UserX className="h-8 w-8 text-gray-400" />
      </CarouselContainer>
    );
  }

  return (
    <div className="relative w-24 h-full min-h-[120px] rounded-lg overflow-hidden bg-gray-200">
      {/* Conteúdo principal - foto ou iniciais */}
      {currentAssociado.foto && !imageError ? (
        <img
          src={currentAssociado.foto}
          alt={currentAssociado.nome}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      ) : (
        <div className="h-full w-full bg-primary/10">
          <img
            src={currentAssociado.sexo === 'Feminino' ? '/icone_assoc_feminino.png' : '/icone_assoc_masculino.png'}
            alt={`Ícone ${currentAssociado.sexo === 'Feminino' ? 'feminino' : 'masculino'}`}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Overlay com nome - verde escuro 50% transparente */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-emerald-800/50 text-[11px] font-medium text-white truncate py-0.5 px-2 text-center" 
          title={currentAssociado.nome}>
          {primeiroNome}
        </div>
      </div>

      {/* Controles de navegação */}
      {associados.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-1 top-1/2 z-10 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full bg-white/70 hover:bg-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-3 w-3 text-gray-700" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 z-10 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full bg-white/70 hover:bg-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-3 w-3 text-gray-700" />
          </Button>
        </>
      )}
    </div>
  );
}

// Componente auxiliar para manter consistência no container
function CarouselContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-24 h-full min-h-[120px] rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
      {children}
    </div>
  );
}
