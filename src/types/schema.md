# Schema do Banco de Dados — Idealis Core

> **Gerado automaticamente** em 13/02/2026, 20:30:58
> **Projeto Supabase:** xkqtrwbnionpbjziilgy
> **Schema:** public

## Resumo

| Total de Tabelas | Com RLS | Sem RLS |
|---|---|---|
| 40 | 39 | 1 |

## Índice de Tabelas

- 🔒 **area** (2 registros) — Áreas geográficas da campanha (bairros, distritos, zonas eleitorais)
- 🔒 **assinatura** (1 registros) — Vínculo campanha → plano com vigência e status de pagamento
- 🔒 **campanha** (1 registros) — Tenant principal do sistema. Cada campanha é um inquilino isolado.
- 🔒 **campanha_membro** (1 registros) — Vínculo usuário ↔ campanha com papel (role)
- 🔒 **categoria_projeto** (0 registros)
- 🔒 **colaborador** (0 registros) — Colaboradores da campanha com informações específicas de trabalho
- 🔒 **colaborador_departamento** (0 registros) — Relacionamento entre colaboradores e departamentos para papéis de coordenação
- 🔒 **colaborador_equipe** (0 registros) — Relacionamento N:N entre colaboradores e equipes com contexto específico
- 🔒 **convites** (2 registros) — Convites para cadastro de usuários mobile via WhatsApp
- 🔒 **coordenador_regional** (0 registros)
- 🔒 **coordenador_regional_municipio** (465 registros)
- 🔒 **departamento** (0 registros) — Departamentos/núcleos da campanha (Comunicação, Mobilização, Financeiro, etc.)
- 🔒 **eleitor** (0 registros) — Cadastro de eleitores da campanha
- 🔒 **equipamento** (0 registros) — Equipamentos e materiais da campanha
- 🔒 **equipe** (0 registros) — Equipes de trabalho dentro dos departamentos
- 🔒 **evento** (0 registros) — Eventos da campanha eleitoral
- 🔒 **labels** (0 registros)
- 🔒 **lideranca** (24 registros) — Cadastro de lideranças da campanha
- 🔒 **lideranca_area** (2 registros) — Relacionamento entre lideranças e áreas de atuação
- 🔒 **lideranca_eleitor** (0 registros) — Relacionamento entre lideranças e eleitores
- 🔒 **material** (0 registros) — Materiais e suprimentos da campanha
- 🔒 **milestones** (0 registros)
- 🔒 **municipio** (93 registros) — Cadastro de municípios da campanha
- 🔒 **pagamento** (0 registros) — Registro final de pagamento confirmado. Só criado após confirmação via webhook ou registro manual.
- 🔒 **pesquisa_quantitativa** (0 registros)
- 🔒 **pix** (0 registros) — Ciclo de vida do PIX: criação do QR Code até confirmação via webhook. Campos alinhados com Pagar.me API v5.
- 🔒 **plano** (3 registros) — Planos de assinatura do SaaS (global, não pertence a uma campanha)
- 🔒 **profiles** (119 registros) — Perfis de usuários colaboradores da campanha com controle de acesso
- 🔒 **project_baselines** (0 registros)
- 🔒 **projects** (0 registros)
- 🔒 **projeto_equipe** (0 registros) — Relacionamento entre projetos e equipes da campanha
- 🔒 **qr_code_campanha** (0 registros) — QR Codes para captação de eleitores com rastreamento de origem (CRM)
- ⚠️ **spatial_ref_sys** (0 registros)
- 🔒 **sprints** (0 registros)
- 🔒 **task_baseline_snapshots** (0 registros)
- 🔒 **task_dependencies** (0 registros)
- 🔒 **task_resources** (0 registros)
- 🔒 **tasks** (0 registros)
- 🔒 **time_entries** (0 registros)
- 🔒 **workflows** (0 registros)

> 🔒 = RLS ativado | ⚠️ = RLS desativado

---

## area

> Áreas geográficas da campanha (bairros, distritos, zonas eleitorais)

- **RLS:** ✅ Ativado
- **Registros:** 2

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| municipio_id | uuid |  |  |  |  |  |
| nome | text |  |  |  |  |  |
| tipo | text |  |  |  |  | Tipo da área: bairro, distrito, zona_eleitoral, setor, quadra |
| codigo | text | ✓ |  |  |  |  |
| descricao | text | ✓ |  |  |  |  |
| endereco | text | ✓ |  |  |  |  |
| cep | text | ✓ |  |  |  |  |
| latitude | numeric | ✓ |  |  |  |  |
| longitude | numeric | ✓ |  |  |  |  |
| populacao_estimada | integer | ✓ |  |  |  |  |
| eleitores_estimados | integer | ✓ |  |  |  |  |
| zona_eleitoral | text | ✓ |  |  |  | Zona eleitoral da área |
| secao_eleitoral | text | ✓ |  |  |  | Seção eleitoral da área |
| prioridade | integer | ✓ | `1` |  |  | Prioridade estratégica da área (1=baixa, 5=alta) |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| logradouro | text | ✓ |  |  |  |  |
| numero | text | ✓ |  |  |  |  |
| complemento | text | ✓ |  |  |  |  |
| bairro | text | ✓ |  |  |  |  |
| cidade | text | ✓ |  |  |  |  |
| estado | text | ✓ |  |  |  |  |
| endereco_formatado | text | ✓ |  |  |  |  |
| coordenadas_completas | geography | ✓ |  |  |  | Coordenadas PostGIS completas no formato geography para cálculos geoespaciais avançados |
| needs_review | boolean | ✓ | `false` |  |  | Indica se a área foi criada automaticamente e precisa de revisão manual |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `municipio_id` → `municipio.id`

**Check Constraints:**
- `(tipo = ANY (ARRAY['bairro'::text, 'distrito'::text, 'zona_eleitoral'::text, 'setor'::text, 'quadra'::text]))`
- `((prioridade >= 1) AND (prioridade <= 5))`

---

## assinatura

> Vínculo campanha → plano com vigência e status de pagamento

- **RLS:** ✅ Ativado
- **Registros:** 1

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| campanha_id | uuid |  |  |  |  |  |
| plano_id | uuid |  |  |  |  |  |
| status | text |  | `'ativa'::text` |  |  |  |
| data_inicio | date |  |  |  |  |  |
| data_fim | date | ✓ |  |  |  | Null = sem expiração (cortesia permanente) |
| data_proximo_pagamento | date | ✓ |  |  |  |  |
| ciclo | text |  | `'mensal'::text` |  |  |  |
| valor_atual | numeric | ✓ |  |  |  | Valor cobrado atualmente. Null = cortesia ou a definir |
| motivo_cortesia | text | ✓ |  |  |  | Preenchido quando plano é cortesia |
| cancelado_em | timestamptz | ✓ |  |  |  |  |
| motivo_cancelamento | text | ✓ |  |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `now()` |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `plano_id` → `plano.id`

**Check Constraints:**
- `(status = ANY (ARRAY['ativa'::text, 'cancelada'::text, 'suspensa'::text, 'expirada'::text, 'trial'::text]))`
- `(ciclo = ANY (ARRAY['mensal'::text, 'anual'::text, 'cortesia'::text]))`

---

## campanha

> Tenant principal do sistema. Cada campanha é um inquilino isolado.

- **RLS:** ✅ Ativado
- **Registros:** 1

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  |  |  |
| nome_candidato | text |  |  |  |  |  |
| cargo_pretendido | text |  |  |  |  |  |
| partido | text | ✓ |  |  |  |  |
| numero_candidato | text | ✓ |  |  |  |  |
| uf | text |  |  |  |  | Estado (2 chars). IRREVERSÍVEL após criação. |
| cidade | text | ✓ |  |  |  | Apenas para cargos municipais (vereador, prefeito) |
| foto_candidato_url | text | ✓ |  |  |  |  |
| foto_capa_desktop_url | text | ✓ |  |  |  |  |
| foto_capa_mobile_url | text | ✓ |  |  |  |  |
| tema_cores | text | ✓ | `'azul'::text` |  |  | Preset de tema visual da campanha |
| status | text |  | `'ativa'::text` |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `now()` |  |  |  |

**Check Constraints:**
- `(status = ANY (ARRAY['ativa'::text, 'pausada'::text, 'encerrada'::text]))`
- `(cargo_pretendido = ANY (ARRAY['deputado_estadual'::text, 'deputado_federal'::text, 'vereador'::text, 'prefeito'::text, 'senador'::text, 'governador'::text]))`
- `(length(uf) = 2)`

---

## campanha_membro

> Vínculo usuário ↔ campanha com papel (role)

- **RLS:** ✅ Ativado
- **Registros:** 1

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| campanha_id | uuid |  |  |  | ✓ |  |
| profile_id | uuid |  |  |  | ✓ |  |
| role | text |  |  |  |  | Papel do membro: admin, colaborador, coordenador, lideranca, eleitor |
| convidado_por | uuid | ✓ |  |  |  |  |
| status | text |  | `'ativo'::text` |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `now()` |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `convidado_por` → `profiles.id`
- `profile_id` → `profiles.id`

**Check Constraints:**
- `(role = ANY (ARRAY['admin'::text, 'colaborador'::text, 'coordenador'::text, 'lideranca'::text, 'eleitor'::text]))`
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'pendente'::text]))`

---

## categoria_projeto

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  | ✓ |  |
| descricao | text | ✓ |  |  |  |  |
| cor | text | ✓ |  |  |  |  |
| created_at | timestamptz |  | `timezone('utc'::text, now())` |  |  |  |
| updated_at | timestamptz |  | `timezone('utc'::text, now())` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`

---

## colaborador

> Colaboradores da campanha com informações específicas de trabalho

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| profile_id | uuid | ✓ |  |  |  |  |
| area_responsavel_id | uuid | ✓ |  |  |  |  |
| funcao | text |  |  |  |  | Função: coordenador_geral, coordenador_area, supervisor, cabo_eleitoral, voluntário, assessor, motorista, segurança |
| especializacao | text | ✓ |  |  |  |  |
| disponibilidade | text[] | ✓ | `ARRAY[]::text[]` |  |  | Dias da semana disponíveis |
| horario_disponivel | text | ✓ |  |  |  |  |
| possui_veiculo | boolean | ✓ | `false` |  |  |  |
| possui_cnh | text | ✓ |  |  |  |  |
| experiencia_politica | text | ✓ |  |  |  |  |
| habilidades | text[] | ✓ |  |  |  |  |
| meta_mensal_eleitores | integer | ✓ | `0` |  |  | Meta mensal de cadastro de eleitores |
| eleitores_cadastrados | integer | ✓ | `0` |  |  |  |
| comissao | numeric | ✓ | `0.00` |  |  |  |
| salario | numeric | ✓ |  |  |  |  |
| data_inicio_atividade | date | ✓ |  |  |  |  |
| data_fim_atividade | date | ✓ |  |  |  |  |
| status_colaborador | text | ✓ | `'ativo'::text` |  |  |  |
| observacoes | text | ✓ |  |  |  |  |
| supervisor_id | uuid | ✓ |  |  |  | Colaborador supervisor (hierarquia) |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| nivel_acesso_projetos | text | ✓ | `'basico'::text` |  |  | Nível de acesso aos projetos: basico, intermediario, avancado, admin |
| pode_criar_projetos | boolean | ✓ | `false` |  |  | Se o colaborador pode criar novos projetos |
| pode_gerenciar_tarefas | boolean | ✓ | `true` |  |  | Se o colaborador pode gerenciar tarefas |
| notificacoes_projetos | boolean | ✓ | `true` |  |  | Se recebe notificações de projetos |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_responsavel_id` → `area.id`
- `campanha_id` → `campanha.id`
- `profile_id` → `profiles.id`
- `supervisor_id` → `colaborador.id`

**Check Constraints:**
- `(possui_cnh = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'AB'::text, 'AC'::text, 'AD'::text, 'AE'::text]))`
- `(status_colaborador = ANY (ARRAY['ativo'::text, 'inativo'::text, 'licenca'::text, 'desligado'::text]))`
- `(nivel_acesso_projetos = ANY (ARRAY['basico'::text, 'intermediario'::text, 'avancado'::text, 'admin'::text]))`
- `(funcao = ANY (ARRAY['coordenador_geral'::text, 'coordenador_area'::text, 'supervisor'::text, 'cabo_eleitoral'::text, 'voluntario'::text, 'assessor'::text, 'motorista'::text, 'seguranca'::text]))`

---

## colaborador_departamento

> Relacionamento entre colaboradores e departamentos para papéis de coordenação

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| colaborador_id | uuid |  |  |  | ✓ |  |
| departamento_id | uuid |  |  |  | ✓ |  |
| papel | text |  |  |  |  | Papel: coordenador, vice-coordenador, assessor, membro |
| funcao | text | ✓ |  |  |  |  |
| data_inicio | date |  | `CURRENT_DATE` |  |  |  |
| data_fim | date | ✓ |  |  |  |  |
| responsabilidades | text[] | ✓ |  |  |  |  |
| permissoes | text[] | ✓ |  |  |  |  |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `colaborador_id` → `colaborador.id`
- `departamento_id` → `departamento.id`

**Check Constraints:**
- `(papel = ANY (ARRAY['coordenador'::text, 'vice-coordenador'::text, 'assessor'::text, 'membro'::text]))`
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'licenca'::text]))`

---

## colaborador_equipe

> Relacionamento N:N entre colaboradores e equipes com contexto específico

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| colaborador_id | uuid |  |  |  | ✓ |  |
| equipe_id | uuid |  |  |  | ✓ |  |
| papel | text |  |  |  |  | Papel na equipe: membro, vice-lider, lider, coordenador, supervisor |
| funcao_especifica | text | ✓ |  |  |  |  |
| carga_horaria_semanal | integer | ✓ |  |  |  |  |
| dedicacao | text | ✓ |  |  |  | Tipo de dedicação: integral, parcial, voluntario |
| disponibilidade_dias | jsonb | ✓ |  |  |  | JSON com dias da semana disponíveis |
| responsabilidades | text[] | ✓ |  |  |  |  |
| permissoes_especiais | text[] | ✓ |  |  |  |  |
| data_inicio | date |  | `CURRENT_DATE` |  |  |  |
| data_fim | date | ✓ |  |  |  |  |
| meta_individual | integer | ✓ | `0` |  |  |  |
| resultado_alcancado | integer | ✓ | `0` |  |  |  |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `colaborador_id` → `colaborador.id`
- `equipe_id` → `equipe.id`

**Check Constraints:**
- `(papel = ANY (ARRAY['membro'::text, 'vice-lider'::text, 'lider'::text, 'coordenador'::text, 'supervisor'::text]))`
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'licenca'::text, 'afastado'::text]))`
- `((data_fim IS NULL) OR (data_fim >= data_inicio))`
- `((dedicacao IS NULL) OR (dedicacao = ANY (ARRAY['integral'::text, 'parcial'::text, 'voluntario'::text])))`

---

## convites

> Convites para cadastro de usuários mobile via WhatsApp

- **RLS:** ✅ Ativado
- **Registros:** 2

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| telefone | text |  |  |  |  |  |
| role | text |  | `'lideranca'::text` |  |  |  |
| token | text |  |  |  | ✓ |  |
| status | text |  | `'pendente'::text` |  |  |  |
| expires_at | timestamptz |  |  |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| lideranca_id | uuid | ✓ |  |  |  |  |
| nome_convidado | text | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `created_by` → `profiles.id`
- `lideranca_id` → `lideranca.id`

**Check Constraints:**
- `(status = ANY (ARRAY['pendente'::text, 'aceito'::text, 'expirado'::text, 'cancelado'::text]))`
- `(role = ANY (ARRAY['admin'::text, 'colaborador'::text, 'coordenador'::text, 'lideranca'::text, 'eleitor'::text]))`

---

## coordenador_regional

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| profile_id | uuid |  |  |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `profile_id` → `profiles.id`

---

## coordenador_regional_municipio

- **RLS:** ✅ Ativado
- **Registros:** 465

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| coordenador_regional_id | uuid |  |  |  |  |  |
| municipio_id | uuid |  |  |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `coordenador_regional_id` → `coordenador_regional.id`
- `municipio_id` → `municipio.id`

---

## departamento

> Departamentos/núcleos da campanha (Comunicação, Mobilização, Financeiro, etc.)

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  |  |  |
| codigo | text | ✓ |  |  | ✓ |  |
| tipo_departamento | text |  |  |  |  | Tipo: estrategico, operacional, administrativo |
| descricao | text | ✓ |  |  |  |  |
| departamento_pai_id | uuid | ✓ |  |  |  | Auto-referência para criar hierarquia de departamentos |
| coordenador_id | uuid | ✓ |  |  |  |  |
| area_id | uuid | ✓ |  |  |  |  |
| orcamento_mensal | numeric | ✓ |  |  |  |  |
| meta_eleitores | integer | ✓ | `0` |  |  |  |
| nivel_hierarquico | integer | ✓ | `1` |  |  | 1=mais alto, quanto maior número menor hierarquia |
| prioridade | integer | ✓ | `1` |  |  |  |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_id` → `area.id`
- `campanha_id` → `campanha.id`
- `coordenador_id` → `colaborador.id`
- `departamento_pai_id` → `departamento.id`

**Check Constraints:**
- `(tipo_departamento = ANY (ARRAY['estrategico'::text, 'operacional'::text, 'administrativo'::text]))`
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'planejado'::text]))`

---

## eleitor

> Cadastro de eleitores da campanha

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| area_id | uuid |  |  |  |  |  |
| nome_completo | text |  |  |  |  |  |
| nome_popular | text | ✓ |  |  |  |  |
| cpf | text | ✓ |  |  | ✓ |  |
| titulo_eleitor | text | ✓ |  |  | ✓ |  |
| telefone | text | ✓ |  |  |  |  |
| email | text | ✓ |  |  |  |  |
| data_nascimento | date | ✓ |  |  |  |  |
| sexo | text | ✓ |  |  |  |  |
| estado_civil | text | ✓ |  |  |  |  |
| profissao | text | ✓ |  |  |  |  |
| escolaridade | text | ✓ |  |  |  |  |
| endereco | text | ✓ |  |  |  |  |
| numero_endereco | text | ✓ |  |  |  |  |
| complemento | text | ✓ |  |  |  |  |
| bairro | text | ✓ |  |  |  |  |
| cep | text | ✓ |  |  |  |  |
| zona_eleitoral | text | ✓ |  |  |  |  |
| secao_eleitoral | text | ✓ |  |  |  |  |
| local_votacao | text | ✓ |  |  |  |  |
| foto_url | text | ✓ |  |  |  |  |
| intencao_voto | text | ✓ |  |  |  | Intenção de voto: favorável, contrário, indeciso, não informado |
| nivel_apoio | integer | ✓ | `0` |  |  | Nível de apoio ao candidato (0=nenhum, 5=total) |
| pode_ser_cabo_eleitoral | boolean | ✓ | `false` |  |  | Se o eleitor pode atuar como cabo eleitoral |
| observacoes | text | ✓ |  |  |  |  |
| data_ultimo_contato | date | ✓ |  |  |  |  |
| responsavel_cadastro | uuid | ✓ |  |  |  | Colaborador responsável pelo cadastro do eleitor |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_id` → `area.id`
- `campanha_id` → `campanha.id`
- `responsavel_cadastro` → `profiles.id`

**Check Constraints:**
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'duplicado'::text, 'falecido'::text]))`
- `(escolaridade = ANY (ARRAY['fundamental_incompleto'::text, 'fundamental_completo'::text, 'medio_incompleto'::text, 'medio_completo'::text, 'superior_incompleto'::text, 'superior_completo'::text, 'pos_graduacao'::text]))`
- `(estado_civil = ANY (ARRAY['solteiro'::text, 'casado'::text, 'divorciado'::text, 'viuvo'::text, 'uniao_estavel'::text]))`
- `(intencao_voto = ANY (ARRAY['favoravel'::text, 'contrario'::text, 'indeciso'::text, 'nao_informado'::text]))`
- `((nivel_apoio >= 0) AND (nivel_apoio <= 5))`
- `(sexo = ANY (ARRAY['M'::text, 'F'::text, 'O'::text]))`

---

## equipamento

> Equipamentos e materiais da campanha

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  |  |  |
| tipo_equipamento | text |  |  |  |  | Tipo: som, microfone, carro de som, banner, bandeira, tenda, cadeira, mesa, gerador, iluminação, veículo, notebook, impressora, câmera, drone |
| marca | text | ✓ |  |  |  |  |
| modelo | text | ✓ |  |  |  |  |
| numero_serie | text | ✓ |  |  | ✓ |  |
| descricao | text | ✓ |  |  |  |  |
| valor_aquisicao | numeric | ✓ |  |  |  |  |
| data_aquisicao | date | ✓ |  |  |  |  |
| estado_conservacao | text | ✓ | `'bom'::text` |  |  |  |
| localizacao_atual | text | ✓ |  |  |  |  |
| responsavel_atual | uuid | ✓ |  |  |  | Colaborador atualmente responsável pelo equipamento |
| disponivel | boolean | ✓ | `true` |  |  |  |
| requer_manutencao | boolean | ✓ | `false` |  |  |  |
| data_ultima_manutencao | date | ✓ |  |  |  |  |
| proxima_manutencao | date | ✓ |  |  |  |  |
| observacoes | text | ✓ |  |  |  |  |
| foto_url | text | ✓ |  |  |  |  |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `responsavel_atual` → `colaborador.id`

**Check Constraints:**
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'manutencao'::text, 'perdido'::text, 'vendido'::text]))`
- `(tipo_equipamento = ANY (ARRAY['som'::text, 'microfone'::text, 'carro_som'::text, 'banner'::text, 'bandeira'::text, 'tenda'::text, 'cadeira'::text, 'mesa'::text, 'gerador'::text, 'iluminacao'::text, 'veiculo'::text, 'notebook'::text, 'impressora'::text, 'camera'::text, 'drone'::text]))`
- `(estado_conservacao = ANY (ARRAY['novo'::text, 'bom'::text, 'regular'::text, 'ruim'::text, 'danificado'::text]))`

---

## equipe

> Equipes de trabalho dentro dos departamentos

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| departamento_id | uuid |  |  |  |  |  |
| nome | text |  |  |  |  |  |
| codigo | text | ✓ |  |  |  |  |
| descricao | text | ✓ |  |  |  |  |
| equipe_pai_id | uuid | ✓ |  |  |  | Auto-referência para criar sub-equipes |
| lider_id | uuid | ✓ |  |  |  |  |
| area_id | uuid | ✓ |  |  |  |  |
| tipo_equipe | text |  |  |  |  | Tipos: campo, escritorio, digital, voluntarios, mista |
| especialidade | text | ✓ |  |  |  | Ex: panfletagem, eventos, redes_sociais, design_grafico |
| meta_eleitores | integer | ✓ | `0` |  |  |  |
| capacidade_maxima | integer | ✓ |  |  |  |  |
| status | text | ✓ | `'ativa'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_inicio | date | ✓ |  |  |  |  |
| data_fim | date | ✓ |  |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_id` → `area.id`
- `campanha_id` → `campanha.id`
- `departamento_id` → `departamento.id`
- `equipe_pai_id` → `equipe.id`
- `lider_id` → `colaborador.id`

**Check Constraints:**
- `(tipo_equipe = ANY (ARRAY['campo'::text, 'escritorio'::text, 'digital'::text, 'voluntarios'::text, 'mista'::text]))`
- `(status = ANY (ARRAY['ativa'::text, 'inativa'::text, 'temporaria'::text]))`

---

## evento

> Eventos da campanha eleitoral

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| area_id | uuid | ✓ |  |  |  |  |
| titulo | text |  |  |  |  |  |
| descricao | text | ✓ |  |  |  |  |
| tipo_evento | text |  |  |  |  | Tipo: caminhada, comício, reunião, visita, debate, entrevista, panfletagem, corpo a corpo, inauguração, festa, encontro |
| data_inicio | timestamptz |  |  |  |  |  |
| data_fim | timestamptz | ✓ |  |  |  |  |
| local_nome | text | ✓ |  |  |  |  |
| endereco_completo | text | ✓ |  |  |  |  |
| cep | text | ✓ |  |  |  |  |
| latitude | numeric | ✓ |  |  |  |  |
| longitude | numeric | ✓ |  |  |  |  |
| publico_estimado | integer | ✓ | `0` |  |  | Número estimado de participantes |
| publico_presente | integer | ✓ |  |  |  | Número real de participantes |
| orcamento_previsto | numeric | ✓ |  |  |  |  |
| orcamento_realizado | numeric | ✓ |  |  |  |  |
| status | text | ✓ | `'planejado'::text` |  |  |  |
| prioridade | integer | ✓ | `1` |  |  | Prioridade do evento (1=baixa, 5=alta) |
| observacoes | text | ✓ |  |  |  |  |
| responsavel_organizacao | uuid | ✓ |  |  |  | Colaborador responsável pela organização |
| criado_por | uuid | ✓ |  |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_id` → `area.id`
- `campanha_id` → `campanha.id`
- `criado_por` → `profiles.id`
- `responsavel_organizacao` → `profiles.id`

**Check Constraints:**
- `((prioridade >= 1) AND (prioridade <= 5))`
- `(status = ANY (ARRAY['planejado'::text, 'confirmado'::text, 'em_andamento'::text, 'realizado'::text, 'cancelado'::text, 'adiado'::text]))`
- `(tipo_evento = ANY (ARRAY['caminhada'::text, 'comicio'::text, 'reuniao'::text, 'visita'::text, 'debate'::text, 'entrevista'::text, 'panfletagem'::text, 'corpo_a_corpo'::text, 'inauguracao'::text, 'festa'::text, 'encontro'::text]))`

---

## labels

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| name | character varying |  |  |  | ✓ |  |
| color | character varying |  |  |  |  |  |
| description | text | ✓ |  |  |  |  |
| project_id | uuid | ✓ |  |  | ✓ |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_by | uuid | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `project_id` → `projects.id`

---

## lideranca

> Cadastro de lideranças da campanha

- **RLS:** ✅ Ativado
- **Registros:** 24

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome_completo | text |  |  |  |  |  |
| nome_popular | text | ✓ |  |  |  |  |
| cpf | text | ✓ |  |  | ✓ |  |
| rg | text | ✓ |  |  |  |  |
| telefone | text | ✓ |  |  |  |  |
| email | text | ✓ |  |  |  |  |
| data_nascimento | date | ✓ |  |  |  |  |
| profissao | text | ✓ |  |  |  |  |
| endereco | text | ✓ |  |  |  |  |
| cep | text | ✓ |  |  |  |  |
| foto_url | text | ✓ |  |  |  |  |
| tipo_lideranca | text |  |  |  |  | Tipo de liderança: comunitária, religiosa, sindical, empresarial, política, social, esportiva, cultural |
| nivel_influencia | integer | ✓ | `1` |  |  | Nível de influência da liderança (1=baixo, 5=alto) |
| alcance_estimado | integer | ✓ | `0` |  |  | Número estimado de pessoas que a liderança influencia |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| observacoes | text | ✓ |  |  |  |  |
| data_primeiro_contato | date | ✓ |  |  |  |  |
| responsavel_cadastro | uuid | ✓ |  |  |  | Colaborador responsável pelo cadastro da liderança |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| data_ultimo_contato | date | ✓ |  |  |  |  |
| cidade | character varying | ✓ |  |  |  |  |
| bairro | character varying | ✓ |  |  |  |  |
| coordenador_regional_id | uuid | ✓ |  |  |  |  |
| profile_id | uuid | ✓ |  |  |  |  |
| logradouro | text | ✓ |  |  |  | Nome da rua/avenida |
| numero | text | ✓ |  |  |  | Número do endereço |
| complemento | text | ✓ |  |  |  | Complemento (apto, bloco, etc) |
| estado | text | ✓ |  |  |  | UF do estado |
| latitude | numeric | ✓ |  |  |  | Latitude da localização |
| longitude | numeric | ✓ |  |  |  | Longitude da localização |
| endereco_formatado | text | ✓ |  |  |  | Endereço completo formatado pelo Google |
| coordenadas_completas | geometry | ✓ |  |  |  | Ponto geográfico (PostGIS) |
| status_cadastro | text | ✓ | `'confirmado'::text` |  |  | Status do cadastro: provisorio (aguardando confirmação de senha) ou confirmado |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `coordenador_regional_id` → `coordenador_regional.id`
- `profile_id` → `profiles.id`
- `responsavel_cadastro` → `profiles.id`

**Check Constraints:**
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'pendente'::text, 'bloqueado'::text]))`
- `((nivel_influencia >= 1) AND (nivel_influencia <= 5))`
- `(status_cadastro = ANY (ARRAY['provisorio'::text, 'confirmado'::text]))`
- `(tipo_lideranca = ANY (ARRAY['comunitaria'::text, 'religiosa'::text, 'sindical'::text, 'empresarial'::text, 'politica'::text, 'social'::text, 'esportiva'::text, 'cultural'::text]))`

---

## lideranca_area

> Relacionamento entre lideranças e áreas de atuação

- **RLS:** ✅ Ativado
- **Registros:** 2

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| lideranca_id | uuid |  |  |  | ✓ |  |
| area_id | uuid |  |  |  | ✓ |  |
| tipo_atuacao | text |  |  |  |  | Tipo de atuação: moradia, trabalho, influência, representação, coordenação |
| nivel_influencia | integer | ✓ | `1` |  |  | Nível de influência na área (1=baixo, 5=alto) |
| observacoes | text | ✓ |  |  |  |  |
| data_inicio_atuacao | date | ✓ |  |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_id` → `area.id`
- `campanha_id` → `campanha.id`
- `lideranca_id` → `lideranca.id`

**Check Constraints:**
- `(tipo_atuacao = ANY (ARRAY['moradia'::text, 'trabalho'::text, 'influencia'::text, 'representacao'::text, 'coordenacao'::text]))`
- `((nivel_influencia >= 1) AND (nivel_influencia <= 5))`

---

## lideranca_eleitor

> Relacionamento entre lideranças e eleitores

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| lideranca_id | uuid |  |  |  | ✓ |  |
| eleitor_id | uuid |  |  |  | ✓ |  |
| tipo_relacao | text |  |  |  |  | Tipo de relação: influência, família, trabalho, vizinhança, amizade, religioso, político |
| nivel_proximidade | integer | ✓ | `1` |  |  | Nível de proximidade na relação (1=distante, 5=muito próximo) |
| observacoes | text | ✓ |  |  |  |  |
| data_inicio_relacao | date | ✓ |  |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `eleitor_id` → `eleitor.id`
- `lideranca_id` → `lideranca.id`

**Check Constraints:**
- `(tipo_relacao = ANY (ARRAY['influencia'::text, 'familia'::text, 'trabalho'::text, 'vizinhanca'::text, 'amizade'::text, 'religioso'::text, 'politico'::text]))`
- `((nivel_proximidade >= 1) AND (nivel_proximidade <= 5))`

---

## material

> Materiais e suprimentos da campanha

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  |  |  |
| tipo_material | text |  |  |  |  | Tipo: gráfico, promocional, escritório, limpeza, alimentação, vestuário, decoração, segurança |
| categoria | text | ✓ |  |  |  |  |
| descricao | text | ✓ |  |  |  |  |
| unidade_medida | text |  |  |  |  |  |
| quantidade_estoque | integer | ✓ | `0` |  |  |  |
| quantidade_minima | integer | ✓ | `0` |  |  | Quantidade mínima para alerta de reposição |
| valor_unitario | numeric | ✓ |  |  |  |  |
| fornecedor | text | ✓ |  |  |  |  |
| codigo_produto | text | ✓ |  |  |  |  |
| localizacao_estoque | text | ✓ |  |  |  |  |
| data_validade | date | ✓ |  |  |  |  |
| lote | text | ✓ |  |  |  |  |
| observacoes | text | ✓ |  |  |  |  |
| foto_url | text | ✓ |  |  |  |  |
| responsavel_estoque | uuid | ✓ |  |  |  | Colaborador responsável pelo controle do estoque |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `responsavel_estoque` → `colaborador.id`

**Check Constraints:**
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'esgotado'::text, 'vencido'::text]))`
- `(tipo_material = ANY (ARRAY['grafico'::text, 'promocional'::text, 'escritorio'::text, 'limpeza'::text, 'alimentacao'::text, 'vestuario'::text, 'decoracao'::text, 'seguranca'::text]))`
- `(unidade_medida = ANY (ARRAY['unidade'::text, 'caixa'::text, 'pacote'::text, 'metro'::text, 'litro'::text, 'kg'::text, 'resma'::text]))`

---

## milestones

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| project_id | uuid |  |  |  |  |  |
| name | text |  |  |  |  |  |
| description | text | ✓ |  |  |  |  |
| milestone_date | date |  |  |  |  |  |
| status | text | ✓ | `'pending'::text` |  |  |  |
| color | text | ✓ | `'#3b82f6'::text` |  |  |  |
| icon | text | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `created_by` → `colaborador.id`
- `project_id` → `projects.id`

**Check Constraints:**
- `(status = ANY (ARRAY['pending'::text, 'achieved'::text, 'missed'::text, 'at_risk'::text]))`

---

## municipio

> Cadastro de municípios da campanha

- **RLS:** ✅ Ativado
- **Registros:** 93

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  |  |  |
| codigo_ibge | text | ✓ |  |  | ✓ | Código IBGE do município |
| uf | text |  |  |  |  | Unidade Federativa (estado) |
| regiao | text | ✓ |  |  |  | Região do município (Norte, Sul, Centro, etc.) |
| populacao | integer | ✓ |  |  |  |  |
| area_km2 | numeric | ✓ |  |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| has_areas | boolean | ✓ | `false` |  |  |  |
| multi_areas | boolean | ✓ | `false` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`

**Check Constraints:**
- `(length(uf) = 2)`

---

## pagamento

> Registro final de pagamento confirmado. Só criado após confirmação via webhook ou registro manual.

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| campanha_id | uuid |  |  |  |  |  |
| assinatura_id | uuid |  |  |  |  |  |
| pix_id | uuid | ✓ |  |  |  | FK para pix.id se o pagamento foi via PIX |
| codigo | text |  |  |  | ✓ |  |
| valor_pago | numeric |  |  |  |  |  |
| meio_pagamento | text |  |  |  |  |  |
| origem | text |  | `'ONLINE'::text` |  |  | ONLINE = via gateway, MANUAL = admin registrou manualmente |
| pagarme_order_id | text | ✓ |  |  |  | or_... do Pagar.me |
| pagarme_charge_id | text | ✓ |  |  |  | ch_... do Pagar.me |
| pagarme_status | text | ✓ |  |  |  |  |
| data_pagamento | timestamptz |  | `now()` |  |  |  |
| comprovante_url | text | ✓ |  |  |  |  |
| observacao | text | ✓ |  |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `now()` |  |  |  |

**Foreign Keys:**
- `assinatura_id` → `assinatura.id`
- `campanha_id` → `campanha.id`
- `pix_id` → `pix.id`

**Check Constraints:**
- `(meio_pagamento = ANY (ARRAY['pix'::text, 'cartao_credito'::text, 'boleto'::text, 'cortesia'::text]))`
- `(origem = ANY (ARRAY['ONLINE'::text, 'MANUAL'::text]))`

---

## pesquisa_quantitativa

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| area_id | uuid |  |  |  |  |  |
| data_pesquisa | date |  |  |  |  |  |
| percentual | numeric |  |  |  |  |  |
| metodo_coleta | text | ✓ |  |  |  |  |
| fonte | text | ✓ |  |  |  |  |
| observacoes | text | ✓ |  |  |  |  |
| criado_em | timestamptz |  | `now()` |  |  |  |
| atualizado_em | timestamptz |  | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `area_id` → `area.id`
- `campanha_id` → `campanha.id`

---

## pix

> Ciclo de vida do PIX: criação do QR Code até confirmação via webhook. Campos alinhados com Pagar.me API v5.

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| campanha_id | uuid |  |  |  |  |  |
| assinatura_id | uuid |  |  |  |  |  |
| codpag | text |  |  |  | ✓ | Código interno único: ic + campanha_id_curto + datetime |
| pagarme_order_id | text | ✓ |  |  | ✓ | or_... — ID do pedido no Pagar.me |
| pagarme_order_code | text | ✓ |  |  |  |  |
| pagarme_charge_id | text | ✓ |  |  |  | ch_... — ID da cobrança no Pagar.me |
| pagarme_transaction_id | text | ✓ |  |  |  | tran_... — ID da transação PIX no Pagar.me |
| pagarme_gateway_id | text | ✓ |  |  |  |  |
| qr_code | text | ✓ |  |  |  | Payload copia-e-cola do PIX |
| qr_code_url | text | ✓ |  |  |  | URL da imagem PNG do QR Code |
| valor | numeric |  |  |  |  |  |
| valor_pago | numeric | ✓ |  |  |  |  |
| status | text |  | `'waiting_payment'::text` |  |  |  |
| expires_at | timestamptz | ✓ |  |  |  |  |
| paid_at | timestamptz | ✓ |  |  |  |  |
| end_to_end_id | text | ✓ |  |  |  | ID do Banco Central (confirmação PIX) |
| pagador_nome | text | ✓ |  |  |  |  |
| pagador_documento | text | ✓ |  |  |  | CPF do pagador (mascarado pelo Pagar.me) |
| webhook_payload | jsonb | ✓ |  |  |  | Payload completo do webhook order.paid |
| webhook_recebido_em | timestamptz | ✓ |  |  |  |  |
| observacao | text | ✓ |  |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `now()` |  |  |  |

**Foreign Keys:**
- `assinatura_id` → `assinatura.id`
- `campanha_id` → `campanha.id`

**Check Constraints:**
- `(status = ANY (ARRAY['waiting_payment'::text, 'paid'::text, 'failed'::text, 'expired'::text, 'pending_refund'::text, 'refunded'::text]))`

---

## plano

> Planos de assinatura do SaaS (global, não pertence a uma campanha)

- **RLS:** ✅ Ativado
- **Registros:** 3

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| nome | text |  |  |  |  |  |
| slug | text |  |  |  | ✓ |  |
| descricao | text | ✓ |  |  |  |  |
| tipo | text |  | `'pago'::text` |  |  | Tipo do plano: pago, cortesia (clientes Idealis), trial |
| valor_mensal | numeric | ✓ |  |  |  | Valor mensal em reais. Null = a definir |
| valor_anual | numeric | ✓ |  |  |  |  |
| limite_eleitores | integer | ✓ |  |  |  | Limite de eleitores. Null = ilimitado |
| limite_liderancas | integer | ✓ |  |  |  | Limite de lideranças. Null = ilimitado |
| limite_colaboradores | integer | ✓ |  |  |  | Limite de colaboradores. Null = ilimitado |
| limite_storage_mb | integer | ✓ |  |  |  | Limite de storage em MB. Null = ilimitado |
| funcionalidades | jsonb | ✓ |  |  |  | JSON com features habilitadas por plano |
| ativo | boolean |  | `true` |  |  |  |
| ordem_exibicao | integer | ✓ | `0` |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `now()` |  |  |  |

**Check Constraints:**
- `(tipo = ANY (ARRAY['pago'::text, 'cortesia'::text, 'trial'::text]))`

---

## profiles

> Perfis de usuários colaboradores da campanha com controle de acesso

- **RLS:** ✅ Ativado
- **Registros:** 119

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  |  | 🔑 |  | Referência ao ID do usuário em auth.users |
| nome_completo | text |  |  |  |  |  |
| status | text | ✓ | `'ativo'::text` |  |  |  |
| roles | text[] |  | `ARRAY['colaborador'::text]` |  |  | Papéis do usuário (ex: coordenador, supervisor, colaborador) |
| permissions | text[] | ✓ | `ARRAY[]::text[]` |  |  | Permissões específicas do usuário |
| access_level | integer | ✓ | `1` |  |  | Nível hierárquico de acesso (maior = mais acesso) |
| telefone | text | ✓ |  |  |  |  |
| cpf | text | ✓ |  |  | ✓ |  |
| foto_url | text | ✓ |  |  |  |  |
| data_nascimento | date | ✓ |  |  |  |  |
| provider_id | text | ✓ |  |  |  |  |
| ultimo_acesso | timestamptz | ✓ |  |  |  |  |
| data_criacao | timestamptz |  | `now()` |  |  |  |
| data_atualizacao | timestamptz |  | `now()` |  |  |  |
| updated_at | timestamptz |  | `timezone('utc'::text, now())` |  |  |  |
| senha_hash | text | ✓ |  |  |  |  |
| auth_method | text | ✓ | `'supabase'::text` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`

**Check Constraints:**
- `(auth_method = ANY (ARRAY['supabase'::text, 'mobile'::text]))`
- `(status = ANY (ARRAY['ativo'::text, 'inativo'::text, 'suspenso'::text]))`

---

## project_baselines

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| project_id | uuid |  |  |  |  |  |
| name | text |  |  |  |  |  |
| description | text | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| is_active | boolean | ✓ | `false` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `created_by` → `colaborador.id`
- `project_id` → `projects.id`

---

## projects

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| name | character varying |  |  |  |  |  |
| description | text | ✓ |  |  |  |  |
| color | character varying | ✓ | `'#3b82f6'::character varying` |  |  |  |
| status | project_status | ✓ | `'PLANNING'::project_status` |  |  |  |
| priority | project_priority | ✓ | `'MEDIUM'::project_priority` |  |  |  |
| start_date | date | ✓ |  |  |  |  |
| end_date | date | ✓ |  |  |  |  |
| settings | jsonb | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_by | uuid | ✓ |  |  |  |  |
| archived | boolean | ✓ | `false` |  |  |  |
| responsavel_id | uuid | ✓ |  |  |  |  |
| categoria_id | uuid | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `categoria_id` → `categoria_projeto.id`
- `created_by` → `colaborador.id`
- `responsavel_id` → `colaborador.id`
- `updated_by` → `colaborador.id`

---

## projeto_equipe

> Relacionamento entre projetos e equipes da campanha

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| projeto_id | uuid |  |  |  | ✓ |  |
| equipe_id | uuid |  |  |  | ✓ |  |
| papel | text | ✓ | `'colaboradora'::text` |  |  | Papel da equipe no projeto: responsavel, colaboradora, apoio |
| data_inicio | date |  | `CURRENT_DATE` |  |  |  |
| data_fim | date | ✓ |  |  |  |  |
| ativo | boolean | ✓ | `true` |  |  |  |
| observacoes | text | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `equipe_id` → `equipe.id`
- `projeto_id` → `projects.id`

**Check Constraints:**
- `(papel = ANY (ARRAY['responsavel'::text, 'colaboradora'::text, 'apoio'::text]))`

---

## qr_code_campanha

> QR Codes para captação de eleitores com rastreamento de origem (CRM)

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| campanha_id | uuid |  |  |  |  |  |
| codigo | text |  |  |  | ✓ | Identificador curto para URL pública /convite/[codigo] |
| tipo_origem | text |  |  |  |  | Tipo de origem: evento, publicidade, rede_social, panfleto, outro |
| nome_origem | text | ✓ |  |  |  |  |
| descricao | text | ✓ |  |  |  |  |
| url_destino | text | ✓ |  |  |  |  |
| total_escaneamentos | integer |  | `0` |  |  |  |
| total_cadastros | integer |  | `0` |  |  |  |
| ativo | boolean |  | `true` |  |  |  |
| created_at | timestamptz |  | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `created_by` → `profiles.id`

**Check Constraints:**
- `(tipo_origem = ANY (ARRAY['evento'::text, 'publicidade'::text, 'rede_social'::text, 'panfleto'::text, 'outro'::text]))`

---

## spatial_ref_sys

- **RLS:** ⚠️ Desativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| srid | integer |  |  | 🔑 |  |  |
| auth_name | character varying | ✓ |  |  |  |  |
| auth_srid | integer | ✓ |  |  |  |  |
| srtext | character varying | ✓ |  |  |  |  |
| proj4text | character varying | ✓ |  |  |  |  |

---

## sprints

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| name | character varying |  |  |  |  |  |
| goal | text | ✓ |  |  |  |  |
| status | sprint_status | ✓ | `'PLANNING'::sprint_status` |  |  |  |
| is_default | boolean | ✓ | `false` |  |  |  |
| archived | boolean | ✓ | `false` |  |  |  |
| start_date | date | ✓ |  |  |  |  |
| end_date | date | ✓ |  |  |  |  |
| project_id | uuid | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_by | uuid | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `created_by` → `colaborador.id`
- `project_id` → `projects.id`
- `updated_by` → `colaborador.id`

---

## task_baseline_snapshots

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| baseline_id | uuid |  |  |  |  |  |
| task_id | uuid |  |  |  |  |  |
| task_title | text |  |  |  |  |  |
| start_date | date | ✓ |  |  |  |  |
| due_date | date | ✓ |  |  |  |  |
| progress | integer | ✓ |  |  |  |  |
| estimated_hours | numeric | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `baseline_id` → `project_baselines.id`
- `campanha_id` → `campanha.id`
- `task_id` → `tasks.id`

---

## task_dependencies

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| task_id | uuid |  |  |  | ✓ |  |
| depends_on_task_id | uuid |  |  |  | ✓ |  |
| dependency_type | text |  | `'finish_to_start'::text` |  |  |  |
| lag_days | integer | ✓ | `0` |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `created_by` → `colaborador.id`
- `depends_on_task_id` → `tasks.id`
- `task_id` → `tasks.id`

**Check Constraints:**
- `(dependency_type = ANY (ARRAY['finish_to_start'::text, 'start_to_start'::text, 'finish_to_finish'::text, 'start_to_finish'::text]))`

---

## task_resources

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| task_id | uuid |  |  |  | ✓ |  |
| colaborador_id | uuid |  |  |  | ✓ |  |
| allocation_percentage | integer | ✓ | `100` |  |  |  |
| hours_allocated | numeric | ✓ |  |  |  |  |
| hours_worked | numeric | ✓ | `0` |  |  |  |
| role_in_task | text | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `colaborador_id` → `colaborador.id`
- `task_id` → `tasks.id`

**Check Constraints:**
- `((allocation_percentage > 0) AND (allocation_percentage <= 100))`

---

## tasks

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| title | character varying |  |  |  |  |  |
| description | text | ✓ |  |  |  |  |
| type | task_type | ✓ | `'TASK'::task_type` |  |  |  |
| priority | task_priority | ✓ | `'MEDIUM'::task_priority` |  |  |  |
| task_number | integer |  |  |  | ✓ |  |
| slug | character varying |  |  |  |  |  |
| start_date | date | ✓ |  |  |  |  |
| due_date | date | ✓ |  |  |  |  |
| completed_at | timestamptz | ✓ |  |  |  |  |
| story_points | integer | ✓ |  |  |  |  |
| original_estimate | integer | ✓ |  |  |  |  |
| remaining_estimate | integer | ✓ |  |  |  |  |
| custom_fields | jsonb | ✓ |  |  |  |  |
| project_id | uuid | ✓ |  |  | ✓ |  |
| status_id | uuid | ✓ |  |  |  |  |
| sprint_id | uuid | ✓ |  |  |  |  |
| parent_task_id | uuid | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_by | uuid | ✓ |  |  |  |  |
| archived | boolean | ✓ | `false` |  |  |  |
| archived_by | uuid | ✓ |  |  |  |  |
| equipe_responsavel_id | uuid | ✓ |  |  |  | Equipe responsável pela tarefa |
| colaborador_responsavel_id | uuid | ✓ |  |  |  | Colaborador responsável principal pela tarefa |
| progress | integer | ✓ | `0` |  |  |  |
| is_milestone | boolean | ✓ | `false` |  |  |  |
| duration_days | integer | ✓ |  |  |  |  |
| baseline_start_date | date | ✓ |  |  |  |  |
| baseline_end_date | date | ✓ |  |  |  |  |
| is_critical_path | boolean | ✓ | `false` |  |  |  |
| actual_hours | numeric | ✓ | `0` |  |  |  |
| estimated_hours | numeric | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `archived_by` → `colaborador.id`
- `campanha_id` → `campanha.id`
- `colaborador_responsavel_id` → `colaborador.id`
- `created_by` → `colaborador.id`
- `equipe_responsavel_id` → `equipe.id`
- `parent_task_id` → `tasks.id`
- `project_id` → `projects.id`
- `sprint_id` → `sprints.id`
- `updated_by` → `colaborador.id`

**Check Constraints:**
- `((progress >= 0) AND (progress <= 100))`

---

## time_entries

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| description | text | ✓ |  |  |  |  |
| time_spent | integer |  |  |  |  |  |
| start_time | timestamptz | ✓ |  |  |  |  |
| end_time | timestamptz | ✓ |  |  |  |  |
| date | date | ✓ | `CURRENT_DATE` |  |  |  |
| task_id | uuid | ✓ |  |  |  |  |
| user_id | uuid | ✓ |  |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_by | uuid | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`
- `task_id` → `tasks.id`

---

## workflows

- **RLS:** ✅ Ativado
- **Registros:** 0

| Coluna | Tipo | Null | Default | PK | Unique | Descrição |
|---|---|---|---|---|---|---|
| id | uuid |  | `gen_random_uuid()` | 🔑 |  |  |
| name | character varying |  |  |  |  |  |
| description | text | ✓ |  |  |  |  |
| is_default | boolean | ✓ | `false` |  |  |  |
| created_at | timestamptz | ✓ | `now()` |  |  |  |
| updated_at | timestamptz | ✓ | `now()` |  |  |  |
| created_by | uuid | ✓ |  |  |  |  |
| updated_by | uuid | ✓ |  |  |  |  |
| campanha_id | uuid |  |  |  |  |  |

**Foreign Keys:**
- `campanha_id` → `campanha.id`

---

