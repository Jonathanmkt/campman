# Regras de Endpoints Supabase — Idealis Core

> Padrão obrigatório para TODOS os desenvolvedores (humanos e IAs) ao criar ou modificar endpoints que interagem com o Supabase.

---

## 1. Clients Supabase — Qual usar?

Existem **3 clients** centralizados em `src/lib/supabase/`. NUNCA crie clients avulsos.

| Client | Arquivo | Quando usar |
|---|---|---|
| **Browser** | `@/lib/supabase/client` | Hooks e componentes client-side (`'use client'`). Respeita RLS. |
| **Server** | `@/lib/supabase/server` | API Routes onde o usuário está autenticado via cookies. Respeita RLS. **Preferência padrão.** |
| **Admin** | `@/lib/supabase/admin` | API Routes que precisam bypassar RLS (auth.admin, operações sem sessão). **Usar com cautela.** |

### Regras de import

```typescript
// ✅ CORRETO — Client-side (hooks, componentes 'use client')
import { createClient } from '@/lib/supabase/client'

// ✅ CORRETO — Server-side (API Routes com sessão do usuário)
import { createClient } from '@/lib/supabase/server'

// ✅ CORRETO — Server-side admin (API Routes que bypassam RLS)
import { createAdminClient } from '@/lib/supabase/admin'

// ❌ PROIBIDO — Nunca criar client manualmente
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key) // NÃO FAZER
```

### Quando usar Admin vs Server

- **Server** (padrão): Qualquer endpoint onde o usuário está logado. O RLS filtra automaticamente por `campanha_id`.
- **Admin**: Apenas quando necessário bypassar RLS — ex: confirmar convite (usuário ainda não tem sessão), operações `auth.admin.*`, criar usuários.

---

## 2. Estrutura de API Routes

### Path padrão

```
src/app/api/supabase/[recurso]/route.ts          → CRUD principal
src/app/api/supabase/[recurso]/[id]/route.ts      → Operações por ID
src/app/api/supabase/[recurso]/[id]/[sub]/route.ts → Sub-recursos
src/app/api/mobile/[recurso]/route.ts              → Endpoints mobile (podem usar admin)
```

### Template de API Route (Server — padrão)

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Tables } from '@/types'

type MeuRecurso = Tables<'nome_tabela'>

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('nome_tabela')
      .select('*')

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, data: null },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, error: null, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', data: null },
      { status: 500 }
    )
  }
}
```

### Template de API Route (Admin — quando necessário)

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient() // SEM await (não é async)
    
    // ... operações admin
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', data: null },
      { status: 500 }
    )
  }
}
```

---

## 3. Formato de Resposta Padrão

TODAS as API Routes devem retornar o mesmo formato:

```typescript
interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}
```

**Exemplos:**

```typescript
// Sucesso
{ success: true, data: { id: '...', nome: '...' }, error: null }

// Erro
{ success: false, data: null, error: 'Mensagem do erro' }

// Lista com paginação
{ success: true, data: [...], error: null, count: 100, page: 1, limit: 10, totalPages: 10 }
```

---

## 4. Tipagem

- Sempre importar tipos de `@/types` (gerados automaticamente pelo Supabase)
- Usar `Tables<'nome_tabela'>` para tipo de leitura
- Usar `TablesInsert<'nome_tabela'>` para tipo de inserção
- Usar `TablesUpdate<'nome_tabela'>` para tipo de atualização

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/types'

type Area = Tables<'area'>
type AreaInsert = TablesInsert<'area'>
type AreaUpdate = TablesUpdate<'area'>
```

---

## 5. Segurança

- **NUNCA** expor `SUPABASE_SERVICE_ROLE_KEY` no frontend
- **NUNCA** criar clients com service_role fora de `src/lib/supabase/admin.ts`
- **SEMPRE** usar o Server Client (com RLS) como padrão
- **SEMPRE** validar inputs com Zod ou TypeScript antes de queries
- O RLS com `tenant_isolation` já filtra por `campanha_id` automaticamente — não precisa filtrar manualmente nas queries quando usar Server Client

---

## 6. Checklist para Novos Endpoints

- [ ] Usa client centralizado (`server`, `client` ou `admin`)?
- [ ] Resposta segue formato `{ success, data, error }`?
- [ ] Tipos importados de `@/types`?
- [ ] Inputs validados antes da query?
- [ ] Tratamento de erro com try/catch?
- [ ] Não expõe dados sensíveis na resposta?
