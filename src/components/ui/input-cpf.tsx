import * as React from 'react';
import { Input } from './input';

export interface InputCPFProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const InputCPF = React.forwardRef<HTMLInputElement, InputCPFProps>(
  ({ className, value = '', onChange, ...props }, ref) => {
    // Função para limpar a string, mantendo apenas números
    const cleanCPF = (str: string) => str.replace(/\D/g, '');

    // Função para formatar o CPF no padrão brasileiro: XXX.XXX.XXX-XX
    const formatCPF = (cpf: string) => {
      const cleaned = cleanCPF(cpf);
      
      // Se não tiver números, retorna vazio
      if (cleaned.length === 0) return '';

      // Formata com pontos e traço
      if (cleaned.length <= 3) {
        return cleaned;
      } else if (cleaned.length <= 6) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
      } else if (cleaned.length <= 9) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
      } else {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
      }
    };

    // Handler para mudanças no input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = cleanCPF(e.target.value);
      
      // Limita o tamanho máximo para 11 dígitos (CPF brasileiro)
      if (newValue.length > 11) return;
      
      // Chama o onChange com o valor limpo (apenas números, preservando como string)
      onChange?.(newValue);
    };

    // Formata o valor para exibição
    const displayValue = formatCPF(value);

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        className={className}
        placeholder="XXX.XXX.XXX-XX"
        inputMode="numeric"
        {...props}
      />
    );
  }
);

InputCPF.displayName = 'InputCPF';

export { InputCPF };
