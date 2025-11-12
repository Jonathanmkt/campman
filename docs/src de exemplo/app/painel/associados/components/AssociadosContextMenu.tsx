import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CreditCard, Wallet } from 'lucide-react';
import { Associado, Profile } from '@/types';

interface AssociadosContextMenuProps {
  children: React.ReactNode;
  associado: Associado;
  userProfile?: Profile;
  onCrachaClick?: (associado: Associado) => void;
  onMensalidadesClick?: (associado: Associado) => void;
}

/**
 * Menu de contexto para a tabela de associados
 * Exibe opções diferentes baseadas no perfil do usuário (secretário ou tesoureiro)
 */
export const AssociadosContextMenu: React.FC<AssociadosContextMenuProps> = ({
  children,
  associado,
  // userProfile usado apenas quando as linhas de verificação de papel forem descomentadas
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userProfile, 
  onCrachaClick,
  onMensalidadesClick
}) => {
  // Em modo de desenvolvimento, mostrar todas as opções para facilitar os testes
  // Em produção, descomente estas linhas para filtrar por papel
  // const mostrarOpcaoCracha = userProfile?.roles?.includes('secretario') || false;
  // const mostrarOpcaoMensalidades = userProfile?.roles?.includes('tesoureiro') || false;
  
  // Para desenvolvimento/teste, mostrar todas as opções
  const mostrarOpcaoCracha = true; 
  const mostrarOpcaoMensalidades = true;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50">
        {/* Menu para secretários - mostra a opção crachá */}
        {mostrarOpcaoCracha && (
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onCrachaClick) onCrachaClick(associado);
            }}
          >
            <CreditCard className="w-4 h-4 text-primary" />
            <span>Crachá</span>
          </DropdownMenuItem>
        )}
        
        {/* Menu para tesoureiros - mostra a opção mensalidades */}
        {mostrarOpcaoMensalidades && (
          <DropdownMenuItem 
            className="flex items-center gap-2 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onMensalidadesClick) onMensalidadesClick(associado);
            }}
          >
            <Wallet className="w-4 h-4 text-primary" />
            <span>Mensalidades</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
