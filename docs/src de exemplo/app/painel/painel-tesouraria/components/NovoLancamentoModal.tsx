'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

export function NovoLancamentoModal() {
  const [serie, setSerie] = useState('');
  const [inicial, setInicial] = useState('');
  const [final, setFinal] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [taloes, setTaloes] = useState<{inicial: number, final: number}[]>([]);
  const [open, setOpen] = useState(false);

  const calcularTaloes = () => {
    const numInicial = parseInt(inicial);
    const numFinal = parseInt(final);
    
    if (isNaN(numInicial) || isNaN(numFinal) || numInicial > numFinal) {
      return [];
    }

    const taloesCalculados = [];
    let atual = numInicial;
    
    while (atual <= numFinal) {
      const finalTalhao = Math.min(atual + 49, numFinal);
      taloesCalculados.push({
        inicial: atual,
        final: finalTalhao
      });
      atual = finalTalhao + 1;
    }
    
    return taloesCalculados;
  };

  const handleCalcular = () => {
    const taloesCalculados = calcularTaloes();
    setTaloes(taloesCalculados);
    setShowConfirmation(true);
  };

  const handleConfirmar = () => {
    // Aqui viria a lógica para salvar no banco de dados
    alert('Lançamento confirmado!');
    setOpen(false);
    // Limpar campos
    setSerie('');
    setInicial('');
    setFinal('');
    setShowConfirmation(false);
  };

  // URLs das animações Lottie (removidas por enquanto para simplificar)
  // Em uma implementação real, você pode usar o `useLottie` hook do lottie-react
  // ou carregar as animações de forma estática

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-amber-500/25 transition-all duration-300">
          <Plus className="mr-2 h-4 w-4" />
          Novo Lançamento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
            Novo Lançamento de Talões
          </DialogTitle>
        </DialogHeader>
        
        {/* Espaço reservado para animação */}
        <div className="flex justify-center -mt-6 -mb-4 h-32 items-center">
          <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center">
            <svg 
              className="w-16 h-16 text-amber-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serie" className="text-sm font-medium">
                Série
              </Label>
              <Input
                id="serie"
                type="number"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                placeholder="Ex: 1"
                className="h-11 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inicial" className="text-sm font-medium">
                Ticket Inicial
              </Label>
              <Input
                id="inicial"
                type="number"
                value={inicial}
                onChange={(e) => setInicial(e.target.value)}
                placeholder="Ex: 1001"
                className="h-11 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="final" className="text-sm font-medium">
                Ticket Final
              </Label>
              <Input
                id="final"
                type="number"
                value={final}
                onChange={(e) => setFinal(e.target.value)}
                placeholder="Ex: 1100"
                className="h-11 text-base"
              />
            </div>
          </div>
          
          {!showConfirmation && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Cada talão contém 50 tickets sequenciais</p>
            </div>
          )}
        </div>

        {showConfirmation && taloes.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="mb-3 flex items-center text-sm font-medium text-amber-800">
                <AlertCircle className="mr-2 h-4 w-4" />
                Resumo do Lançamento
              </h4>
              
              <div className="space-y-3 text-sm text-amber-700">
                <div className="flex justify-between">
                  <span>Total de Talões:</span>
                  <span className="font-semibold">{taloes.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Primeiro Talão:</span>
                  <span className="font-mono font-medium">
                    {taloes[0].inicial} a {taloes[0].final}
                  </span>
                </div>
                
                {taloes.length > 1 && (
                  <div className="flex justify-between">
                    <span>Último Talão:</span>
                    <span className="font-mono font-medium">
                      {taloes[taloes.length - 1].inicial} a {taloes[taloes.length - 1].final}
                    </span>
                  </div>
                )}
                
                <div className="pt-2 mt-3 border-t border-amber-100">
                  <p className="text-center font-medium">Deseja confirmar o lançamento?</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false);
              setShowConfirmation(false);
            }}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          
          {!showConfirmation ? (
            <Button 
              onClick={handleCalcular}
              disabled={!serie || !inicial || !final}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-amber-500/30 transition-all"
            >
              Calcular
            </Button>
          ) : (
            <Button 
              onClick={handleConfirmar}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-green-500/30 transition-all"
            >
              Confirmar Lançamento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Plus } from 'lucide-react';
