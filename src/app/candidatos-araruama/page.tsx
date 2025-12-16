'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Users, FileText, Filter, X } from 'lucide-react';
import 'jspdf-autotable';

interface Candidato {
  ANO_ELEICAO: number;
  NUM_TURNO: number;
  NOME_URNA_CANDIDATO: string;
  NUMERO_CANDIDATO: string;
  SIGLA_PARTIDO: string;
  DESC_SIT_TOT_TURNO: string;
  QT_VOTOS_NOMINAIS: number;
  POSICAO?: number;
  STATUS_DETALHADO?: string;
}

interface ApiResponse {
  success: boolean;
  total: number;
  municipio: string;
  estado: string;
  cargo: string;
  ano: number;
  eleitos: number;
  data: Candidato[];
  source: string;
  note?: string;
  error?: string;
}

export default function CandidatosAraruamaPage() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [candidatosFiltrados, setCandidatosFiltrados] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // Estados dos filtros
  const [filtroAtivo, setFiltroAtivo] = useState(false);
  const [votosMinimo, setVotosMinimo] = useState<string>('');
  const [votosMaximo, setVotosMaximo] = useState<string>('');

  const carregarCandidatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/candidatos-araruama');
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar candidatos');
      }

      setApiData(data);
      setCandidatos(data.data);
      setCandidatosFiltrados(data.data); // Inicializar com todos os candidatos
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Função para aplicar filtros
  const aplicarFiltros = () => {
    const minimo = votosMinimo ? parseInt(votosMinimo) : 0;
    const maximo = votosMaximo ? parseInt(votosMaximo) : Infinity;
    
    if (minimo > maximo && votosMaximo !== '') {
      setError('O valor mínimo não pode ser maior que o máximo');
      return;
    }
    
    const filtrados = candidatos.filter(candidato => {
      const votos = candidato.QT_VOTOS_NOMINAIS || 0;
      return votos >= minimo && votos <= maximo;
    });
    
    setCandidatosFiltrados(filtrados);
    setFiltroAtivo(votosMinimo !== '' || votosMaximo !== '');
    setError(null);
  };

  // Função para limpar filtros
  const limparFiltros = () => {
    setVotosMinimo('');
    setVotosMaximo('');
    setCandidatosFiltrados(candidatos);
    setFiltroAtivo(false);
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    carregarCandidatos();
  }, []);

  const gerarPDF = async () => {
    const dadosParaPDF = filtroAtivo ? candidatosFiltrados : candidatos;
    if (dadosParaPDF.length === 0) return;
    
    setGeneratingPdf(true);
    
    try {
      // Importação dinâmica para reduzir bundle size
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text('Candidatos a Vereador - Araruama (RJ) 2024', 14, 15);
      
      // Subtítulo
      doc.setFontSize(12);
      let yPosition = 25;
      
      if (filtroAtivo) {
        const minimo = votosMinimo || '0';
        const maximo = votosMaximo || '∞';
        doc.text(`Filtro aplicado: ${minimo} a ${maximo} votos`, 14, yPosition);
        yPosition += 7;
      }
      
      doc.text(`Total de candidatos: ${dadosParaPDF.length}`, 14, yPosition);
      yPosition += 7;
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, yPosition);

      // Preparar dados para a tabela
      const colunas = ['#', 'Nome', 'Número', 'Partido', 'Votos', 'Situação'];
      const linhas = dadosParaPDF.map((candidato, index) => [
        index + 1,
        candidato.NOME_URNA_CANDIDATO,
        candidato.NUMERO_CANDIDATO,
        candidato.SIGLA_PARTIDO,
        candidato.QT_VOTOS_NOMINAIS?.toLocaleString('pt-BR') || '0',
        candidato.DESC_SIT_TOT_TURNO,
      ]);

      // Gerar tabela
      autoTable(doc, {
        startY: yPosition + 10,
        head: [colunas],
        body: linhas,
        margin: { top: 40, right: 14, bottom: 20, left: 14 },
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [26, 111, 127],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 27.5 },
          4: { halign: 'center', cellWidth: 20 },
          5: { cellWidth: 40 },
        },
      });

      // Salvar PDF
      const dateSuffix = new Date().toISOString().split('T')[0];
      const nomeArquivo = filtroAtivo 
        ? (() => {
            const minimoValor = votosMinimo ? parseInt(votosMinimo, 10) : 0;
            const maximoValor = votosMaximo ? parseInt(votosMaximo, 10) : null;
            const faixaTexto = maximoValor !== null
              ? `${minimoValor}_a_${maximoValor}`
              : `${minimoValor}_mais`;
            return `candidatos_araruama_2024_filtrado_${faixaTexto}_${dateSuffix}.pdf`;
          })()
        : `candidatos_araruama_2024_completo_${dateSuffix}.pdf`;
      
      doc.save(nomeArquivo);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getSituacaoBadgeVariant = (situacao: string) => {
    if (situacao?.includes('ELEITO')) return 'default';
    if (situacao?.includes('NÃO ELEITO')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Candidatos a Vereador - Araruama/RJ 2024
        </h1>
        <p className="text-muted-foreground">
          Lista completa de candidatos às eleições municipais de 2024
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Button 
          onClick={carregarCandidatos} 
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Carregar Lista Completa
            </>
          )}
        </Button>

        {candidatos.length > 0 && (
          <Button 
            onClick={gerarPDF}
            disabled={generatingPdf}
            variant="outline"
            size="lg"
          >
            {generatingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Baixar PDF ({filtroAtivo ? candidatosFiltrados.length : candidatos.length} candidatos{filtroAtivo ? ' filtrados' : ''})
              </>
            )}
          </Button>
        )}
      </div>

      {/* Filtros de Votação */}
      {candidatos.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrar por Votação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="votos-minimo">Votos Mínimo</Label>
                <Input
                  id="votos-minimo"
                  type="number"
                  placeholder="Ex: 100"
                  value={votosMinimo}
                  onChange={(e) => setVotosMinimo(e.target.value)}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="votos-maximo">Votos Máximo</Label>
                <Input
                  id="votos-maximo"
                  type="number"
                  placeholder="Ex: 2000"
                  value={votosMaximo}
                  onChange={(e) => setVotosMaximo(e.target.value)}
                  min="0"
                />
              </div>
              
              <Button onClick={aplicarFiltros} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtro
              </Button>
              
              {filtroAtivo && (
                <Button onClick={limparFiltros} variant="outline" className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            
            {filtroAtivo && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Filtro ativo:</strong> Mostrando {candidatosFiltrados.length} candidatos 
                  {votosMinimo && ` com pelo menos ${parseInt(votosMinimo).toLocaleString('pt-BR')} votos`}
                  {votosMaximo && ` e no máximo ${parseInt(votosMaximo).toLocaleString('pt-BR')} votos`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {candidatos.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>✅ Total: <strong>{candidatos.length}</strong> candidatos</span>
              <span>📄 Fonte: <strong>{apiData?.source || 'TSE'}</strong></span>
              <span>🗳️ Município: <strong>Araruama/RJ</strong></span>
              <span>📅 Ano: <strong>2024</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {(filtroAtivo ? candidatosFiltrados : candidatos).length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(filtroAtivo ? candidatosFiltrados : candidatos).map((candidato, index) => (
            <Card key={`${candidato.NUMERO_CANDIDATO}-${index}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{candidato.NOME_URNA_CANDIDATO}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Nº {candidato.NUMERO_CANDIDATO}</Badge>
                  <Badge variant="secondary">{candidato.SIGLA_PARTIDO}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Votos:</span>
                    <span className="font-medium">{candidato.QT_VOTOS_NOMINAIS?.toLocaleString('pt-BR') || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Situação:</span>
                    <Badge variant={getSituacaoBadgeVariant(candidato.DESC_SIT_TOT_TURNO)}>
                      {candidato.DESC_SIT_TOT_TURNO}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {candidatos.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            {filtroAtivo 
              ? `Exibindo ${candidatosFiltrados.length} de ${candidatos.length} candidatos (filtrados)`
              : `Total de ${candidatos.length} candidatos carregados`
            }
          </p>
        </div>
      )}
    </div>
  );
}
