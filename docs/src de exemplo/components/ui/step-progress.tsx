import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: number;
  steps: {
    title: string;
    number: number;
  }[];
}

export function StepProgress({ currentStep, steps }: StepProgressProps) {
  return (
    <div className="w-full my-6 px-8 max-w-[700px] mx-auto">
      <div className="flex justify-between relative">
        {/* Linha de base (completa) */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-secondary" />
        
        {/* Linha de progresso com animação */}
        <motion.div 
          className="absolute top-5 left-0 h-1 bg-primary z-[5]"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.max(0, ((currentStep - 1) / (steps.length - 1)) * 100)}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isActive = currentStep >= step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div key={step.number} className="flex flex-col items-center z-10" style={{ width: `${100 / steps.length}%` }}>
              {/* Círculo com número */}
              <motion.div 
                className={cn(
                  "rounded-full flex items-center justify-center w-10 h-10 text-sm font-medium",
                  "border-2 z-10",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground" 
                    : "border-secondary bg-background text-muted-foreground"
                )}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isActive ? 1 : 0.8,
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--background)',
                  borderColor: isActive ? 'var(--primary)' : 'var(--secondary)',
                  color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {step.number}
              </motion.div>
              
              {/* Título do passo */}
              <motion.span 
                className="mt-2 text-xs font-medium text-center px-1"
                initial={{ opacity: 0.7 }}
                animate={{ 
                  opacity: isActive ? 1 : 0.7,
                  color: isActive ? 'var(--primary)' : 'var(--muted-foreground)'
                }}
                transition={{ duration: 0.3 }}
              >
                {step.title}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
