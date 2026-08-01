# CLAUDE.md â€” Claude Operational Guidelines

Leia este arquivo antes de iniciar qualquer trabalho de codificaÃ§Ã£o ou documentaÃ§Ã£o usando o Claude neste repositÃ³rio.

---

## 1. PRINCÃPIOS DE CODIFICAÃ‡ÃƒO

- **SemÃ¢ntica e Modularidade**: O cÃ³digo HTML gerado deve ser o mais semÃ¢ntico possÃ­vel. Estilos devem viver na pasta `assets/css/` e lÃ³gica JavaScript na pasta `assets/js/`. Evite blocos de script/estilo embutidos no HTML, exceto para bootstrapping mÃ­nimo essencial.
- **Respeito ao Design System**: Siga as diretrizes de tokens, cores HSL, tipografia e espaÃ§amento definidas em `ai-memory/03-design-system.md` e em `docs/design-system/`. Evite estilos ad-hoc ou cores genÃ©ricas.
- **Acessibilidade (a11y)**: Mantenha sempre suporte a navegaÃ§Ã£o por teclado, contraste adequado de cores e o uso correto de labels de acessibilidade (`aria-label`, landmarks de HTML5).
- **Sem CÃ³pias DesnecessÃ¡rias**: NÃ£o recrie arquivos de produtos do zero se apenas correÃ§Ãµes pontuais sÃ£o necessÃ¡rias. Preserve todos os comentÃ¡rios e docstrings nÃ£o relacionados Ã  alteraÃ§Ã£o.

---

## 2. DISCIPLINA DE GIT E BRANCHES

- **Uma Branch por Objetivo**: Nunca misture mÃºltiplos escopos (ex: correÃ§Ãµes de acessibilidade com mudanÃ§as de estilo ou governanÃ§a) na mesma branch.
- **Nomenclatura PadrÃ£o**:
  - `docs/nome-da-documentacao`
  - `fix/nome-da-correcao`
  - `design/nome-do-componente`
  - `refactor/nome-da-otimizacao`
- **Fluxo de Commits**:
  - FaÃ§a commits frequentes, pequenos e com escopo atÃ´mico.
  - Revise as alteraÃ§Ãµes com `git status` e `git diff --stat` antes de realizar o commit.
  - Mensagens de commit devem ser objetivas e baseadas em fatos.
- **Proibido**:
  - NÃ£o execute `git push` para o repositÃ³rio remoto sem aprovaÃ§Ã£o manual do usuÃ¡rio.
  - NÃ£o execute `git reset --hard` ou `git clean` no workspace de forma autÃ´noma.

---

## 3. FLUXO DE LEITURA OBRIGATÃ“RIA

Ao iniciar uma tarefa:
1. Ler `PROJECT_CONTROL.md` para entender as Ãºltimas alteraÃ§Ãµes e pendÃªncias.
2. Ler `AGENTS.md` para as regras comportamentais dos assistentes.
3. Ler as memÃ³rias locais relevantes em `ai-memory/` antes de escrever qualquer cÃ³digo.

---

## 4. RELATÃ“RIO DE FINALIZAÃ‡ÃƒO

Ao concluir uma atividade, emita um relatÃ³rio estruturado contendo:
- **Arquivos Alterados**: Lista com caminhos relativos.
- **Comandos Executados**: Quais testes ou builds locais foram executados.
- **Riscos Identificados**: Problemas potenciais decorrentes da mudanÃ§a.
- **PrÃ³ximas AÃ§Ãµes**: Passos recomendados para dar continuidade ao progresso.

