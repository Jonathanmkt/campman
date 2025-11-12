import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Função para mesclar classes do Tailwind de forma segura
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatadores
export const formatters = {
  // Formata data para exibição
  date: (date: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  },

  // Formata número para moeda
  currency: (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },

  // Remove caracteres especiais
  cleanString: (str: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, '');
  },

  // Formata telefone
  phone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return cleaned;
  }
};

// Validadores
export const validators = {
  // Valida email
  isValidEmail: (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Valida telefone
  isValidPhone: (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11;
  }
};
