import React from 'react';
import { Loading } from '@/components/ui/loading';

/**
 * Componente para exibir estado de carregamento
 */
const AssociadosLoading: React.FC = () => {
  return (
    <div className="w-full h-96 flex items-center justify-center">
      <Loading />
    </div>
  );
};

export default AssociadosLoading;
