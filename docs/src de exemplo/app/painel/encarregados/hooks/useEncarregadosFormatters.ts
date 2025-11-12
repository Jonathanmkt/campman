/**
 * Hook com funções utilitárias para formatação de texto - Encarregados
 * Baseado no formatador usado em associados
 */
export const useEncarregadosFormatters = () => {
  /**
   * Gera as iniciais a partir de um nome completo
   */
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  /**
   * Formata um nome próprio seguindo regras de capitalização
   */
  const formatName = (name: string) => {
    if (!name) return '';
    
    // Lista de palavras que devem permanecer em minúsculas
    const lowercaseWords = [
      'da', 'de', 'di', 'do', 'du', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos',
      'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'por', 'para', 'com', 'sem',
      'sob', 'sobre', 'entre', 'até', 'após', 'desde', 'em', 'perante', 'segundo'
    ];
    
    return name
      .toLowerCase()
      .split(' ')
      .map((word, index, array) => {
        // Se for a primeira palavra ou a última, sempre capitaliza
        if (index === 0 || index === array.length - 1) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        // Se for uma palavra que deve ficar em minúscula
        if (lowercaseWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        // Se a palavra estiver em hífen, capitaliza cada parte
        if (word.includes('-')) {
          return word
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('-');
        }
        // Capitaliza palavras comuns
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  return {
    getInitials,
    formatName
  };
};

export default useEncarregadosFormatters;
