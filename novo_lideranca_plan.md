# Novo Cadastro de Liderança — Plano / Checklist

## 1. Objetivo (resultado esperado ao submeter o formulário)
Ao finalizar o fluxo de criação de uma nova liderança pela página do coordenador (`/mobile/coordenador`), o sistema deve:

1) **Criar o registro de Liderança (tabela `lideranca`)**
- Persistir dados básicos (nome, tipo, nível de influência etc.)
- Persistir localização com **município + bairro/distrito** e georreferenciamento (latitude/longitude)

2) **Criar o usuário de autenticação (Supabase Auth) para a nova liderança**
- O novo usuário deve conseguir **entrar pelo telefone**.
- O usuário deve **definir senha** no onboarding (primeiro acesso), sem expor senha no cadastro feito pelo coordenador.

3) **Relacionar Coordenador (usuário logado) ↔ Liderança recém-criada**
- Garantir vínculo do coordenador atual com a liderança via `lideranca.coordenador_regional_id` (ou tabela relacional se adotada futuramente).

4) **Relacionar Liderança ↔ Área (tabela `lideranca_area`)**
- A liderança deve ficar vinculada a uma `area` que represente o **bairro/distrito dentro do município selecionado**.
- Se a área ainda não existir, deve ser criada automaticamente e então vinculada.

---

## 2. Onde isso acontece hoje (ponto de entrada)

- **UI (página do coordenador):**
  - Arquivo: `src/app/mobile/coordenador/page.tsx`
  - Abre um `Sheet` com `NovaLiderancaForm`.

- **Form (cadastro em 2 etapas):**
  - Arquivo: `src/app/mobile/coordenador/components/NovaLiderancaForm.tsx`
  - Etapa 1: dados básicos → botão **Continuar**.
  - Etapa 2: seleção do município + busca de bairro/distrito → botão **Confirmar**.
  - Ao confirmar, faz `POST /api/mobile/liderancas`.

- **Backend (API route):**
  - Arquivo: `src/app/api/mobile/liderancas/route.ts`
  - Hoje usa `SUPABASE_SERVICE_ROLE_KEY` e faz insert em `lideranca`.

---

## 3. O que já existe implementado (estado atual)

### 3.1 Frontend (coordenador)
- **Wizard em 2 etapas** (básico → endereço)
- **Seleção de município com UX de busca + debounce** (combobox com `Popover` + `Command`)
- **Busca de bairro/distrito** via Google (proxy `/api/geocode`) com restrição ao município selecionado
  - Arquivo: `src/app/mobile/coordenador/components/AddressSearch.tsx`
  - Resultado final exibido/selecionado como **bairro/distrito** (não rua)

### 3.2 Backend atual (liderança)
- **Cria registro em `lideranca`** no `POST /api/mobile/liderancas`:
  - Valida `nome_completo` e `tipo_lideranca`
  - Insere diversos campos (inclui endereço e geo: `bairro`, `cidade`, `estado`, `latitude`, `longitude` etc.)
  - Retorna `success: true` com a liderança criada

### 3.3 Geocoding
- **Proxy `/api/geocode`** com suporte a filtros de cidade (`city`) e tipos (`result_types`).
  - Arquivo: `src/app/api/geocode/route.ts`

---

## 4. O que ainda falta (gaps) — checklist de implementação

### 4.1 Criar o usuário (Supabase Auth) para a liderança (telefone + onboarding)
**Status:** NÃO implementado no fluxo do coordenador.

- Hoje, `POST /api/mobile/liderancas` **não cria usuário no Auth**.
- O projeto tem cadastro por email/senha (ex.: `src/components/supabase/signup-form.tsx`), mas **não foi identificado** fluxo de sign-up/login por telefone + onboarding de senha associado à liderança.

**Ações necessárias:**
- [ ] Definir estratégia de Auth por telefone:
  - [ ] Confirmar se o app usará **OTP por SMS** como login (padrão Supabase) ou **telefone + senha**.
- [ ] No backend (idealmente usando service role), criar o usuário Auth:
  - [ ] `supabase.auth.admin.createUser({ phone, ... })` (ou outra estratégia definida)
  - [ ] Definir como o usuário cria/define senha no onboarding (ex.: link/fluxo dedicado)
- [ ] Criar vínculo `profiles`/role:
  - [ ] Garantir que `profiles.roles` inclua `lideranca` (conforme doc `docs/user-role-planning.md`)

### 4.2 Vincular coordenador logado ↔ liderança
**Status:** NÃO implementado.

- A tabela `lideranca` possui `coordenador_regional_id` (nullable).
- O endpoint atual tem comentário:
  - `// TODO: Em produção, vincular ao coordenador logado via coordenador_regional_id`

**Ações necessárias:**
- [ ] No `POST /api/mobile/liderancas`, autenticar o usuário que está chamando (coordenador).
- [ ] Resolver o `coordenador_regional_id` a partir do usuário logado (provável `profiles.id` → `coordenador_regional.profile_id`).
- [ ] Preencher `lideranca.coordenador_regional_id` no insert/update.

### 4.3 Vincular liderança ↔ área e criar área automaticamente se não existir
**Status:** NÃO implementado.

- Existe tabela relacional `lideranca_area`.
- Existe tabela `area` com `municipio_id`, `nome`, geo (`latitude`, `longitude`, `coordenadas_completas`) e campos de endereço.

**Regras desejadas:**
- A área-alvo deve ser identificada por:
  - `municipio_id == municipio selecionado`
  - `area.nome == bairro/distrito selecionado` (normalização recomendada: trim + case-insensitive)

**Ações necessárias:**
- [ ] Após criar a liderança, buscar área existente:
  - [ ] `from('area').select('id').eq('municipio_id', municipioId).ilike('nome', bairroSelecionado)`
- [ ] Se não existir, criar `area` automaticamente:
  - [ ] `nome`: bairro/distrito
  - [ ] `municipio_id`: município selecionado
  - [ ] `tipo`: definir padrão (ex.: `bairro` / `distrito`)
  - [ ] `endereco_formatado`/`cidade`/`bairro`: preencher coerente com o bairro/distrito
  - [ ] `latitude`/`longitude` e `coordenadas_completas = POINT(lng lat)`
  - [ ] `ativo = true`
- [ ] Criar vínculo em `lideranca_area`:
  - [ ] `lideranca_id`, `area_id`, `ativo=true`

### 4.4 Ajustes recomendados (qualidade/segurança)
- [ ] `GET /api/mobile/liderancas` deve filtrar por coordenador logado (hoje retorna “todas para testes”).
- [ ] Evitar usar service role diretamente sem checar sessão do usuário em rotas “do app”.
- [ ] Padronizar payload do formulário:
  - atualmente enviamos `municipioId` no frontend, mas **não** é enviado ao backend; o vínculo com `area.municipio_id` precisa desse valor.

---

## 5. Checklist final (objetivo atingido quando)
- [ ] Liderança criada (registro `lideranca` OK)
- [ ] Usuário Auth da liderança criado (telefone + onboarding)
- [ ] Coordenador logado vinculado à liderança (via `coordenador_regional_id`)
- [ ] Área resolvida/criada (por município + bairro/distrito)
- [ ] Vínculo `lideranca_area` criado

