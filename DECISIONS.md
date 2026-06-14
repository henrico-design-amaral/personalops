# Decisions — PersonalOps

## 2026-06-01

- Nome correto do produto: PersonalOps.
- Produto será tratado como cockpit operacional do personal trainer.
- Benchmark deve cobrir apps de personal trainer, apps de musculação e bibliotecas visuais.
- Offline-first é pilar técnico central.
- Biblioteca visual deve priorizar GIFs/animações/bonecos neutros licenciáveis.
- IA deve ser contextual e assistiva, não substitutiva.
- Voz deve começar de forma pragmática: ditado para personal e push-to-talk para aluno.
- Pesquisa com usuário deve ser simples e separada do benchmark.
- LGPD e responsabilidade profissional entram desde o MVP.

## 2026-06-14

### Exercise System — Operational Model

- Exercícios no PersonalOps são **objetos operacionais completos**, não apenas vídeos.
- Schema de exercício inclui: identificação, classificação, execução, progressão, instruções, visual e meta.
- Prescrição de exercício é vínculo entre exercício abstrato e aluno com séries, reps, carga, descanso e modalidade.
- Execução registra: reps realizadas, RPE, dor, humor e desvios da prescrição por série.
- Histórico agregado rastreia: execuções, completude, progressão de carga/RPE, trends.
- Biblioteca organiza 50+ exercícios base por grupo muscular, padrão motor, equipamento, dificuldade.
- Card de exercício tem 4 contextos: biblioteca (seleção), prescrição (review), execução (registro), histórico (performance).
- Body-figure SVG dinâmico com `data-muscles` para destaque de grupos musculares envolvidos.
- Progressão automática: sugerir carga/próximo exercício se RPE ≤ 6 em 3+ séries.
- Substituição manual: personal evolui exercício; sistema filtra contra-indicações e sugere regressões.
- Vídeos são apenas referência visual (Pinterest/YouTube); não são assets. Placeholders CSS/SVG até futuro 3D.
- Documentação em `docs/product/exercise-system.md` (especificação v1.0 estável).

### Architecture Modernization — Astro-First Migration

- PersonalOps migrado de **protótipo HTML/CSS/JS vanilla** para **Astro-first SSG**.
- Astro como framework base (coerência com Portfolio e ecossistema Henrico).
- Estrutura: `src/pages/`, `src/layouts/`, `public/assets/`.
- **Offline-first preservado**: Service Worker, Data Store JS, JSON fixtures mantidos intactos.
- Client-side: `data-store.js` + `app.js` carregados como scripts tradicionais (sem ilhas Astro necessárias).
- Build output: `dist/` com asset rewriting correto para GitHub Pages (`/personalops/`).
- Base URL: `/personalops/` configurado em `astro.config.mjs` com rewrite de caminhos.
- Service Worker registration inline com `baseUrl` via `define:vars`.
- Sem regressões: HTML, CSS, JS, dados e funcionalidade 100% preservados.
- Deploy: GitHub Pages estático (sem mudanças no DEPLOY_GITHUB_PAGES.md).

### RBAC & Operational Model — Identity, Roles, Permissions

**Distinção fundamental (CORRIGIDA)**:
- **Usuário Administrativo/Operacional** (Admin, Staff, Professor) = entidade de autenticação própria (email + senha), acesso direto
- **Usuário Aluno** (Student User) = **É usuário do sistema** com autenticação limitada (email + senha criado pelo professor)
- Usuário aluno é **não-administrativo**: sem permissões admin, acesso apenas ao próprio portal
- Usuário aluno pertence a um e apenas um professor; **criado, habilitado, pausado e controlado exclusivamente pelo professor**
- Admin NÃO cria alunos; professor cria alunos como usuários limitados

**Papéis**:
- **AdminProfile**: Gerencia exercícios base, métricas agregadas, profissionais. NÃO cria alunos. Dashboard desktop-only.
- **ProfessorProfile**: Gerencia alunos próprios, prescreve agenda semanal, acompanha execução. Onboarding obrigatório no primeiro login.
- **StudentProfile**: Executa treinos, registra séries, envia feedback. Vê apenas dados próprios.

**Agenda semanal prescritiva**:
- Tipos: workout, cardio, rest, check-in, assessment
- Prescrição obrigatória quando tipo requer detalhe (workout/cardio/assessment)
- Modal de seleção para cada tipo

**Gestão de alunos**:
- Professor cria aluno: nome, email, modo, vencimento, plano
- Estados: ativo → [pausar ↔ ativo] → arquivar (soft-delete)

**Financeiro**:
- Admin Platform: cobranças de **professores**
- Professor: cobranças de **seus alunos**
- Mockado, sem processamento real

**Documentação**: `docs/product/RBAC_AND_OPERATIONAL_MODEL.md` (v1.0)

### RBAC & Operational Model — Consolidation of Identity, Invitation, Access, and Technical Support

- Especificação completa expandida com **8 entidades de identidade e acesso**:
  - **User**: Base de autenticação com múltiplos RoleAssignments
  - **RoleAssignment**: Atribuição de papel (admin, staff, professor)
  - **ProfessorProfile**: Perfil operacional do professor
  - **StudentProfile**: Perfil operacional do aluno com status (convidado, habilitado, pausado, arquivado, bloqueado)
  - **ProfessorStudentLink**: Vínculo operacional entre professor e aluno (status: ativo, pausado, arquivado)
  - **Invitation**: Convite com token, fluxo de ativação e expiração (30 dias)
  - **PasswordRecovery**: Recuperação de acesso com token (24 horas) e auditoria de IP/timestamp
  - **SupportActionLog**: Auditoria imutável de ações técnicas (reenviar convite, desbloquear, resetar senha)

- **7 seções documentadas**:
  - Seção 3: Fluxo de convite (professor informa → sistema cria → e-mail enviado → aluno ativa → User + StudentProfile criado)
  - Seção 4: Recuperação de acesso (aluno clica "esqueci senha" → token → novo acesso; admin pode reenviar)
  - Seção 5: Visão administrativa (dashboard por professor-aluno, status técnico, ações de suporte)
  - Seção 6: Visão do professor (convida alunos, vê status, reenvia convites, pausar/arquivar, prescreve treinos)
  - Seção 7: Visão do aluno (portal limitado: executa treinos, envia feedback, edita dados próprios, troca senha)
  - Seção 8: Regra de domínio (admin governa plataforma + suporte; professor governa operação do aluno; aluno governa dados próprios)
  - Seção 9: Entidades de identidade, convite e acesso técnico (modelos detalhados com schemas)

- **Invariantes de domínio**:
  - Student É usuário limitado (não-admin) do sistema
  - Student criado exclusivamente pelo professor via Invitation
  - Professor controla operação: prescrição, pausa, arquivamento (via ProfessorStudentLink)
  - Admin NÃO cria alunos; admin atua apenas em suporte técnico (reenviar, desbloquear, resetar)
  - Vínculo professor-aluno é permanente até arquivamento (não há transferência)
  - Pausar vínculo não afeta User/StudentProfile (apenas oculta de operação)
  - Cada ação técnica é auditada em SupportActionLog (imutável)

- **Clarificações finais**:
  - Student status `convidado` significa: Invitation pendente, User ainda não criado
  - Student status `habilitado` significa: User criado com senha, pode fazer login
  - Student status `bloqueado` significa: Acesso técnico suspenso (ação de suporte)
  - Invitation.token = 32 caracteres criptograficamente seguros
  - PasswordRecovery.token = 32 caracteres criptograficamente seguros
  - Admin vê professor → alunos, mas NÃO vê treinos, prescrições ou execuções

- **Documentação**: `docs/product/RBAC_AND_OPERATIONAL_MODEL.md` (v1.0, expandido para 1700+ linhas, 19 seções)

### Data Contracts — Minimal Entity Contracts for MVP

- **Contratos mínimos para 10 entidades**:
  - User (autenticação base, email + password hashed, isActive)
  - RoleAssignment (atribuição de papel: admin, staff, professor)
  - AdminProfile (identidade admin, gerencia exercícios, suporte)
  - StaffProfile (identidade staff/suporte, reenviar, desbloquear, resetar)
  - ProfessorProfile (identidade professor, gerencia alunos, prescrições)
  - StudentProfile (identidade aluno, 5 status: convidado, habilitado, pausado, arquivado, bloqueado)
  - ProfessorStudentLink (vínculo operacional, 3 status: ativo, pausado, arquivado, permanente até arquivo)
  - Invitation (convite com token 32-char, 4 status: pendente, ativado, expirado, cancelado, 30-dia expiration)
  - PasswordRecovery (recuperação de acesso com token, 4 status: solicitado, usado, expirado, cancelado, 24-hora expiration)
  - SupportActionLog (auditoria imutável de ações técnicas: reenviar, desbloquear, resetar, resolver)

- **Para cada entidade**: campos mínimos, status possíveis, relações (ForeignKeys, cardinality), CRUD permissions por perfil, invariantes

- **10 invariantes críticas**:
  1. Student IS User (never non-user)
  2. Student via Invitation (never direct creation)
  3. Student never hard-deleted (soft via status)
  4. Professor owns Student (1 link per student)
  5. Professor no password control (view/set/reset)
  6. Admin no student creation (only support)
  7. Admin no operational editing (no workouts, no feedback)
  8. Support action audit (immutable log)
  9. Token security (32+ chars, cryptographically secure)
  10. No hard delete MVP (soft only via status/isActive)

- **Technology-agnostic**: Contracts ready for SQL, NoSQL, Graph, or file-based implementation

- **Documentação**: `docs/technical/data-contracts.md` (v1.0, contracts com CRUD permissions, invariantes, diagramas)
