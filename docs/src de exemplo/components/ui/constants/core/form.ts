import * as React from 'react';
import { cn } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';

// Definindo os tipos dos contextos
export type FormItemContextValue = {
  id: string;
}

export type FormFieldContextValue<TName = string> = {
  name: TName;
}

// Criando os contextos com valores padrão seguros
export const FormFieldContext = React.createContext<FormFieldContextValue>({ name: '' });
export const FormItemContext = React.createContext<FormItemContextValue>({ id: '' });

// Hook que acessa os contextos e o estado do campo no formulário
export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { formState } = useFormContext() || { formState: { errors: {} } };
  
  const fieldName = fieldContext?.name;
  
  // Se não tivermos nome do campo ou contexto de formulário, retornar valores padrão
  if (!fieldName) {
    return {
      error: undefined,
      formItemId: 'form-item',
      formDescriptionId: 'form-item-description',
      formMessageId: 'form-item-message',
    };
  }
  
  // Obter o erro do campo a partir do estado do formulário
  const error = formState.errors[fieldName as string];
  
  return {
    error,
    formItemId: `form-${fieldName}`,
    formDescriptionId: `form-${fieldName}-description`,
    formMessageId: `form-${fieldName}-message`,
  };
};
