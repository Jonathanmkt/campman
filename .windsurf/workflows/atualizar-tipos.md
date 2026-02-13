---
description: Regenerar tipos TypeScript e schema legível do Supabase
---
Executar os dois comandos abaixo em sequência:

// turbo
1. Gerar tipos TypeScript e schema legível:
```
npm run update-types
```

2. Confirmar que os arquivos foram atualizados:
```
cat src/types/schema.md | head -15
```
