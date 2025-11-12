import React from 'react';

/**
 * Componente de cabeçalho da tabela de associados
 */
const AssociadosTableHeader: React.FC = () => {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm font-medium text-muted-foreground">
      <div className="col-span-1"></div> {/* Espaço para chevron */}
      <div className="col-span-1"></div> {/* Espaço para avatar */}
      <div className="col-span-2">Nome Completo</div>
      <div className="col-span-2">Matrícula</div>
      <div className="col-span-2">DRT</div>
      <div className="col-span-2">Bairro</div>
      <div className="col-span-1">Mensalidades</div>
      <div className="col-span-1 text-center">Ações</div>
    </div>
  );
};

export default AssociadosTableHeader;
