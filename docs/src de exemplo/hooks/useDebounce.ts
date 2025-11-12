import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para evitar chamadas excessivas em inputs de busca
 * 
 * @param value Valor a ser debounced
 * @param delay Tempo de espera em ms
 * @returns Valor após o delay
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar timer para atualizar o valor após o delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timer se o valor mudar antes do delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
