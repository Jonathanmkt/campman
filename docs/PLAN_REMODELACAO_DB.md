# Plano de Remodelação do Banco de Dados — Idealis Core

> **Data:** 13/02/2026
> **Projeto Supabase:** `xkqtrwbnionpbjziilgy`
> **Schema de referência:** `src/types/schema.md` (gerado automaticamente)
> **Status:** PLANEJAMENTO (não executar migrations sem aprovação)

---

## 1. Diagnóstico do Estado Atual

### 1.1 Números

| Métrica | Valor |
|---|---|
| Total de tabelas | 33 |
| Com RLS ativado | 6 (18%) |
| Sem RLS | 27 (82%) ⚠️ |
| Tabelas com dados | 5 (profiles: 3, area: 2, lideranca: 2, lideranca_area: 2, convites: 2) |
| Tabelas vazias | 28 |
| Total de colunas | 562 |

### 1.2 Tabelas Existentes (agrupadas por domínio)

**Campanha / Estrutura Política:**
- `profiles` — Usuários do sistema (3 registros)
- `colaborador` — Colaboradores com dados de trabalho
- `coordenador_regional` — Coordenadores regionais
- `coordenador_regional_municipio` — Vínculo coordenador ↔ município
- `lideranca` — Lideranças comunitárias (2 registros)
- `lideranca_area` — Vínculo liderança ↔ área (2 registros)
- `lideranca_eleitor` — Vínculo liderança ↔ eleitor
- `eleitor` — Cadastro de eleitores
- `convites` — Convites via WhatsApp (2 registros)

**Geográfico:**
- `municipio` — Municípios
- `area` — Áreas geográficas (2 registros)

**Organizacional:**
- `departamento` — Departamentos/núcleos
- `equipe` — Equipes de trabalho
- `colaborador_departamento` — Vínculo colaborador ↔ departamento
- `colaborador_equipe` — Vínculo colaborador ↔ equipe

**Eventos e Materiais:**
- `evento` — Eventos da campanha
- `equipamento` — Equipamentos
- `material` — Materiais/suprimentos

**Gestão de Projetos:**
- `projects`, `tasks`, `sprints`, `milestones`
- `labels`, `workflows`, `categoria_projeto`
- `project_baselines`, `task_baseline_snapshots`
- `task_dependencies`, `task_resources`
- `time_entries`, `projeto_equipe`

**Pesquisa:**
- `pesquisa_quantitativa`

**Sistema (PostGIS):**
- `spatial_ref_sys` — Tabela interna do PostGIS (ignorar)

### 1.3 Problemas Identificados

1. **Sem isolamento multi-tenant** — Nenhuma tabela tem `campanha_id`
2. **RLS desativado em 27 tabelas** — Qualquer usuário autenticado vê tudo
3. **Sem estrutura financeira** — Não existe nenhuma tabela de planos, pagamentos ou PIX
4. **Sem role "admin"** — Check constraint de `profiles.roles` só aceita: coordenador, supervisor, colaborador
5. **Hardcodes geográficos** — `area.estado` tem default `'RJ'::text`
6. **Check constraint de convites limitado** — Só aceita: lideranca, coordenador, colaborador (falta admin e eleitor)

---

## 2. Novas Tabelas a Criar

### 2.1 `campanha` — Tenant Principal

> Cada campanha é um "inquilino" do sistema. Todos os dados pertencem a uma campanha.

```
campanha {
  id: uuid (PK, default gen_random_uuid())
  nome: text NOT NULL                    -- Ex: "Campanha Deputado Estadual 2026"
  nome_candidato: text NOT NULL          -- Ex: "João Silva"
  cargo_pretendido: text NOT NULL        -- enum: deputado_estadual, deputado_federal, vereador, prefeito, senador, governador
  partido: text                          -- Ex: "PL", "PT", "MDB"
  numero_candidato: text                 -- Ex: "12345"
  uf: text NOT NULL                      -- 2 chars, ex: "RJ", "SP" (IRREVERSÍVEL após criação)
  cidade: text                           -- Nullable, apenas para cargos municipais
  foto_candidato_url: text               -- Avatar do candidato
  foto_capa_desktop_url: text
  foto_capa_mobile_url: text
  tema_cores: text DEFAULT 'azul'        -- enum de temas pré-definidos
  status: text DEFAULT 'ativa'           -- enum: ativa, pausada, encerrada
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
}
```

**Check Constraints:**
- `cargo_pretendido IN ('deputado_estadual', 'deputado_federal', 'vereador', 'prefeito', 'senador', 'governador')`
- `length(uf) = 2`
- `status IN ('ativa', 'pausada', 'encerrada')`

---

### 2.2 `campanha_membro` — Vínculo Usuário ↔ Campanha

> Define quem pertence a qual campanha e com qual papel.

```
campanha_membro {
  id: uuid (PK, default gen_random_uuid())
  campanha_id: uuid NOT NULL (FK → campanha.id)
  profile_id: uuid NOT NULL (FK → profiles.id)
  role: text NOT NULL                    -- enum: admin, colaborador, coordenador, lideranca, eleitor
  convidado_por: uuid (FK → profiles.id, nullable)
  status: text DEFAULT 'ativo'           -- enum: ativo, inativo, pendente
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
  UNIQUE(campanha_id, profile_id)
}
```

---

### 2.3 `plano` — Planos de Assinatura

> Define os planos disponíveis no SaaS. Inclui plano "cortesia" para clientes da empresa Idealis.

```
plano {
  id: uuid (PK, default gen_random_uuid())
  nome: text NOT NULL                    -- Ex: "Básico", "Profissional", "Enterprise", "Cortesia Idealis"
  slug: text NOT NULL UNIQUE             -- Ex: "basico", "profissional", "enterprise", "cortesia"
  descricao: text
  tipo: text NOT NULL DEFAULT 'pago'     -- enum: pago, cortesia, trial
  valor_mensal: numeric DEFAULT 0        -- Em reais (R$). Cortesia = 0
  valor_anual: numeric DEFAULT 0         -- Desconto para pagamento anual
  limite_eleitores: integer              -- Null = ilimitado
  limite_liderancas: integer             -- Null = ilimitado
  limite_colaboradores: integer          -- Null = ilimitado
  limite_storage_mb: integer DEFAULT 500 -- Limite de storage em MB
  funcionalidades: jsonb                 -- JSON com features habilitadas
  ativo: boolean DEFAULT true
  ordem_exibicao: integer DEFAULT 0      -- Para ordenar na tela de planos
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
}
```

**Nota sobre cortesia:** Quando `tipo = 'cortesia'`, o `valor_mensal` e `valor_anual` são 0. Os limites podem ser iguais aos do plano mais alto. Clientes da empresa Idealis recebem esse plano automaticamente.

---

### 2.4 `assinatura` — Assinatura de uma Campanha a um Plano

> Vincula uma campanha a um plano, com datas de vigência e status.

```
assinatura {
  id: uuid (PK, default gen_random_uuid())
  campanha_id: uuid NOT NULL (FK → campanha.id)
  plano_id: uuid NOT NULL (FK → plano.id)
  status: text DEFAULT 'ativa'           -- enum: ativa, cancelada, suspensa, expirada, trial
  data_inicio: date NOT NULL
  data_fim: date                         -- Null = sem data de expiração (cortesia permanente)
  data_proximo_pagamento: date           -- Null para cortesia
  ciclo: text DEFAULT 'mensal'           -- enum: mensal, anual, cortesia
  valor_atual: numeric DEFAULT 0         -- Valor que está sendo cobrado (pode ter desconto)
  motivo_cortesia: text                  -- Preenchido quando tipo do plano = cortesia
  cancelado_em: timestamptz
  motivo_cancelamento: text
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
}
```

**Check Constraints:**
- `status IN ('ativa', 'cancelada', 'suspensa', 'expirada', 'trial')`
- `ciclo IN ('mensal', 'anual', 'cortesia')`

---

### 2.5 `pagamento` — Registro de Pagamentos

> Cada pagamento realizado (ou tentado) por uma campanha.

```
pagamento {
  id: uuid (PK, default gen_random_uuid())
  assinatura_id: uuid NOT NULL (FK → assinatura.id)
  campanha_id: uuid NOT NULL (FK → campanha.id)  -- Desnormalizado para facilitar queries
  valor: numeric NOT NULL                -- Valor cobrado
  status: text DEFAULT 'pendente'        -- enum: pendente, processando, pago, falhou, cancelado, reembolsado
  metodo: text NOT NULL                  -- enum: pix, cartao_credito, boleto
  referencia_externa: text               -- ID da transação no gateway de pagamento
  gateway: text                          -- Ex: "mercado_pago", "stripe", "asaas"
  data_vencimento: date
  data_pagamento: timestamptz            -- Quando foi efetivamente pago
  tentativas: integer DEFAULT 0          -- Número de tentativas de cobrança
  erro_mensagem: text                    -- Mensagem de erro se falhou
  metadata: jsonb                        -- Dados extras do gateway
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
}
```

---

### 2.6 `pix` — Registro de Transações PIX

> Tabela específica para persistir o ciclo de vida de um PIX: criação do QR Code/copia-e-cola → aguardando pagamento → pago (via webhook).

```
pix {
  id: uuid (PK, default gen_random_uuid())
  pagamento_id: uuid NOT NULL (FK → pagamento.id)
  campanha_id: uuid NOT NULL (FK → campanha.id)  -- Desnormalizado para facilitar queries
  
  -- Dados do PIX gerado pelo gateway
  txid: text UNIQUE                      -- ID da transação PIX (gerado pelo gateway)
  qr_code: text                          -- Código do QR Code (payload completo)
  qr_code_base64: text                   -- Imagem do QR Code em base64
  copia_cola: text                       -- Código "copia e cola" do PIX
  
  -- Valores
  valor: numeric NOT NULL
  valor_pago: numeric                    -- Pode diferir do valor original
  
  -- Status e ciclo de vida
  status: text DEFAULT 'criado'          -- enum: criado, aguardando, pago, expirado, cancelado, devolvido
  
  -- Datas do ciclo de vida
  expira_em: timestamptz                 -- Quando o QR Code expira
  pago_em: timestamptz                   -- Quando o webhook confirmou pagamento
  
  -- Dados do webhook de confirmação
  webhook_payload: jsonb                 -- Payload completo recebido do webhook
  webhook_recebido_em: timestamptz       -- Quando recebemos o webhook
  
  -- Dados do pagador (preenchidos pelo webhook)
  pagador_nome: text
  pagador_cpf: text
  pagador_banco: text
  
  -- Controle
  tentativas_verificacao: integer DEFAULT 0  -- Quantas vezes verificamos o status
  created_at: timestamptz DEFAULT now()
  updated_at: timestamptz DEFAULT now()
}
```

**Fluxo do PIX:**
1. Admin solicita pagamento → sistema cria registro em `pagamento` (status: pendente) e `pix` (status: criado)
2. Gateway gera QR Code → atualizamos `pix` com txid, qr_code, copia_cola (status: aguardando)
3. Usuário paga → gateway envia webhook → atualizamos `pix` (status: pago) e `pagamento` (status: pago)
4. Se expirar → atualizamos `pix` (status: expirado) e `pagamento` (status: falhou)

**Check Constraints:**
- `status IN ('criado', 'aguardando', 'pago', 'expirado', 'cancelado', 'devolvido')`

---

### 2.7 `qr_code_campanha` — QR Codes para Captação de Eleitores

> Já previsto na Fase 4.2 do plano macro. Incluído aqui para referência.

```
qr_code_campanha {
  id: uuid (PK, default gen_random_uuid())
  campanha_id: uuid NOT NULL (FK → campanha.id)
  codigo: text NOT NULL UNIQUE           -- Identificador curto para URL
  tipo_origem: text NOT NULL             -- enum: evento, publicidade, rede_social, panfleto, outro
  nome_origem: text                      -- Ex: "Comício Praça Central"
  descricao: text
  url_destino: text                      -- URL completa gerada automaticamente
  total_escaneamentos: integer DEFAULT 0
  total_cadastros: integer DEFAULT 0
  ativo: boolean DEFAULT true
  created_at: timestamptz DEFAULT now()
  created_by: uuid (FK → profiles.id)
}
```

---

## 3. Alterações em Tabelas Existentes

### 3.1 Adicionar `campanha_id` em Todas as Tabelas de Dados

As seguintes tabelas receberão a coluna `campanha_id uuid REFERENCES campanha(id)`:

| Tabela | Tem dados? | Estratégia |
|---|---|---|
| `profiles` | ✅ 3 registros | Adicionar nullable → migrar → NOT NULL |
| `colaborador` | ❌ | Adicionar NOT NULL direto |
| `coordenador_regional` | ❌ | Adicionar NOT NULL direto |
| `coordenador_regional_municipio` | ❌ | Adicionar NOT NULL direto |
| `lideranca` | ✅ 2 registros | Adicionar nullable → migrar → NOT NULL |
| `lideranca_area` | ✅ 2 registros | Adicionar nullable → migrar → NOT NULL |
| `lideranca_eleitor` | ❌ | Adicionar NOT NULL direto |
| `eleitor` | ❌ | Adicionar NOT NULL direto |
| `convites` | ✅ 2 registros | Adicionar nullable → migrar → NOT NULL |
| `municipio` | ❌ | Adicionar NOT NULL direto |
| `area` | ✅ 2 registros | Adicionar nullable → migrar → NOT NULL |
| `departamento` | ❌ | Adicionar NOT NULL direto |
| `equipe` | ❌ | Adicionar NOT NULL direto |
| `colaborador_departamento` | ❌ | Adicionar NOT NULL direto |
| `colaborador_equipe` | ❌ | Adicionar NOT NULL direto |
| `evento` | ❌ | Adicionar NOT NULL direto |
| `equipamento` | ❌ | Adicionar NOT NULL direto |
| `material` | ❌ | Adicionar NOT NULL direto |
| `pesquisa_quantitativa` | ❌ | Adicionar NOT NULL direto |
| `projects` | ❌ | Adicionar NOT NULL direto |
| `tasks` | ❌ | Adicionar NOT NULL direto |
| `sprints` | ❌ | Adicionar NOT NULL direto |
| `milestones` | ❌ | Adicionar NOT NULL direto |
| `labels` | ❌ | Adicionar NOT NULL direto |
| `workflows` | ❌ | Adicionar NOT NULL direto |
| `categoria_projeto` | ❌ | Adicionar NOT NULL direto |
| `project_baselines` | ❌ | Adicionar NOT NULL direto |
| `task_baseline_snapshots` | ❌ | Adicionar NOT NULL direto |
| `task_dependencies` | ❌ | Adicionar NOT NULL direto |
| `task_resources` | ❌ | Adicionar NOT NULL direto |
| `time_entries` | ❌ | Adicionar NOT NULL direto |
| `projeto_equipe` | ❌ | Adicionar NOT NULL direto |

**Tabelas que NÃO recebem campanha_id:**
- `spatial_ref_sys` — Tabela interna do PostGIS
- `campanha` — É a própria tabela tenant
- `campanha_membro` — Já tem campanha_id por definição
- `plano` — Planos são globais (não pertencem a uma campanha)
- `assinatura` — Já tem campanha_id por definição
- `pagamento` — Já tem campanha_id por definição
- `pix` — Já tem campanha_id por definição

### 3.2 Atualizar `profiles`

- Adicionar `admin` ao check constraint de `roles`
- Novo check: `roles IN ('admin', 'coordenador', 'supervisor', 'colaborador', 'lideranca', 'eleitor')`

### 3.3 Atualizar `convites`

- Expandir check de `role` para incluir `admin` e `eleitor`
- Novo check: `role IN ('admin', 'colaborador', 'coordenador', 'lideranca', 'eleitor')`

### 3.4 Atualizar `area`

- Remover default `'RJ'::text` da coluna `estado`

---

## 4. RLS (Row Level Security)

### 4.1 Estratégia

Todas as tabelas com `campanha_id` terão a seguinte policy:

```sql
-- Permite acesso apenas a dados da campanha do usuário logado
CREATE POLICY "tenant_isolation" ON {tabela}
  FOR ALL
  USING (
    campanha_id IN (
      SELECT campanha_id FROM campanha_membro 
      WHERE profile_id = auth.uid() AND status = 'ativo'
    )
  )
  WITH CHECK (
    campanha_id IN (
      SELECT campanha_id FROM campanha_membro 
      WHERE profile_id = auth.uid() AND status = 'ativo'
    )
  );
```

### 4.2 Tabelas que precisam de RLS ativado (27 atualmente sem)

Todas as 27 tabelas sem RLS listadas no schema precisam ser ativadas. As 6 que já têm RLS precisam ter suas policies revisadas para incluir o filtro por `campanha_id`.

### 4.3 Tabelas globais (sem filtro por campanha)

- `plano` — Leitura pública (qualquer usuário autenticado pode ver planos)
- `spatial_ref_sys` — Tabela interna do PostGIS

---

## 5. Ordem de Execução das Migrations

### Migration 1: Criar tabelas novas (sem dependências)

```
1. CREATE TABLE plano
2. CREATE TABLE campanha
3. CREATE TABLE campanha_membro (depende de campanha + profiles)
4. CREATE TABLE assinatura (depende de campanha + plano)
5. CREATE TABLE pagamento (depende de assinatura + campanha)
6. CREATE TABLE pix (depende de pagamento + campanha)
7. CREATE TABLE qr_code_campanha (depende de campanha + profiles)
```

### Migration 2: Criar campanha legada + plano cortesia

```
1. INSERT plano "Cortesia Idealis" (tipo: cortesia, valor: 0, limites: ilimitado)
2. INSERT plano "Básico" (tipo: pago, valores e limites a definir)
3. INSERT plano "Profissional" (tipo: pago, valores e limites a definir)
4. INSERT campanha legada (dados do Thiago Moura, uf: RJ)
5. INSERT campanha_membro para os 3 profiles existentes (role: admin/colaborador)
6. INSERT assinatura (campanha legada → plano cortesia, sem data_fim)
```

### Migration 3: Adicionar campanha_id nas tabelas existentes

```
1. ALTER TABLE ... ADD COLUMN campanha_id uuid REFERENCES campanha(id)
   -- Para tabelas com dados: nullable primeiro
   -- Para tabelas vazias: NOT NULL direto
2. UPDATE tabelas com dados SET campanha_id = {id_campanha_legada}
3. ALTER TABLE ... ALTER COLUMN campanha_id SET NOT NULL (nas que eram nullable)
4. CREATE INDEX idx_{tabela}_campanha_id ON {tabela}(campanha_id)
```

### Migration 4: Atualizar constraints existentes

```
1. ALTER profiles: expandir check de roles para incluir 'admin', 'lideranca', 'eleitor'
2. ALTER convites: expandir check de role para incluir 'admin', 'eleitor'
3. ALTER area: remover default 'RJ' da coluna estado
```

### Migration 5: Ativar RLS e criar policies

```
1. ALTER TABLE ... ENABLE ROW LEVEL SECURITY (em todas as 27 tabelas sem RLS)
2. CREATE POLICY tenant_isolation em cada tabela
3. Revisar policies das 6 tabelas que já têm RLS
4. CREATE POLICY para tabela plano (leitura pública)
```

### Migration 6: Criar índices compostos

```
1. CREATE INDEX em campanha_id + campos de busca frequente em cada tabela
```

---

## 6. Modelo de Cortesia para Clientes Idealis

### Como funciona

1. **Admin da Idealis** cria a campanha do cliente
2. No onboarding, seleciona o plano "Cortesia Idealis"
3. Sistema cria `assinatura` com:
   - `plano_id` → plano cortesia
   - `ciclo` = 'cortesia'
   - `data_fim` = NULL (sem expiração)
   - `motivo_cortesia` = "Cliente da empresa Idealis Comunicação"
4. A campanha funciona normalmente, sem cobranças
5. Se no futuro o cliente deixar de ser da Idealis, basta alterar o plano da assinatura

### Diferença entre cortesia e trial

| | Cortesia | Trial |
|---|---|---|
| **Quem recebe** | Clientes Idealis | Novos usuários |
| **Duração** | Permanente (sem data_fim) | Temporário (ex: 14 dias) |
| **Valor** | R$ 0 sempre | R$ 0 durante trial |
| **Após expirar** | Não expira | Precisa assinar plano pago |
| **Limites** | Iguais ao plano mais alto | Limitados |

---

## 7. Diagrama de Relacionamentos (Novas Tabelas)

```
plano (global)
  └── assinatura ──→ campanha (tenant)
       └── pagamento
            └── pix

campanha
  ├── campanha_membro ──→ profiles
  ├── assinatura ──→ plano
  ├── qr_code_campanha
  └── [todas as 32 tabelas existentes via campanha_id]
```

---

## 8. Variáveis de Ambiente Necessárias

Para integração com gateway de pagamento (PIX), serão necessárias:

| Variável | Descrição |
|---|---|
| `PAYMENT_GATEWAY` | Gateway escolhido (ex: "mercado_pago", "asaas") |
| `PAYMENT_API_KEY` | Chave de API do gateway |
| `PAYMENT_WEBHOOK_SECRET` | Secret para validar webhooks |
| `PIX_EXPIRATION_MINUTES` | Tempo de expiração do QR Code PIX (default: 30) |

> **DECISÃO PENDENTE:** Qual gateway de pagamento usar? Opções: Mercado Pago, Asaas, Stripe (com PIX), PagSeguro.

---

## 9. Checklist de Aprovação

Antes de executar qualquer migration, Jonathan deve aprovar:

- [ ] Estrutura da tabela `campanha` está OK?
- [ ] Estrutura da tabela `campanha_membro` está OK?
- [ ] Estrutura das tabelas financeiras (`plano`, `assinatura`, `pagamento`, `pix`) está OK?
- [ ] Modelo de cortesia para clientes Idealis está OK?
- [ ] Ordem das migrations está OK?
- [ ] Gateway de pagamento definido?
- [ ] Valores e limites dos planos definidos?

---

## 10. Pós-Migration

Após executar todas as migrations:

1. Rodar `/atualizar-tipos` (workflow Windsurf) para regenerar `database.types.ts` e `schema.md`
2. Atualizar middleware.ts com novo role "admin"
3. Atualizar Sidebar com dados dinâmicos da campanha
4. Criar endpoints/hooks para as novas tabelas
5. Marcar Etapa 1.2 como concluída no roadmap

---

**Arquivo criado em:** 13/02/2026
**Próximo passo:** Aprovação do Jonathan antes de executar migrations
