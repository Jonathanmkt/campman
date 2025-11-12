# API Supabase

Este diretório contém todas as rotas de API que interagem diretamente com o Supabase. A estrutura foi organizada para separar claramente as operações que envolvem o Supabase de outras APIs do sistema.

## Estrutura de Diretórios

```
/api/supabase/
  ├── associados/              # Operações relacionadas a associados
  │   ├── create/              # Criar novo associado
  │   ├── [id]/                # Operações em um associado específico
  │   │   ├── route.ts         # GET, PUT, DELETE
  │   │   └── upload-foto/     # Upload de foto para um associado
  │   └── route.ts             # Listar associados
  └── outros-recursos/         # Outros recursos do Supabase
```

## Segurança

Todas as rotas neste diretório usam o cliente server-side do Supabase (`createClient` de `@/lib/supabase/server`), que utiliza a chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`) para operações privilegiadas. Isso garante que:

1. As operações de escrita são realizadas com permissões adequadas
2. As chaves sensíveis não são expostas ao cliente
3. As políticas de segurança do Supabase são respeitadas

## Padrão de Implementação

Cada rota segue um padrão consistente:

1. Recebe dados do cliente
2. Valida os dados (quando necessário)
3. Cria um cliente Supabase server-side
4. Executa operações no Supabase
5. Retorna uma resposta padronizada

## Logs

Todas as operações são registradas usando o sistema de log centralizado (`@/lib/logger`), facilitando o diagnóstico de problemas.
