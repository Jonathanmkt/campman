# Planejamento de Vinculação de Usuários e Roles

## Objetivo
Documentar o fluxo de onboarding pós-cadastro nativo do Supabase para definir:
- Qual o papel principal de cada usuário (`coordenador`, `lideranca`, `colaborador`).
- Como o papel reflete nos registros das tabelas `profiles`, `coordenador_regional` e `lideranca`.
- Como colaboradores administrativos usarão o dashboard para atribuir roles e criar registros vinculados.

## Pontos Fundamentais
1. **Cadastro inicial (Supabase Auth):**
   - Usuário cria conta via formulário público (`/auth/signup`).
   - `profiles` recebe registro com `roles = []` até que alguém defina um papel.

2. **Definição de Role:**
   - Apenas colaboradores com permissão no dashboard podem classificar um novo usuário.
   - A role escolhida é gravada no array `profiles.roles` e determina o redirecionamento padrão via middleware.

3. **Vinculação a Tabelas Específicas:**
   - **Coordenador:** criar/atualizar registro em `coordenador_regional` com `profile_id` do usuário.
   - **Liderança:** criar registro em `lideranca` (apenas localização/endereço, sem vínculo direto a áreas inicialmente).
   - **Colaborador:** não há tabela específica além de `profiles`; porém, devemos registrar em alguma tabela de controle (ex.: `colaborador_departamento`).

4. **Experiência do Usuário:**
   - Após login, middleware lê `profiles.roles` e direciona para `/dashboard`, `/mobile/coordenador`, `/mobile/lideranca` ou `/sem-acesso`.
   - Enquanto role não for definida, usuário permanece em `/sem-acesso` com mensagem de aguardar aprovação.

## Fluxo Inicial (Proposta)
1. Usuário se cadastra → Trigger/Edge Function adiciona registro em `profiles` com status `pendente`.
2. Colaborador acessa dashboard **Colaboradores** e enxerga lista de "Usuários pendentes".
3. Ao aprovar, escolhe o tipo:
   - Marca role principal (coordenador/liderança/colaborador).
   - Preenche formulário adicional conforme role (ex.: dados da liderança ou coordenadoria).
4. Sistema atualiza `profiles.roles` e cria registro correspondente em `coordenador_regional` ou `lideranca`.
5. Usuário, ao relogar, é encaminhado automaticamente para a interface correta.

## Pendências para Próximas Conversas
- Definir se haverá hierarquia de roles (mais de um papel por pessoa) e qual prevalece no middleware.
- Modelar permissões no dashboard para quem pode aprovar novos usuários.
- Validar se precisamos de logs/auditoria das atribuições de role.
- Ajustar UI do dashboard para suportar esse fluxo (filtros por status, modal de aprovação, etc.).

> **Nota:** Este documento será atualizado sempre que combinarmos novos detalhes ou decisões sobre o fluxo.
