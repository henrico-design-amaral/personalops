# GEMINI.md â€” Gemini / Antigravity Instructions

Este arquivo orienta o Antigravity sobre regras de conduta, boundaries de diretÃ³rios e padrÃµes de qualidade especÃ­ficos no desenvolvimento deste projeto.

---

## 1. LIMITES OPERACIONAIS DE ESCOPO

- **Ambiente de Trabalho**: Apenas leia, modifique ou crie arquivos que estejam contidos explicitamente no diretÃ³rio deste projeto local. Nunca acesse ou altere diretÃ³rios irmÃ£os (ex: outros projetos ativos ou de sistema) a menos que explicitamente solicitado.
- **DetecÃ§Ã£o de Riscos**: Em modo `Audit Mode` ou antes de executar modificaÃ§Ãµes no cÃ³digo, faÃ§a uma leitura preventiva dos arquivos de configuraÃ§Ã£o e de controle (`PROJECT_CONTROL.md`, `AGENTS.md`, `GEMINI.md`, `ai-memory/`).

---

## 2. HIERARQUIA DA VERDADE (FONTES DE CONTEXTO)

Ao tomar decisÃµes ou resolver ambiguidades tÃ©cnicas, siga a ordem estrita de precedÃªncia:
1. InstruÃ§Ã£o explÃ­cita em tempo real fornecida pelo usuÃ¡rio no chat.
2. CÃ³digo-fonte real implementado no repositÃ³rio ativo.
3. Arquivos de memÃ³ria do projeto em `ai-memory/`.
4. Arquivo de regras especÃ­fico `GEMINI.md` (este arquivo).
5. Diretrizes globais de governanÃ§a em `00_SYSTEM/ia-memory` do workspace principal.
6. HistÃ³rico recente da sessÃ£o de chat.

---

## 3. HIGIENE DE EXECUÃ‡ÃƒO E GIT

- **ValidaÃ§Ã£o de Estado**: Antes de realizar alteraÃ§Ãµes de cÃ³digo, certifique-se de que a branch atual Ã© a adequada para o escopo e verifique se hÃ¡ arquivos nÃ£o commitados via `git status`.
- **PrevenÃ§Ã£o de ModificaÃ§Ã£o Acidental**: Certifique-se de que caminhos ignorados (como pastas de referÃªncias privadas ou pacotes instalados) nÃ£o estÃ£o marcados no `git status` para serem commitados.
- **RevisÃ£o de Commits**:
  - Rode `git diff --stat` para validar visualmente a extensÃ£o da alteraÃ§Ã£o antes de criar o commit.
  - FaÃ§a o commit detalhando de forma objetiva apenas o que foi de fato alterado.
  - NÃ£o execute `git push` a menos que explicitamente autorizado pelo usuÃ¡rio.

---

## 4. QUANDO HOUVER AMBIGUIDADE

Caso nÃ£o seja possÃ­vel rastrear um bug ou se as metas de um escopo estiverem conflitantes com a memÃ³ria do projeto, pare a execuÃ§Ã£o de arquivos e apresente:
1. "NÃ£o consigo confirmar isso no estado atual do projeto."
2. Apresente as duas hipÃ³teses/caminhos identificados.
3. Proponha uma validaÃ§Ã£o simples para obter a resposta exata do usuÃ¡rio.

---

## 5. FORMATO DE ENTRADA E SAÃDA DE SESSÃ•ES

- **Handoff Inicial**: Sempre comece revisando a seÃ§Ã£o final de `PROJECT_CONTROL.md` para saber de onde continuar.
- **RelatÃ³rio de SaÃ­da**: Ao concluir a tarefa, atualize o log de sessÃµes no `PROJECT_CONTROL.md` e apresente ao usuÃ¡rio no chat:
  - O projeto afetado.
  - Lista de arquivos alterados.
  - Resumo das decisÃµes tomadas e registradas.
  - PrÃ³ximos passos sugeridos.

