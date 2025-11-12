'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StepProgress } from '@/components/ui/step-progress';
import { StepBasicInfo } from './StepBasicInfo';
import { StepProductDetails } from './StepProductDetails';
import { StepAdditionalInfo } from './StepAdditionalInfo';
import { ProdutoState } from '../types/produtos-types';
import { ProductObservable } from '../store/productObservable';
import { useProductForm } from '../hooks/useProductForm';
import logger from '@/lib/logger';


interface NovoProductModalProps {
  onMountFeedback: (dadosProduto: any) => Promise<void>;
  isVisible: boolean;
  currentStep: ProdutoState;
}

export function NovoProductModal({ onMountFeedback, isVisible, currentStep }: NovoProductModalProps) {
  // Usar o form e submitForm do hook
  const { form, submitForm } = useProductForm();

  // Implementando a navegação entre etapas - apenas altera o estado do Observable
  const handleNextStep = async () => {
    logger.info('[NovoProductModal] Clicou em Avançar');
    
    // Se estamos na última etapa, submeter o formulário
    if (currentStep === ProdutoState.STEP3) {
      // Na última etapa, valida e extrai os dados
      try {
        // Usa a função de submit do hook
        const resultado = await submitForm();
        
        // Notifica a página do resultado para controle de feedback
        await onMountFeedback(resultado);
      } catch (error) {
        logger.error('[NovoProductModal] Erro ao finalizar formulário:', error);
        ProductObservable.create().setState(ProdutoState.ERRO);
      }
    } else {
      // Passos anteriores, apenas avança
      ProductObservable.create().setState(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    logger.info('[NovoProductModal] Clicou em Voltar');
    ProductObservable.create().setState(currentStep - 1);
  };
  
  const handleClose = () => {
    // Resetar o modal para o estado inicial
    ProductObservable.create().setState(ProdutoState.INICIAL);
  };
  // Estados 5 ou 6: desmonta o modal (SUCESSO ou ERRO)
  if (currentStep === ProdutoState.SUCESSO || currentStep === ProdutoState.ERRO) {
    return null;
  }

  // Títulos e descrições para cada etapa
  const stepTitles = [
    'Informações Básicas',
    'Detalhes do Produto',
    'Informações Adicionais'
  ];
  
  const stepDescriptions = [
    'Preencha os dados essenciais do produto',
    'Configure detalhes e especificações',
    'Adicione informações complementares'
  ];

  // u00cdndice para acessar o tu00edtulo e descriu00e7u00e3o atuais (currentStep vai de 1 a 3)
  const stepIndex = currentStep - 1;

  return (
    <Dialog 
      open={isVisible}
      onOpenChange={() => {
        ProductObservable.create().setState(ProdutoState.INICIAL);
      }}
    >
      <DialogContent className="max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
          <DialogDescription>{stepDescriptions[stepIndex]}</DialogDescription>
        </DialogHeader>

        {/* Barra de Progresso com Círculos Numerados */}
        <StepProgress 
          currentStep={currentStep} 
          steps={[
            { number: 1, title: stepTitles[0] },
            { number: 2, title: stepTitles[1] },
            { number: 3, title: stepTitles[2] },
          ]} 
        />

        {/* Steps do Formulário - com scroll */}
        <div className="py-4 overflow-y-auto flex-grow my-2">
          {currentStep === ProdutoState.STEP1 && <StepBasicInfo form={form} />}
          {currentStep === ProdutoState.STEP2 && <StepProductDetails form={form} />}
          {currentStep === ProdutoState.STEP3 && <StepAdditionalInfo form={form} />}
        </div>

        {/* Botu00f5es de Navegau00e7u00e3o */}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === ProdutoState.STEP1}
          >
            Voltar
          </Button>

          <Button onClick={handleNextStep}>
            {currentStep === ProdutoState.STEP3 ? 'Concluir' : 'Avançar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
