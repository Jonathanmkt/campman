/**
 * Remove todos os caracteres não numéricos de uma string
 */
export const cleanPhoneNumber = (str: string): string => {
  return str.replace(/\D/g, '');
};

/**
 * Formata um número de telefone para exibição
 * Exemplo: 
 * - Celular: 22988341238 -> (22) 98834-1238
 * - Fixo: 2226656541 -> (22) 2665-6541
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = cleanPhoneNumber(phone);
  
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
