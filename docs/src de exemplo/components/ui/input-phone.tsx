import * as React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface InputPhoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    // Função para limpar a string, mantendo apenas números
    const cleanNumber = (str: string) => str.replace(/\D/g, '');

    // Função para formatar o número baseado no comprimento
    const formatPhoneNumber = (number: string) => {
      const cleaned = cleanNumber(number);
      
      // Se não tiver números, retorna vazio
      if (cleaned.length === 0) return '';

      // Formata DDD
      if (cleaned.length <= 2) {
        return `(${cleaned}`;
      }

      // Decide se é celular (11 dígitos) ou fixo (10 dígitos)
      const isCellPhone = cleaned.length === 11;
      
      // Formata o resto do número
      if (isCellPhone) {
        // Formato: (XX) 9XXXX-XXXX
        const parts = [
          `(${cleaned.slice(0, 2)}`,
          cleaned.slice(2, 3),
          cleaned.slice(3, 7),
          cleaned.slice(7, 11)
        ].filter(Boolean);

        if (parts.length === 4) {
          return `${parts[0]}) ${parts[1]}${parts[2]}-${parts[3]}`;
        }
        return `${parts[0]}) ${parts.slice(1).join('')}`;
      } else {
        // Formato: (XX) XXXX-XXXX
        const parts = [
          `(${cleaned.slice(0, 2)}`,
          cleaned.slice(2, 6),
          cleaned.slice(6, 10)
        ].filter(Boolean);

        if (parts.length === 3) {
          return `${parts[0]}) ${parts[1]}-${parts[2]}`;
        }
        return `${parts[0]}) ${parts.slice(1).join('')}`;
      }
    };

    // Handler para mudanças no input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = cleanNumber(e.target.value);
      
      // Limita o tamanho máximo (11 dígitos para celular)
      if (newValue.length > 11) return;
      
      // Chama o onChange com o valor limpo (apenas números)
      onChange?.(newValue);
    };

    // Formata o valor para exibição
    const displayValue = formatPhoneNumber(value);

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={className}
        placeholder="Fixo ou Celular"
        {...props}
      />
    );
  }
);

InputPhone.displayName = 'InputPhone';

export { InputPhone };
