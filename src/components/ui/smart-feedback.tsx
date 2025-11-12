import { useEffect, useState } from 'react';
import { LoadingOverlay } from './loading-overlay';
import { FeedbackModal } from './feedback-modal';

interface SmartFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  action: () => Promise<{status: number}>;
  loadingMessage?: string;
  successMessage: string;
  errorMessage: string;
  loadingThreshold?: number;
}

export function SmartFeedback({
  isOpen,
  onClose,
  action,
  loadingMessage = "Processando...",
  successMessage,
  errorMessage,
  loadingThreshold = 300
}: SmartFeedbackProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    if (isOpen) {
      const execute = async () => {
        const loadingTimer = setTimeout(() => setIsLoading(true), loadingThreshold);
        
        try {
          const startTime = Date.now();
          const result = await action();
          clearTimeout(loadingTimer);
          
          // Se a ação foi mais rápida que o threshold, não mostra loading
          if (Date.now() - startTime < loadingThreshold) {
            setIsLoading(false);
          }
          
          // Lógica simples: 201 = sucesso, qualquer outro = erro
          setFeedback({
            show: true,
            type: result.status === 201 ? 'success' : 'error',
            message: result.status === 201 ? successMessage : errorMessage
          });
        } catch (error) {
          clearTimeout(loadingTimer);
          setIsLoading(false);
          setFeedback({
            show: true,
            type: 'error',
            message: errorMessage
          });
        }
      };

      execute();
    } else {
      setFeedback(prev => ({ ...prev, show: false }));
    }
  }, [isOpen, action, successMessage, errorMessage, loadingThreshold]);

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message={loadingMessage} />
      <FeedbackModal
        isOpen={feedback.show}
        onClose={() => {
          setFeedback(prev => ({ ...prev, show: false }));
          onClose();
        }}
        type={feedback.type}
        message={feedback.message}
      />
    </>
  );
}
