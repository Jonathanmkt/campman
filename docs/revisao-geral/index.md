# Revisão Geral das Funcionalidades

## Objetivo
Centralizar o acompanhamento das revisões manuais de cada feature do Idealis Core, registrando:
- Instruções que você deve seguir em cada rodada de testes.
- Resultados obtidos (sucesso, falhas, pendências) e evidências coletadas.
- Próximos passos sugeridos, mantendo uma visão sequencial do produto.

## Como usar este diretório
1. Comece pelo primeiro item listado em “Funcionalidades revisadas”.
2. Abra o arquivo correspondente (ex.: `checkout.md`) e siga o passo a passo documentado.
3. Após executar o teste, registre o resultado no bloco "Registro dos testes" daquele arquivo (ou me informe para que eu preencha por você).
4. Repita o processo para os demais arquivos assim que cada funcionalidade for liberada para revisão.

## Funcionalidades revisadas
- [Checkout](./checkout.md) — status: **Em andamento**. Testaremos cartão de crédito, PIX e boleto para garantir que pedidos, webhooks e convites estão funcionando.

### Observações gerais de UI
- Durante as revisões manuais, registraremos também percepções sobre a qualidade visual/UX atual.
- Sempre que identificar telas pobres em feedback ou componentes improvisados, anote para priorizarmos melhorias (ex.: checkout success precisa destacar ícones grandes e call-to-action para “ver e-mail”).

## Histórico
| Data | Responsável | Resumo |
| --- | --- | --- |
| _(preencher)_ | Jonathan | Início da revisão geral, foco inicial no checkout. |

> Mais arquivos serão adicionados conforme novos fluxos forem avaliados (ex.: onboarding, convites manuais, gestão de projetos, etc.).
