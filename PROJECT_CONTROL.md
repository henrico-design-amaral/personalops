# PROJECT CONTROL â€” [Nome do Projeto]

Este arquivo Ã© a fonte mestre de controle administrativo e progresso sequencial do projeto. Ele mapeia marcos, gerencia handoffs de sessÃµes e documenta o log histÃ³rico factual.

---

## 1. IDENTIDADE DO PROJETO

- **Nome local**: [Nome do Projeto]
- **Caminho local**: `C:\Users\henri\Documents\04_PROJETOS_CONTEÃšDO\[PASTA_DO_PROJETO]`
- **RepositÃ³rio Git**: `https://github.com/henrico-design-amaral/[repositorio]`
- **Branch Principal**: `main`

---

## 2. FUNÃ‡ÃƒO E ESCOPO

### Objetivo EstratÃ©gico
[Defina o objetivo estratÃ©gico e a tese de posicionamento do projeto em uma frase.]

### Limites de Escopo
- **CÃ³digo permitido**: Apenas arquivos de produto limpos, semÃ¢nticos, modulares e alinhados com o Design System.
- **ConteÃºdo privado**: Todo material sensÃ­vel de clientes, bases brutas ou dados de testes devem residir estritamente em uma pasta privada ou ser listados de forma agregada no Git, sem versionar arquivos pesados (regras de Git em `.gitignore`).
- **ExecuÃ§Ã£o**: A IA propÃµe, documenta e executa escopos pequenos. O tomador de decisÃ£o final Ã© Henrico.

---

## 3. FLUXO DE TRABALHO E LEITURA

Antes de realizar qualquer mudanÃ§a estrutural ou codificaÃ§Ã£o:
1. Ler `PROJECT_CONTROL.md` (este arquivo) para entender a Ãºltima sessÃ£o e pendÃªncias.
2. Ler `AGENTS.md` para as regras de operaÃ§Ã£o dos agentes.
3. Ler `GEMINI.md` ou `CLAUDE.md` de acordo com a ferramenta de IA ativa.
4. Consultar a memÃ³ria de decisÃµes persistentes em `ai-memory/`.

---

## 4. HISTÃ“RICO DE SESSÃ•ES (LOG FACTUAL)

Este diÃ¡rio de bordo Ã© atualizado a cada conclusÃ£o de tarefa relevante, servindo de handoff para a prÃ³xima IA ou desenvolvedor humano.

### [AAAA-MM-DD] â€” InicializaÃ§Ã£o da FundaÃ§Ã£o
- **Branch**: `main`
- **Objetivo**: Estruturar e inicializar o repositÃ³rio utilizando o Project Foundation Protocol v1.
- **AlteraÃ§Ãµes**:
  - CriaÃ§Ã£o da Ã¡rvore de diretÃ³rios padrÃ£o de governanÃ§a e documentaÃ§Ã£o.
  - InicializaÃ§Ã£o dos arquivos de controle: `README.md`, `PROJECT_CONTROL.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` e `.gitignore`.
  - ConfiguraÃ§Ã£o de templates de memÃ³ria limpos em `ai-memory/`.
- **ValidaÃ§Ãµes**:
  - Estrutura de pastas validada no ambiente local.
- **PendÃªncias**:
  - [ ] Revisar regras de arquitetura inicial.
  - [ ] Preencher `ai-memory/01-project-context.md` com os objetivos especÃ­ficos do projeto real.
  - [ ] Estabelecer o Design System inicial.

---

## 5. RECONCILIAÃ‡ÃƒO E ENCERRAMENTO DE SESSÃƒO

Ao finalizar qualquer sessÃ£o de trabalho, o agente ativo deve:
1. Rodar `git status -sb` para auditar arquivos modificados.
2. Confirmar que nenhum arquivo fora do escopo ou dados privados foram modificados.
3. Atualizar este arquivo (`PROJECT_CONTROL.md`) com a data atual, branch ativa, resumo das alteraÃ§Ãµes, validaÃ§Ãµes executadas e prÃ³ximos passos.
4. Sugerir a mensagem de commit correspondente de forma clara e atÃ´mica.

