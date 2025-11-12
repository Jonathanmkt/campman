import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Associado } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useFormatters from '../hooks/useFormatters';
import { QRCodeSVG } from 'qrcode.react';

interface CrachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  associado: Associado | null;
}

export const CrachaModal: React.FC<CrachaModalProps> = ({
  isOpen,
  onClose,
  associado
}) => {
  const { getInitials } = useFormatters();
  const [displayName, setDisplayName] = useState<string>(associado?.nome_completo || '');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  
  // Data de vencimento (fictícia) - 1 ano a partir de hoje
  const dataVencimento = format(addMonths(new Date(), 12), 'MMM/yy', { locale: ptBR });
  
  if (!associado) return null;

  // Dados para QR code (fictício por enquanto)
  const qrCodeData = `SINGAERJ:${associado.id}:${associado.matricula}:${associado.drt || ''}`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <DialogHeader>
          <DialogTitle>Crachá do Associado</DialogTitle>
        </DialogHeader>
        
        {/* Visualização do Crachá */}
        <div className="w-full max-w-[360px] my-4">
          <div 
            className="aspect-[9/16] relative bg-primary rounded-lg shadow-lg overflow-hidden flex flex-col items-center"
          >
            {/* Cabeçalho do Crachá */}
            <div className="w-full bg-primary text-white text-center py-4 flex items-center justify-center">
              {/* Logotipo poderia ser substituído por Image do Next.js em uma futura otimização */}
              <img 
                src="/logo-singaerj-white.png" 
                alt="SINGAERJ" 
                className="h-12"
                onError={(e) => {
                  // Fallback se a imagem não existir
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="text-2xl font-bold tracking-wider ml-2">SINGAERJ</div>
            </div>
            
            {/* Foto do associado */}
            <div className="relative mt-8 rounded-full border-4 border-secondary shadow-md overflow-hidden">
              <Avatar className="w-32 h-32">
                <AvatarImage src={associado.foto || undefined} alt={associado.nome_completo} />
                <AvatarFallback className="bg-tertiary text-white text-2xl">
                  {getInitials(associado.nome_completo)}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Nome do associado com opção de editar */}
            <div className="mt-6 px-4 w-full flex flex-col items-center">
              {isEditingName ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white/90 text-primary border border-tertiary rounded px-2 py-1 text-center font-bold text-xl w-full"
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditingName(false)}
                    className="bg-secondary text-white hover:bg-secondary/80"
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center w-full">
                  <h1 className="text-white font-bold text-2xl text-center">{displayName}</h1>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => setIsEditingName(true)}
                    className="p-1 h-auto text-white hover:bg-white/20"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="w-full flex justify-center mt-1">
                <div className="h-0.5 w-16 bg-secondary"></div>
              </div>
              <div className="text-white text-center mt-2">Guardador</div>
            </div>
            
            {/* QR Code */}
            <div className="mt-4 bg-white rounded-lg p-2">
              <QRCodeSVG value={qrCodeData} size={150} />
            </div>
            
            {/* Informações adicionais */}
            <div className="flex justify-between w-full px-8 mt-6">
              <div className="text-center">
                <div className="text-xs text-white/80">MATRÍCULA</div>
                <div className="bg-tertiary text-white px-3 py-1 rounded-md font-bold">
                  {associado.matricula}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-white/80">DRT</div>
                <div className="bg-tertiary text-white px-3 py-1 rounded-md font-bold">
                  {associado.drt || '-'}
                </div>
              </div>
            </div>
            
            {/* Rodapé */}
            <div className="w-full mt-auto bg-tertiary p-3">
              <div className="text-center text-white text-sm">
                {associado.endereco_data?.logradouro ? (
                  <div>
                    {associado.endereco_data?.logradouro}, 
                    {associado.endereco_data?.bairro}
                  </div>
                ) : (
                  <div>Rua Visconde de Pirajá, Ipanema</div>
                )}
              </div>
            </div>
            
            {/* Validade */}
            <div className="absolute bottom-12 right-6">
              <div className="text-xs text-white mb-1">VALIDADE</div>
              <div className="bg-[#e63946] text-white px-2 py-1 rounded-sm text-center">
                {dataVencimento}
              </div>
            </div>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex justify-between w-full mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button 
            className="bg-primary text-white hover:bg-primary/80"
          >
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
