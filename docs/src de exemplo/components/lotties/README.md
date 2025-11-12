# Componentes Lottie

Este diretório contém componentes reutilizáveis para animações Lottie.

## Componentes disponíveis

1. **LoadingLottie** - Animação de carregamento
2. **CheckedLottie** - Animação de verificação/sucesso

## Como usar

```tsx
import { LoadingLottie, CheckedLottie } from '@/components/lotties';

// Na sua página ou componente
const MyComponent = () => {
  return (
    <div>
      {/* Exemplo de animação de carregamento */}
      <LoadingLottie width={80} height={80} className="my-4" />
      
      {/* Exemplo de animação de verificação */}
      <CheckedLottie width={50} height={50} />
    </div>
  );
};
```

## Propriedades

Ambos os componentes aceitam as seguintes props:

- `width`: Largura da animação (padrão: 100)
- `height`: Altura da animação (padrão: 100)
- `className`: Classes CSS adicionais

## Dependência

Este componente requer a biblioteca `@lottiefiles/dotlottie-react`.

Para instalar:

```bash
npm install @lottiefiles/dotlottie-react
# ou
yarn add @lottiefiles/dotlottie-react
```
