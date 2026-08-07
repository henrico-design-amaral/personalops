# Quality Gates — PersonalOps

Este documento define os gates operacionais obrigatórios para sessões de trabalho e os critérios de aceitação do produto para o PersonalOps.

---

## PARTE A — GATES OPERACIONAIS DA SESSÃO (HARNESS)

Estes gates operacionais são aplicados a cada sessão de desenvolvimento conduzida por agentes de IA no ecossistema `henrico-agent-os`.

### Gate 0 — Abertura de sessão
**Objetivo:** Confirmar que o agente opera no repositório correto, com estado limpo e contexto carregado.
- Executar e reportar: `pwd`, `git status -sb`, `git branch --show-current`, `git remote -v`, `git log --oneline -5`.
- **Aprovação:** Estado esperado confirmado; sem alterações imprevistas.
- **Bloqueio:** Diretório incorreto, branch inadequada ou working tree sujo.

### Gate 1 — Escopo
**Objetivo:** Delimitar as alterações antes de qualquer edição.
- Listar arquivos autorizados e proibidos com base no `HANDOFF.md` ou `AGENTS.md`.
- **Bloqueio:** Escopo ambíguo (ex: "melhorar o site") ou falta de arquivos de governança para tarefas complexas.

### Gate 2 — Segurança (Obrigatório)
**Objetivo:** Prevenir vazamento de credenciais e dados sensíveis.
- Revisar staging com `git diff --cached --stat`.
- **Aprovação:** Sem arquivos `.env`, chaves privadas (`sk-`, `ghp_`, etc.) ou dados reais de usuários/clientes.
- **Bloqueio:** Presença de qualquer credencial hardcoded ou PII em arquivos de código ou documentação.

### Gate 3 — Alteração
**Objetivo:** Garantir modificações mínimas e focadas.
- Revisar diff do working tree com `git diff --stat`.
- **Bloqueio:** Modificações fora do escopo ou múltiplos tipos de arquivos misturados sem justificativa.

### Gate 4 — Visual/Design (Sem Redesign)
**Objetivo:** Manter a consistência estética sem personalizações ad-hoc.
- Seguir o design system e manter as regras existentes (paridade de layouts, sidebar, topbar, cards escuros).
- **Bloqueio:** Cores CSS nomeadas básicas ou layouts genéricos.

### Gate 5 — Build/Teste
**Objetivo:** Validar se o código compila e funciona localmente antes do commit.
- Rodar commands de validação (Astro):
  ```bash
  npm run build
  ```
- **Bloqueio:** Erros fatais de build Astro ou TypeScript.

### Gate 6 — Git
**Objetivo:** Histórico semântico e commits atômicos.
- Mensagem de commit estruturada: `type(scope): descrição` (ex: `fix(shell): resolve demo login button alignment`).
- Commits separados por escopo (não misturar código e documentação de governança).

### Gate 7 — Pré-push
**Objetivo:** Revisão final da fila de commits.
- Rodar: `git log --oneline origin/main..HEAD` e `git diff origin/main --stat`.
- **Aprovação:** Usuário autorizou ou push está no escopo explícito da tarefa.

### Gate 8 — Fechamento/Memória
**Objetivo:** Manter rastreabilidade de decisões e handoffs.
- Atualizar a memória operacional em `ai-memory/HenricoOPS.md` e o `HANDOFF.md`.
- Relatar arquivos alterados, decisões registradas e passos futuros.

---

## PARTE B — CRITÉRIOS DE ACEITAÇÃO DE PRODUTO

Estes critérios e gates avaliam a evolução do produto de acordo com seus respectivos módulos.

### 1. Produto
- O fluxo principal está claro?
- O MVP resolve uma rotina real?
- O escopo está pequeno o suficiente?
- O diferencial está explícito?
- O que está fora do escopo foi documentado?

### 2. Pesquisa
- As perguntas evitam indução?
- O formulário é simples?
- Há separação entre benchmark e usuário real?
- As respostas serão analisáveis?

### 3. UX/UI
- O aluno consegue iniciar treino rapidamente?
- O personal consegue criar treino sem fricção?
- O app funciona com uma mão?
- O modo treino tem estados claros?
- O timer é legível?
- Os estados offline/sincronizando/sincronizado são visíveis?

### 4. Técnico
- Build passa?
- Typecheck passa?
- Lint passa?
- Dados críticos não são perdidos?
- Offline-first foi testado?
- Sincronização falha de forma segura?

### 5. Legal
- Dados sensíveis foram mapeados?
- Consentimentos foram definidos?
- A responsabilidade do personal está clara?
- A IA não substitui o profissional?
