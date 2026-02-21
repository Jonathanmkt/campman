'use client'

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Mail } from 'lucide-react';

/**
 * Tipos de feedback disponíveis:
 * - undefined: spinner de loading genérico
 * - 'success': confirmação verde
 * - 'error': erro vermelho
 * - 'processing': aguardando confirmação (azul Idealis + spinner)
 * - 'email': pagamento confirmado — orienta o usuário a verificar o e-mail
 */
type FeedbackType = 'success' | 'error' | 'processing' | 'email';

interface FeedbackModalProps {
  isOpen: boolean;
  type?: FeedbackType;
  message: string;
  /** Subtítulo opcional exibido abaixo da mensagem principal */
  subtitle?: string;
  onClose: () => void;
}

interface ModalConfig {
  icon: React.ReactNode;
  iconBg: string;
  pulseBg: string;
  circleBg: string;
}

export function FeedbackModal({ isOpen, type, message, subtitle, onClose }: FeedbackModalProps) {
  const [showLoading, setShowLoading] = React.useState(false);

  // Timer para loading
  React.useEffect(() => {
    if (isOpen && !type) {
      setShowLoading(true);
    }
    
    return () => {
      setShowLoading(false);
    };
  }, [isOpen, type]);

  // Config padrão quando type é undefined (loading genérico)
  const defaultConfig: ModalConfig = {
    icon: showLoading ? (
      <motion.div
        className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ) : null,
    iconBg: 'bg-[#0055c7]',
    pulseBg: 'bg-[#0055c7]/20',
    circleBg: 'bg-[#0055c7]/5'
  };

  // Configurações específicas para cada tipo de modal
  const configs: Record<FeedbackType, ModalConfig> = {
    success: {
      icon: <Check className="w-12 h-12 text-white" strokeWidth={3} />,
      iconBg: 'bg-green-500',
      pulseBg: 'bg-green-400/30',
      circleBg: 'bg-green-100'
    },
    error: {
      icon: <AlertCircle className="w-12 h-12 text-white" strokeWidth={3} />,
      iconBg: 'bg-red-500',
      pulseBg: 'bg-red-400/30',
      circleBg: 'bg-red-100'
    },
    processing: {
      icon: (
        <motion.div
          className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ),
      iconBg: 'bg-[#0055c7]',
      pulseBg: 'bg-[#0055c7]/20',
      circleBg: 'bg-[#0055c7]/5'
    },
    email: {
      icon: <Mail className="w-12 h-12 text-white" strokeWidth={1.5} />,
      iconBg: 'bg-[#0055c7]',
      pulseBg: 'bg-[#ffda42]/40',
      circleBg: 'bg-[#ffda42]/10'
    },
  };

  // Usa config padrão se type for undefined
  const config = type ? configs[type] : defaultConfig;

  // Handler para tecla Esc
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="bg-white rounded-2xl p-8 flex flex-col items-center gap-6 m-4 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Botão de fechar */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </motion.button>

            {/* Container do ícone com efeito de pulso */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
              className="relative"
            >
              {/* Círculo de fundo com animação de escala */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`absolute inset-0 ${config.circleBg} rounded-full`}
              />
              
              {/* Círculo pulsante */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 ${config.pulseBg} rounded-full`}
              />

              {/* Ícone */}
              <motion.div
                className={`relative w-24 h-24 rounded-full ${config.iconBg} flex items-center justify-center`}
                initial={{ rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, ease: "easeInOut" }}
                >
                  {config.icon}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Mensagem com animação de entrada */}
            <div className="flex flex-col items-center gap-2 text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="text-xl font-semibold text-gray-800"
              >
                {message}
              </motion.p>
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="text-sm text-gray-500 max-w-xs"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
