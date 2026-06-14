# PROJECT CONTROL — PersonalOps

Este arquivo é a fonte mestre de controle administrativo e progresso sequencial do projeto. Ele mapeia marcos, gerencia handoffs de sessões e documenta o log histórico factual.

---

## 1. IDENTIDADE DO PROJETO

- **Nome local**: PersonalOps
- **Caminho local**: `C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\PersonalOps`
- **Repositório Git**: `https://github.com/henrico-design-amaral/personalops`
- **Branch Principal**: `main`

---

## 2. FUNÇÃO E ESCOPO

### Objetivo Estratégico
Evoluir a fundação visual V1 do PersonalOps para um protótipo operacional V1.2 rico em dados, simulando fluxos realistas de personal trainers e alunos em cenários normais e offline.

### Limites de Escopo
- **Código permitido**: HTML, CSS e Vanilla Javascript puros no lado do cliente.
- **Segurança**: Proibido usar dados reais de pessoas, CPFs, contatos reais ou chaves de nuvem nesta etapa de prototipagem estática.
- **Armazenamento**: Persistência restrita a arquivos JSON de leitura local e `localStorage` no navegador para o controle da fila offline.

---

## 3. FLUXO DE TRABALHO E LEITURA

Antes de realizar qualquer mudança estrutural ou codificação:
1. Ler `PROJECT_CONTROL.md` (este arquivo) para entender a última sessão e pendências.
2. Ler `AGENTS.md` para as regras de operação dos agentes.
3. Ler `GEMINI.md` ou `CLAUDE.md` de acordo com a ferramenta de IA ativa.
4. Consultar a documentação técnica em `docs/`.

---

## 4. HISTÓRICO DE SESSÕES (LOG FACTUAL)

### Session 001 — V1.0 Visual Foundations
- **Branch**: `main`
- **Objetivo**: Implementar a fundação de design dark e esqueleto de navegação para três perfis de usuários com simulação offline básica.
- **Alterações**:
  - Estruturação do shell estático em `index.html` e estilizações em `assets/css/`.
  - Configuração do Service Worker básico e controle de fila de telemetria local.

### 2026-06-05 — Session 002 — V1.2 Data Migration & Offline Sync
- **Branch**: `data/add-personalops-test-fixtures`
- **Objetivo**: Migrar de dados mockados inline para uma arquitetura relacional baseada em fixtures JSON assíncronas com fallbacks robustos para execução sem servidor.
- **Alterações**:
  - **Fixtures JSON** (`assets/data/*.json`): Criados 10 arquivos JSON modelando usuários, personal trainers, 16 alunos detalhados, 40 exercícios, templates de treino, planilhas prescritas, telemetria de eventos, feedbacks estruturados, anamneses e pagamentos simulados.
  - **Data Store (`assets/js/data-store.js`)**: Criação da camada de manipulação de dados com suporte a fallbacks embutidos para execução sem barreiras de CORS sob o protocolo `file://` ou em ambientes de rede instável.
  - **Refatoração da App (`assets/js/app.js`)**: Modificadas as rotinas de boot para inicializar o `DataStore`, login consultando a base de usuários carregada, dashboard do personal mapeando alunos reais e painel de execução do aluno dinâmico de acordo com a planilha prescrita.
  - **Exibição de Dicas**: Inclusão de coaching cues e avisos de segurança na execução de exercícios baseados no catálogo.
  - **Service Worker (`service-worker.js`)**: Cache estendido para contemplar toda a nova árvore de dependências estáticas.
  - **Documentação**: Produzidos os guias `docs/data/TEST_FIXTURES.md` e `docs/qa/V1_2_TEST_PLAN.md` e atualizado o `README.md`.
- **Validações**:
  - Roteiro de QA verificado com simulação offline no DevTools com sucesso.

### 2026-06-05 — Session 003 — Public Memorial Home
- **Branch**: `feature/add-public-memorial-home`
- **Objetivo**: Adicionar uma entrada pública/memorial antes do login demo preservando a SPA estática e os três perfis existentes.
- **Alterações**:
  - **App (`assets/js/app.js`)**: Criada tela pública com CTA para `#/entrar`, rota hash simples para memorial/login e retorno ao memorial após logout.
  - **Estilos (`assets/css/app.css`)**: Adicionada interface institucional dark premium com blocos operacionais, cards, seção de hipóteses e aviso de validação.
  - **Service Worker (`service-worker.js`)**: Cache atualizado para `personalops-v1-cache-004`.
  - **Documentação (`README.md`)**: Registrada a entrada pública antes do login.
- **Validações**:
  - `node --check assets/js/app.js` executado com sucesso.
  - QA local em `http://127.0.0.1:4174/`: memorial, login, professor, logout, aluno, treino e registro de série verificados sem erros críticos de console.
  - Checagem mobile em viewport 390x844 sem overflow horizontal e com CTA/login funcionais.

### 2026-06-10 — Session 004 — Pix Billing & Workout Operations Fixtures
- **Branch**: `data/add-pix-billing-admin-and-workout-fixtures`
- **Objetivo**: Expandir a V1.2 para validação operacional com cobrança Pix mockada, régua de notificações, biblioteca de treinos, clonagem, grade semanal e criação assistida por voz/texto.
- **Alterações planejadas**:
  - **Fixtures JSON** (`assets/data/*.json`): dados sintéticos estruturados para usuários, profissionais, alunos, planos, assinaturas, cobranças, eventos de pagamento, notificações, exercícios, biblioteca, templates, grades semanais, prescrições, eventos, feedbacks, avaliações e rascunhos de voz.
  - **Data Store (`assets/js/data-store.js`)**: carregamento assíncrono dos novos datasets, fallbacks mínimos e consultas por perfil.
  - **App (`assets/js/app.js`)**: telas administrativas financeiras, visão operacional do professor e painel do aluno com plano, vencimento, Pix mockado e treino semanal.
  - **Service Worker**: cache atualizado para `personalops-v1-cache-005`.
  - **Documentação**: requisitos de billing/admin/Pix/biblioteca e plano de QA V1.2.

### 2026-06-10 — Session 005 — Progress, Feedback & Platform Dashboard
- **Branch**: `feature/refine-progress-feedback-and-platform-dashboard`
- **Objetivo**: Refinar a separação entre Admin PersonalOps, Professor e Aluno com dashboard desktop-only da plataforma, frequência, faltas, progresso, bioimpedância demonstrativa e feedback pós-treino.
- **Decisões**:
  - Admin representa a plataforma, não o professor.
  - Admin é desktop-only; Professor e Aluno seguem responsivos/mobile-first.
  - Frequência, progresso, feedback e bioimpedância são sintéticos e carregados por JSON local.
  - Feedback pós-treino é salvo localmente/mockado e sinalizado como crítico por nota baixa, dor, treino parcial ou dúvida.
- **Escopo**:
  - Novos datasets: `attendance-events.json`, `progress-snapshots.json`, `post-workout-feedbacks.json`, `platform-metrics.json`.
  - Novas funções no `DataStore` para métricas, risco, frequência, progresso, feedback e formulários mockados.
  - UI com perfil completo do aluno, novo/editar aluno mockado e dashboard de plataforma.

### 2026-06-10 — Session 006 — Visual Fluidity & Smart Workout UX
- **Branch**: `feature/visual-fluidity-and-smart-workout-flows`
- **Objetivo**: Refinar a experiência visual e operacional dos três perfis sem adicionar backend, banco real, autenticação real ou pagamento real.
- **Decisões**:
  - Admin mantém dashboard completo no desktop e passa a ter consulta mobile compacta.
  - Professor passa a operar por prioridades: atenção agora, alunos em acompanhamento, progresso, cobranças, biblioteca e feedbacks críticos.
  - Novo/Editar aluno usa campos inteligentes com selects, segmented controls e checkboxes.
  - Criação de treino prioriza biblioteca, depois clonagem, depois voz/texto como rascunho.
  - Aluno passa a ver semana organizada e sessão de treino por blocos.
- **Escopo**:
  - Novas funções auxiliares no `DataStore` para biblioteca, clonagem com dia, resumo do professor, métricas compactas e plano semanal.
  - Componentes visuais locais para status, progresso, tabs, cards de prioridade, builder de treino e Admin mobile compacto.
  - Documentação V1.4 de experiência visual e plano de QA visual.

### 2026-06-14 — Session 007 — Exercise System Specification
- **Branch**: `main`
- **Objetivo**: Definir como exercícios são representados como objetos operacionais de treino (não apenas vídeos).
- **Alterações**:
  - **Documentação**: Criado `docs/product/exercise-system.md` (especificação v1.0 estável, 500+ linhas).
  - **Decisões**: Registrado modelo completo de exercícios, prescrições, execuções, histórico, progressões e substituições em DECISIONS.md.
  - **Escopo Funcional**: Biblioteca (50+ exercícios), 4 contextos de card, tela de detalhe, execução assistida, body-figure SVG, prescrição do personal, histórico agregado.
  - **Validação**: Sem implementação de telas agora (conforme requisito); documentação como referência para próximas etapas.
- **Validações**:
  - Documentação revisada e completa; pronta para implementação.

### 2026-06-14 — Session 008 — Architecture Modernization (Astro-First)
- **Branch**: `main`
- **Objetivo**: Migrar PersonalOps de protótipo HTML/CSS/JS vanilla para Astro-first, mantendo 100% de paridade funcional e offline-first.
- **Alterações**:
  - **Estrutura Astro**: Criado `astro.config.mjs`, `tsconfig.json`, `package.json`, `src/layouts/`, `src/pages/`.
  - **Componentes**: `src/layouts/BaseLayout.astro` renderiza idêntico ao `index.html` original.
  - **Assets**: Copiados `public/assets/css/`, `public/assets/js/`, `public/assets/data/`, manifest, service-worker.
  - **Build**: `npm run build` gera `dist/` com asset paths reescritos para `/personalops/` (GitHub Pages).
  - **Service Worker**: Registration inline com `define:vars` para injetar `baseUrl` dinâmico.
  - **Zero Regressões**: HTML, CSS, JS (data-store + app), dados, offline-first 100% preservados.
- **Decisões**:
  - Astro como SSG (Static Site Generator) mantém deployments GitHub Pages.
  - Client-side: data-store + app.js como scripts tradicionais (sem ilhas Astro necessárias por enquanto).
  - Base URL `/personalops/` configurado em astro.config; paths reescritos automaticamente.
- **Validações**:
  - `npm run build` executa sem erros.
  - `dist/index.html` verificado com caminhos corretos (`/personalops/assets/...`).
  - Todos os assets (CSS, JS, JSON, manifest, service-worker) presentes em `dist/`.
  - Git commit: `1e38c30 refactor: migrate to Astro-first static site generator`.

---

## 5. RECONCILIAÇÃO E ENCERRAMENTO DE SESSÃO

**Última sessão**: Session 008 (2026-06-14)  
**Branch**: `main` (ahead by 2 commits)  
**Status**: Astro-first migration completo; pronto para deploy.

Commits pendentes de push:
- `704f5f5`: Exercise system specification
- `1e38c30`: Astro-first migration
