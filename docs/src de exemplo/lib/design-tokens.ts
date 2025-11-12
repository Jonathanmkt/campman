/**
 * Design Tokens para estados de interação
 * Este arquivo centraliza os estilos de interação para garantir consistência
 * em todos os componentes do sistema.
 */

export const interactionTokens = {
  // Foco e hover para inputs, selects, e campos de formulário
  input: {
    default: "border-input bg-transparent transition-colors",
    hover: "hover:border-primary",
    focus: "focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[3px]",
    disabled: "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
    error: "border-destructive ring-destructive/20",
  },
  
  // Foco e hover para itens de menu, dropdown, e listas
  menuItem: {
    default: "transition-colors",
    hover: "hover:bg-primary/10 hover:text-primary",
    focus: "focus:bg-primary/10 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50",
    active: "data-[state=active]:bg-primary/15 data-[state=active]:text-primary",
    disabled: "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
  },
  
  // Foco e hover para botões
  button: {
    default: "transition-colors",
    hover: "hover:bg-primary/90",
    focus: "focus-visible:ring-primary/50 focus-visible:ring-[3px]",
    disabled: "disabled:opacity-50 disabled:pointer-events-none",
  }
};

/**
 * Combina tokens de interação para criar strings de classes
 * @param tokenType O tipo de token (input, menuItem, button)
 * @param states Os estados a serem incluídos
 * @returns String com classes combinadas
 */
export function getInteractionClasses(
  tokenType: keyof typeof interactionTokens, 
  states: Array<keyof typeof interactionTokens[keyof typeof interactionTokens]> = ['default', 'hover', 'focus']
): string {
  const tokenGroup = interactionTokens[tokenType];
  return states.map(state => tokenGroup[state]).join(' ');
}
