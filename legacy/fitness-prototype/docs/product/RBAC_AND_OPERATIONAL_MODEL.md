# RBAC & Operational Model — PersonalOps V1.5

**Data**: 2026-06-14  
**Versão**: 1.0 — Especificação Funcional  
**Status**: Estrutura de papéis, permissões e modelo operacional  

---

## 1. MODELO DE IDENTIDADES

### Distinção Fundamental: Usuário Administrativo vs Usuário Aluno (Limitado)

**Usuário Administrativo/Operacional** (Admin, Staff, Professor)
- Entidade de autenticação própria (email + senha criado durante onboarding)
- Acesso direto ao sistema
- Podem ter múltiplos papéis (Admin, Staff, Professor)
- Cada papel é um **Profile** separado associado ao usuário
- Exemplos:
  - `admin@personalops.test` com AdminProfile (acesso admin)
  - `professor@personalops.test` com ProfessorProfile (acesso professor)

**Usuário Aluno** (Usuário com permissões limitadas)
- **É um usuário do sistema** com autenticação (email + senha)
- **Criado, habilitado, pausado e controlado exclusivamente pelo professor**
- Admin NÃO cria, edita ou gerencia alunos
- Usuário aluno é usuário **não-administrativo** (sem permissões admin)
- Acesso limitado apenas ao seu próprio portal, treinos, histórico e feedback
- **Propriedade exclusiva do professor** que o criou
- Um usuário aluno existe apenas dentro do workspace de um professor
- Um professor pode criar múltiplos usuários alunos
- Um usuário aluno não pode existir sem professor (não há criação direta por usuário)
- Estados do usuário aluno: **habilitado → [pausa ↔ habilitado] → arquivado → desabilitado**

**Exemplo de relacionamento**:
```
User: professor@personalops.test (Usuário Professor — acesso próprio)
  ├── ProfessorProfile (prof-01)
      ├── User: joao.silva@email.com (Usuário Aluno — criado por prof-01)
      │   └── StudentProfile (std-01, status: habilitado)
      ├── User: maria.santos@email.com (Usuário Aluno — criado por prof-01)
      │   └── StudentProfile (std-02, status: habilitado)
      └── User: pedro.costa@email.com (Usuário Aluno — criado por prof-01)
          └── StudentProfile (std-03, status: pausado)
```

---

## 2. PAPÉIS E PERMISSÕES

### 2.1 Administrador da Plataforma (Platform Admin)

**Identidade**: `AdminProfile`  
**Objetivo**: Gerenciar saúde técnica, biblioteca global, métricas agregadas e profissionais (professores).

**Permissões**:
- ✅ Criar exercícios base na biblioteca global
- ✅ Editar exercícios base
- ✅ Arquivar exercícios base
- ✅ Visualizar métricas agregadas (professores, alunos totais, treinos, feedbacks)
- ✅ Visualizar profissionais cadastrados
- ✅ Visualizar cobranças mockadas de profissionais
- ✅ Visualizar biblioteca global
- ✅ Visualizar status de mídia/assets pendentes
- ✅ Visualizar logs técnicos mockados
- ✅ Criar perfis administrativos internos (outros admins)
- ✅ Gerenciar permissões de outros admins

**Não pode**:
- ❌ Criar alunos
- ❌ Editar alunos
- ❌ Deletar alunos
- ❌ Ver dados financeiros de alunos específicos
- ❌ Acessar workspace de professor
- ❌ Atribuir treinos
- ❌ Executar treinos

**Dashboard**: Desktop-only com visão agregada. Mobile com consulta compacta.

---

### 2.2 Professor (Trainer)

**Identidade**: `ProfessorProfile`  
**Objetivo**: Gerenciar seus alunos, prescrever treinos e acompanhar execução.

**Onboarding inicial** (primeiro login):
1. Preencher perfil (nome, especialidade, academia/local)
2. Confirmar workspace pessoal
3. Aceitar termos de LGPD
4. Dashboard ativado automaticamente após conclusão

**Permissões operacionais**:

#### Alunos
- ✅ Criar novo aluno (nome, email, modo de treino, vencimento)
- ✅ Editar aluno (dados básicos, modo, vencimento)
- ✅ Pausar aluno (mantém dados, oculta de operação)
- ✅ Arquivar aluno (soft-delete; dados preservados)
- ✅ Ver perfil completo do aluno (histórico, feedbacks, financeiro)
- ✅ Ver alunos inativos (pausados e arquivados)
- ❌ Deletar aluno permanentemente

#### Biblioteca de Treinos
- ✅ Visualizar biblioteca global (50+ exercícios base)
- ✅ Visualizar seus templates de treino
- ✅ Criar template de treino novo
- ✅ Editar template de treino
- ✅ Clonar template (próprio ou da biblioteca)
- ✅ Arquivar template

#### Prescrição e Agenda Semanal
- ✅ Atribuir treino específico por dia (segunda, terça, etc.)
- ✅ Atribuir cardio específico por dia
- ✅ Marcar dia como descanso
- ✅ Marcar dia como check-in
- ✅ Marcar dia como avaliação
- ✅ Modal de seleção para cada tipo
- ✅ Não permitir dia genérico sem prescrição

#### Histórico e Acompanhamento
- ✅ Ver treinos completos do aluno
- ✅ Ver treinos incompletos/pendentes
- ✅ Ver histórico simplificado
- ✅ Ver feedbacks pós-treino
- ✅ Ver execução de séries por treino
- ✅ Ver progresso de carga/RPE

#### Financeiro (próprio workspace)
- ✅ Ver cobranças mockadas dos seus alunos
- ✅ Ver vencimentos
- ✅ Ver inadimplentes
- ✅ Simular Pix mockado (copia e cola falso)
- ❌ Processar pagamento real
- ❌ Integrar gateway real

**Não pode**:
- ❌ Ver exercícios de outros professores
- ❌ Ver alunos de outros professores
- ❌ Editar alunos de outro professor
- ❌ Ver cobranças de outros professores
- ❌ Criar exercícios base (apenas usar biblioteca global)

---

### 2.3 Aluno (Student)

**Identidade**: `StudentProfile`  
**Objetivo**: Executar treinos prescritos e enviar feedback.

**Permissões**:
- ✅ Ver treino de hoje
- ✅ Ver semana organizada (dias com tipo e prescrição)
- ✅ Ver todos os treinos da semana (completos e pendentes)
- ✅ Executar treino prescrito
- ✅ Registrar série (reps, RPE)
- ✅ Pular série
- ✅ Enviar feedback (dor, esforço, humor, comentário)
- ✅ Ver histórico simplificado
- ✅ Ver detalhe de exercício
- ✅ Ver body-figure do exercício
- ✅ Ver execução visual (quando disponível)
- ✅ Visualizar dicas de coaching
- ✅ Ver progressão recomendada

**Não pode**:
- ❌ Editar prescrição de treino
- ❌ Criar alunos
- ❌ Acessar dados de outro aluno
- ❌ Ver dados financeiros
- ❌ Acessar dashboard administrativo

---

## 3. FLUXO DE CONVITE DO ALUNO

### Convite Criado pelo Professor

**Passo 1**: Professor informa dados do aluno
- Nome completo
- E-mail
- Modo de treino (presencial/online/híbrido)
- Data de início
- Plano (básico/premium/elite)

**Passo 2**: Sistema cria Invitation
- Gera link único com token
- Armazena: invitedEmail, professorId, status: "pendente"
- Define expiração (ex: 30 dias)

**Passo 3**: Sistema envia e-mail
- "Você foi convidado para PersonalOps"
- Link: `personalops.test/convite?token=xyz`
- Instruções: "Clique para criar sua senha"
- **Mockado**: sem envio real

### Ativação do Convite

**Passo 1**: Aluno acessa link do e-mail
- Sistema valida token (não expirado, não usado)
- Mostra form: "Complete seu cadastro"

**Passo 2**: Aluno cria senha
- Campo: Senha (mínimo 8 caracteres)
- Campo: Confirmar senha
- Botão: "Criar conta"

**Passo 3**: Aluno completa perfil
- Nome (pré-preenchido)
- E-mail (somente leitura)
- Data de nascimento (opcional)
- Foto (opcional)
- Botão: "Ativar conta"

**Passo 4**: Sistema cria User + StudentProfile
- `User.email` = emailDoConvite
- `User.password` = hash(senhaInformada)
- `StudentProfile.status` = "habilitado"
- `Invitation.status` = "usado"
- `Invitation.activatedAt` = now()

**Passo 5**: Professor vê aluno como "ativo"
- Lista de alunos mostra: João Silva (convidado) → João Silva (ativo)
- Status muda automaticamente

---

## 4. RECUPERAÇÃO DE ACESSO

### Fluxo "Esqueci a Senha"

**Passo 1**: Aluno clica "Esqueci a senha"
- Campo: E-mail registrado
- Botão: "Enviar link de recuperação"

**Passo 2**: Sistema valida e-mail
- Se User existe: cria PasswordRecovery
- Se User não existe: mensagem genérica (segurança)

**Passo 3**: Sistema envia e-mail
- "Recupere sua senha no PersonalOps"
- Link: `personalops.test/recuperar?token=abc`
- Token expira em 24 horas
- **Mockado**: sem envio real

**Passo 4**: Aluno acessa link
- Form: "Nova senha"
- Confirmar senha
- Botão: "Atualizar senha"

**Passo 5**: Sistema atualiza User
- `User.password` = hash(novaSenha)
- `PasswordRecovery.status` = "usado"
- `PasswordRecovery.usedAt` = now()

### Reenvio de Convite (Suporte Técnico)

**Quem**: Admin ou Staff (suporte técnico)
- Professor NÃO pode reenviar convites
- Professor NÃO vê senhas do aluno

**Ação**: Admin → Aluno → "Reenviar convite"
- Gera novo token de Invitation
- Envia novo e-mail com link
- Registra em SupportActionLog

---

## 5. VISÃO ADMINISTRATIVA

### Dashboard Admin

**Nível 1**: Lista de Professores
- Professor
- Status (ativo/pausado/suspenso)
- Alunos vinculados (total)
- Últimas atividades

**Nível 2**: Dentro de cada Professor
- **Alunos e Status Técnico**
  - Nome
  - E-mail
  - Status: convidado, habilitado, pausado, arquivado, bloqueado
  - Data de convite
  - Data de ativação
  - Ações: reenviar convite, desbloquear, resetar senha (via suporte técnico)

- **Métricas Agregadas**
  - Treinos executados esta semana
  - Feedbacks críticos (dor > 5, rating < 3)
  - Alunos com acesso expirado

### Ações de Suporte Técnico

Admin **pode**:
- ✅ Reenviar convite (novo token, novo e-mail)
- ✅ Desbloquear aluno (status: bloqueado → habilitado)
- ✅ Resetar senha (cria novo PasswordRecovery)
- ✅ Ver logs de ação (SupportActionLog)
- ✅ Visualizar status técnico do aluno

Admin **não pode**:
- ❌ Editar treino, prescrição ou execução do aluno
- ❌ Ver fotos ou feedback físico do aluno
- ❌ Mudar vencimento do plano
- ❌ Editar dados de contato do aluno (além de desbloquear acesso)
- ❌ Deletar aluno (apenas arquivar)

---

## 6. VISÃO DO PROFESSOR

### Convidando Alunos

**Fluxo**:
1. Professor → "Novo aluno"
2. Form: Nome, E-mail, Modo, Data de início, Plano
3. Sistema cria Invitation
4. E-mail é "enviado" (mockado)
5. Professor vê aluno com status: "Convite pendente"

**Status do Convite**:
- "Convite pendente" (aguardando ativação)
- "Ativo" (aluno ativou e criou senha)
- "Expirado" (> 30 dias sem ativação)

**Ações do Professor**:
- ✅ Reenviar convite ("Reenviar" button)
- ✅ Remover convite (antes de ativação)
- ✅ Ver data de convite e ativação

### Gerenciando Alunos

**Professor vê**:
- Lista de alunos (habilitados, pausados, arquivados)
- Status do acesso: convidado, ativo, pausado, arquivado
- Não vê: senha, link de recuperação, logs de suporte técnico

**Professor controla**:
- ✅ Prescrever treinos (semana, dia, tipo)
- ✅ Pausar/arquivar vínculo
- ✅ Ver fotos, comentários e feedback enviados pelo aluno
- ✅ Acompanhar execução de treinos
- ✅ Editar dados operacionais (vencimento, plano, modo)

**Professor não controla**:
- ❌ Senha do aluno
- ❌ Recuperação de acesso
- ❌ Status técnico (convidado vs. ativo)
- ❌ Desbloqueio (ação de suporte técnico)

---

## 7. VISÃO DO ALUNO

### Antes de Ativar

**Aluno recebe e-mail** com link de convite
- Acessa: `personalops.test/convite?token=xyz`
- Cria senha
- Completa perfil básico
- Clica "Ativar conta"

**Após ativação**:
- Pode fazer login com e-mail + senha
- Vê "Bem-vindo" e menu principal

### Durante Operação

**Aluno pode**:
- ✅ Ver treinos prescritos da semana
- ✅ Ver treino de hoje
- ✅ Registrar execução: reps, RPE, dor, esforço, humor
- ✅ Enviar fotos, comentários e feedback
- ✅ Ver histórico de treinos
- ✅ Ver detalhe de exercícios
- ✅ Editar dados próprios permitidos: foto, data de nascimento, telefone
- ✅ Trocar senha ("Minha conta" → "Mudar senha")

**Aluno não pode**:
- ❌ Editar treino prescrito
- ❌ Ver dados de outros alunos
- ❌ Acessar área administrativa
- ❌ Ver histórico de pagamentos (financeiro controlado pelo professor)
- ❌ Mudar professor (relação é unidirecional)

---

## 8. REGRA DE DOMÍNIO

**Governança clara por camada**:

**Admin governa: Plataforma + Suporte Técnico**
- Cria exercícios base
- Monitora saúde técnica
- Atua em suporte técnico (reenviar convites, desbloquear, resetar senhas)
- Vê organização: Professor → Alunos (sem prescrição)
- NÃO prescreve treinos
- NÃO vê execução de treinos

**Professor governa: Operação do Aluno**
- Convida alunos (cria Invitation)
- Prescreve treinos (semana, dia, tipo, exercício)
- Acompanha execução (séries, reps, RPE)
- Acessa fotos, comentários e feedback do aluno
- NÃO redefine senhas
- NÃO vê outros professores

**Aluno governa: Dados Próprios**
- Cria e altera senha
- Preenche dados de contato
- Completa perfil
- Executa treinos
- Envia feedback e fotos
- NÃO vê dados de outros alunos

---

## 9. ENTIDADES DE IDENTIDADE, CONVITE E ACESSO TÉCNICO

### User (Autenticação)
**Responsabilidade**: Entidade base de autenticação para qualquer ator no sistema.

```
User
├── id: string (unique)
├── email: string (unique, validado)
├── password: string (hashed com bcrypt ou similar)
├── profiles: RoleAssignment[] (FK)
│   └── Pode ter múltiplos RoleAssignment (admin, staff, professor em contas separadas)
├── isActive: boolean (controla login geral)
├── createdAt: timestamp
├── updatedAt: timestamp
└── metadata: {
    lastLoginAt: timestamp | null,
    loginCount: number,
    failedLoginAttempts: number
  }
```

**Valores típicos**:
- Admin: `admin@personalops.test` com 1+ RoleAssignment
- Professor: `professor@personalops.test` com 1+ RoleAssignment
- Student: `joao.silva@email.com` com 1 StudentProfile (via ProfessorStudentLink)

---

### RoleAssignment (Atribuição de Papel)
**Responsabilidade**: Define qual papel um usuário tem no sistema.

```
RoleAssignment
├── id: string (unique)
├── userId: string (FK → User)
├── role: "admin" | "staff" | "professor" (string enum)
├── profileId: string (FK → AdminProfile | StaffProfile | ProfessorProfile)
├── assignedAt: timestamp
├── assignedBy: string (userId de quem atribuiu)
└── isActive: boolean (permite revogar papel sem deletar)
```

**Exemplo de múltiplos papéis**:
```
User: joao@personalops.test
├── RoleAssignment (admin) → AdminProfile (prof-admin-01)
└── RoleAssignment (staff) → StaffProfile (prof-staff-01)
```

---

### ProfessorProfile (Perfil do Professor)
**Responsabilidade**: Identidade operacional do professor no contexto de alunos e treinos.

```
ProfessorProfile
├── id: string (unique)
├── userId: string (FK → User, unique)
├── role: "professor" (string literal)
├── name: string
├── specialty: string (ex: hipertrofia, emagrecimento, força)
├── location: string (ex: academia, estúdio, online)
├── cref: string | null (certificação profissional)
├── bio: string | null (descrição profissional)
├── isFirstLoginDone: boolean (onboarding concluído?)
├── students: ProfessorStudentLink[] (FK)
│   └── Array de links professor-aluno
├── templates: WorkoutTemplate[] (FK)
│   └── Seus treinos criados
├── cardioTemplates: CardioTemplate[] (FK)
├── invitations: Invitation[] (FK)
│   └── Convites que criou
├── workspace: {
    filesCount: number,
    storageUsed: number,
    studentsActive: number,
    studentsTotal: number
  }
├── createdAt: timestamp
└── updatedAt: timestamp
```

---

### StudentProfile (Perfil do Aluno)
**Responsabilidade**: Identidade operacional do aluno como participante de treinos.

```
StudentProfile
├── id: string (unique)
├── userId: string (FK → User, unique)
├── role: "student" (string literal)
├── name: string
├── email: string (pode diferir do User.email se email de contato)
├── dateOfBirth: date | null
├── photo: string | null (URL ou path de foto)
├── professorStudentLink: ProfessorStudentLink (FK)
│   └── Link único para seu professor
├── schedule: DayAssignment[] (FK)
│   └── Agenda semanal prescrita
├── workoutSessions: WorkoutSession[] (FK)
│   └── Execuções de treino
├── feedbacks: PostWorkoutFeedback[] (FK)
│   └── Feedbacks pós-treino
├── status: "convidado" | "habilitado" | "pausado" | "arquivado" | "bloqueado"
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Estados do StudentProfile**:
- `convidado`: Convite criado, aguardando ativação (não tem User ativo ainda)
- `habilitado`: Usuário criou senha, pode fazer login
- `pausado`: Temporariamente inativo (férias, lesão)
- `arquivado`: Inativo permanentemente (cancelamento)
- `bloqueado`: Acesso técnico bloqueado (suporte técnico)

---

### ProfessorStudentLink (Vínculo Operacional)
**Responsabilidade**: Representa a relação entre professor e aluno, controlada pelo professor.

```
ProfessorStudentLink
├── id: string (unique)
├── professorId: string (FK → ProfessorProfile)
├── studentId: string (FK → StudentProfile)
├── studentName: string (cópia desnormalizada para performance)
├── studentEmail: string (cópia desnormalizada)
├── mode: "presencial" | "online" | "híbrido"
├── plan: "básico" | "premium" | "elite"
├── startDate: date
├── expiresAt: date (vencimento do plano)
├── status: "ativo" | "pausado" | "arquivado"
├── notes: string | null (notas do professor)
├── pausedAt: timestamp | null (quando foi pausado)
├── pausedBy: string (userId de quem pausou)
├── pausedUntil: date | null (previsão de retorno)
├── archivedAt: timestamp | null
├── archivedReason: string | null
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Invariantes**:
- Cada StudentProfile tem exatamente um ProfessorStudentLink ativo ou pausado
- Quando ProfessorStudentLink é arquivado, StudentProfile.status muda para arquivado
- Pausar ProfessorStudentLink não afeta User ou StudentProfile (apenas oculta de operação)
- Professor NÃO pode transferir aluno (vínculo é permanente até arquivamento)

---

### Invitation (Convite)
**Responsabilidade**: Rastreia o convite de aluno e seu processo de ativação.

```
Invitation
├── id: string (unique)
├── token: string (unique, cryptographically secure, ex: 32 caracteres hex)
├── professionalId: string (FK → ProfessorProfile)
├── invitedEmail: string
├── invitedName: string
├── mode: "presencial" | "online" | "híbrido"
├── plan: "básico" | "premium" | "elite"
├── startDate: date
├── expiresAt: date (vencimento do plano)
├── status: "pendente" | "ativado" | "expirado" | "cancelado"
├── tokenExpiresAt: timestamp (ex: now() + 30 dias)
├── activatedAt: timestamp | null (quando o aluno ativou)
├── activationIp: string | null (IP de ativação para auditoria)
├── studentProfileId: string | null (FK → StudentProfile após ativação)
├── createdAt: timestamp
└── updatedAt: timestamp
```

**Fluxo de vida**:
1. `pendente` → Professor cria: token gerado, e-mail "enviado" (mockado)
2. `pendente` → Aluno ativa via link: cria senha, completa perfil
3. `ativado` → Token consumido, StudentProfile criado
4. `expirado` → Token > tokenExpiresAt e status ainda `pendente`
5. `cancelado` → Professor remove convite antes de ativação

---

### PasswordRecovery (Recuperação de Acesso)
**Responsabilidade**: Rastreia tentativas de recuperação de senha com segurança.

```
PasswordRecovery
├── id: string (unique)
├── token: string (unique, cryptographically secure)
├── userId: string (FK → User)
├── userEmail: string (cópia para auditoria)
├── status: "solicitado" | "usado" | "expirado" | "cancelado"
├── tokenExpiresAt: timestamp (ex: now() + 24 horas)
├── usedAt: timestamp | null (quando foi consumido)
├── usedIp: string | null (IP de uso para auditoria)
├── requestedAt: timestamp
└── createdAt: timestamp
```

**Fluxo de vida**:
1. `solicitado` → Aluno clica "Esqueci senha": token gerado, e-mail "enviado"
2. `solicitado` → Aluno acessa link: form de nova senha
3. `usado` → Password atualizado no User, token consumido
4. `expirado` → Token > tokenExpiresAt e status ainda `solicitado`
5. `cancelado` → Admin/suporte cancela (ex: múltiplas tentativas suspeitas)

---

### SupportActionLog (Log de Ações Técnicas)
**Responsabilidade**: Auditoria de ações de suporte técnico executadas por admin/staff.

```
SupportActionLog
├── id: string (unique)
├── actionType: "reenviar_convite" | "desbloquear" | "resetar_senha" | "resolver_tecnico"
├── performedBy: string (FK → User, quem fez a ação)
├── performedByRole: "admin" | "staff"
├── targetUser: string | null (FK → User, quem foi afetado)
├── targetStudent: string | null (FK → StudentProfile, se aluno)
├── targetProfessor: string | null (FK → ProfessorProfile, se professor)
├── details: {
    reason: string,
    notes: string | null,
    resultingInvitationId: string | null (se reenviar_convite),
    resultingPasswordRecoveryId: string | null (se resetar_senha)
  }
├── ipAddress: string | null
├── userAgent: string | null
├── timestamp: timestamp
└── createdAt: timestamp
```

**Ações típicas**:
- `reenviar_convite`: Admin gera novo Invitation, novo e-mail "enviado"
- `desbloquear`: Admin muda StudentProfile.status de bloqueado para habilitado
- `resetar_senha`: Admin cria novo PasswordRecovery, novo e-mail "enviado"
- `resolver_tecnico`: Admin documenta resolução de problema técnico

**Invariante**:
- Cada ação é imutável (não editável, apenas inserção)
- Quem tem acesso: Admin + Staff podem ler logs de suas próprias ações; Admin Super pode ler todos

---

## 10. ONBOARDING DO PROFESSOR

### Fluxo de Primeiro Login

**Passo 1**: Autenticação
- Email + senha
- Sistema detecta: usuário novo com ProfessorProfile

**Passo 2**: Onboarding Modal
- Título: "Bem-vindo ao PersonalOps"
- Campos obrigatórios:
  - Nome completo
  - Especialidade (select: hipertrofia, emagrecimento, força, funcional, etc.)
  - Local de atuação (select: academia, estúdio, online, híbrido)
  - CREF/Certificação (input texto opcional)
- Botão: "Confirmar e acessar dashboard"

**Passo 3**: Confirmação
- Exibir: "Seu workspace foi criado. Agora você pode criar seus primeiros alunos."
- Redirecionar para dashboard do professor
- Mostrar: dica "Clique em 'Novo aluno' para começar"

**Onboarding nunca se repete** (flag `firstLoginDone: true` no ProfessorProfile)

---

## 11. GESTÃO DE ALUNOS

### Ciclo de Vida

```
CRIAR → ATIVO → [PAUSAR ↔ ATIVO] → ARQUIVAR
                                      ↓
                                   EXCLUÍDO
```

**Estados**:
- **Ativo**: Aluno participando ativamente
- **Pausado**: Temporariamente inativo (férias, lesão, pausa)
- **Arquivado**: Inativo permanentemente ou cancelado
- **Excluído**: Soft-delete (dados preservados para auditoria)

### Criar Aluno

**Formulário**:
- Nome completo (obrigatório)
- Email (opcional, para contato)
- Data de nascimento (opcional)
- Modo de treino (select): presencial, online, híbrido
- Data de início (obrigatório)
- Data de vencimento (obrigatório)
- Plano (select): básico, premium, elite
- Notas iniciais (textarea opcional)

**Resultado**: Novo aluno criado com status "ativo"

### Editar Aluno

**Campos editáveis**:
- Nome
- Email
- Modo de treino
- Vencimento
- Plano
- Notas

**Campos read-only**:
- Data de criação
- ID
- Professor (owner)
- Estado (ativo/pausado/arquivado)

---

## 12. BIBLIOTECA DE TREINOS E CARDIO

### Estrutura

**Treino (WorkoutTemplate)**
- ID único
- Nome
- Categoria (peito, costas, perna, full-body, etc.)
- Objetivo (hipertrofia, força, emagrecimento, funcional)
- Nível (iniciante, intermediário, avançado)
- Duração estimada (minutos)
- Exercícios (array de exercícios com séries, reps, descanso)
- Criado por: sistema (biblioteca) ou professor

**Cardio (CardioTemplate)**
- ID único
- Nome
- Tipo (corrida, bicicleta, elíptico, natação, jump, etc.)
- Intensidade (baixa, moderada, alta)
- Duração (minutos)
- Descrição (ex: "30 min moderado" ou "20 min HIIT")
- Criado por: sistema ou professor

**Uso**:
- Professor seleciona treino/cardio da biblioteca
- Atribui a dia específico (segunda, terça, etc.)
- Sistema armazena prescrição na agenda do aluno

---

## 13. AGENDA SEMANAL PRESCRITIVA

### Modelo de DayAssignment

**Estrutura de dia na semana**:
```javascript
{
  studentId: "std-01",
  weekDay: "monday",  // monday, tuesday, wednesday, thursday, friday, saturday, sunday
  dayType: "workout", // workout, cardio, rest, check-in, assessment
  
  // Quando dayType === "workout"
  workoutId: "tpl-01",
  workoutName: "Peito + Bíceps",
  workoutDuration: 60,
  
  // Quando dayType === "cardio"
  cardioId: "cardio-02",
  cardioName: "Corrida leve",
  cardioDuration: 30,
  
  // Quando dayType === "assessment"
  assessmentType: "body-composition", // body-composition, 1rm, movement-quality
  
  // Meta
  notes: "Nota do professor",
  prescribedDate: "2026-06-10",
  updatedDate: "2026-06-12"
}
```

### Tipos de Dia

| Tipo | Requer Prescrição Específica? | Dados | Exibição |
|------|------|-------|----------|
| **workout** | ✅ Sim | workoutId, workoutName, duration | "Peito + Bíceps · 60 min" |
| **cardio** | ✅ Sim | cardioId, cardioName, duration | "Corrida leve · 30 min" |
| **rest** | ❌ Não | (vazio) | "Descanso" |
| **check-in** | ❌ Não | (vazio) | "Check-in com professor" |
| **assessment** | ✅ Sim | assessmentType | "Avaliação: Bioimpedância" |

### Modal de Seleção

**Ao clicar em um dia**:
1. Modal abre com 5 botões de tipo
2. Seleciona tipo
3. Se tipo requer prescrição:
   - Abre sub-modal de seleção (lista de treinos/cardios)
   - Professor escolhe
   - Confirma
4. Dia atualizado na agenda

**Validação**:
- Não permitir salvar dia com tipo que requer prescrição mas sem selection
- Mensagem: "Selecione o treino para segunda-feira"

---

## 14. VISÃO DO ALUNO

### Tela Principal: Minha Semana

**Cards por dia**:
- Dia da semana
- Tipo (Treino · 60 min | Cardio · 30 min | Descanso | Check-in)
- Status (Completo, Pendente, Hoje)
- Se hoje: botão "Iniciar treino"
- Se completo: "✓ Concluído"
- Se futuro: "Aguardando"

### Treino de Hoje

- Nome do treino
- Duração estimada
- Número de exercícios
- Botão "Executar"

### Tela de Execução

Para cada exercício:
- Nome
- Músculos envolvidos (body-figure SVG)
- Sets prescritos: 4 × 8-10
- Descanso: 90s
- Dica de coaching
- Registro de série: reps, RPE

Após último exercício:
- Modal de feedback: dor (0-10), esforço (1-10), humor, comentário
- "Enviar feedback"

### Histórico Simplificado

- Últimos 10 treinos
- Data, nome, status (completo/incompleto)
- RPE médio
- Treinos completados (%) esta semana

### Dashboard de Objetivo

- Objetivo atual (ex: "Ganhar massa muscular")
- Progresso visual (% de aderência)
- Próxima avaliação em: X dias
- Dica personalizada baseada no plano

---

## 15. FINANCEIRO

### Separação de Escopo

**Platform Admin**:
- Controla cobranças de **professores** (não de alunos)
- Ver professores com assinatura ativa/vencida
- Ver receita mockada prevista
- Dashboard de cobranças platform-wide

**Professor**:
- Controla cobranças de **seus alunos** (não de outros)
- Alunos têm vencimento (data limite do plano)
- Cobranças mockadas Pix por aluno
- Fluxo de caixa do seu workspace

**Aluno**:
- Vê apenas seu próprio plano/vencimento
- Não controla cobranças
- Recebe notificação quando vencimento se aproxima

### Modelo de Cobrança

**Professor → Aluno**:
```javascript
{
  id: "charge-01",
  professionalId: "prof-01",
  studentId: "std-01",
  studentName: "João Silva",
  planName: "Premium",
  amount: 150.00,
  dueDate: "2026-07-10",
  status: "pending", // pending, overdue, paid, cancelled
  pixQrCode: null,   // null (mockado não gera real)
  pixCopyPaste: "00020126580014br.gov.bcb.brcode..."  // fake copy-paste
}
```

**Fluxos mockados**:
- Professor clica "Gerar Pix" → copia QR Code fake
- Aluno vê "Pix disponível" → copia copia-e-cola fake
- Status muda para "paid" após simulação
- **Sem processamento real de pagamento**

---

## 16. MODELO CONCEITUAL DE ENTIDADES

### User (Autenticação)
```
User
├── id: string
├── email: string (unique)
├── password: string (hashed)
├── profiles: AdminProfile[] | ProfessorProfile[] | StudentProfile[]
└── createdAt: timestamp
```

### AdminProfile
```
AdminProfile
├── id: string
├── userId: string (FK)
├── role: "admin"
├── isFirstLogin: boolean
├── createdAt: timestamp
└── permissions: ["create_exercises", "view_metrics", "manage_professionals", "create_admins", "create_staff"]
```

### StaffProfile
```
StaffProfile
├── id: string
├── userId: string (FK)
├── role: "staff"
├── name: string
├── department: string (optional)
├── isFirstLogin: boolean
├── createdAt: timestamp
└── permissions: ["view_exercises", "view_metrics", "moderate_content", "support_users"]
```

### ProfessorProfile
```
ProfessorProfile
├── id: string
├── userId: string (FK)
├── role: "professor"
├── name: string
├── specialty: string
├── location: string
├── cref: string (optional)
├── isFirstLoginDone: boolean
├── students: StudentProfile[] (FK)
├── templates: WorkoutTemplate[] (FK)
├── cardioTemplates: CardioTemplate[] (FK)
├── createdAt: timestamp
└── workspace: {
    filesCount: number,
    storageUsed: number,
    studentsActive: number
  }
```

### StudentProfile
```
StudentProfile
├── id: string
├── userId: string (FK, if user = aluno himself)
├── professorId: string (FK, owner)
├── name: string
├── email: string (optional)
├── mode: "presencial" | "online" | "híbrido"
├── startDate: timestamp
├── expiresAt: timestamp
├── plan: "básico" | "premium" | "elite"
├── status: "ativo" | "pausado" | "arquivado"
├── notes: string
├── schedule: DayAssignment[] (FK)
├── workoutSessions: WorkoutSession[] (FK)
├── feedbacks: PostWorkoutFeedback[] (FK)
└── createdAt: timestamp
```

### Exercise
```
Exercise
├── id: string
├── name: string
├── category: string (muscle group)
├── primaryMuscle: string
├── secondaryMuscles: string[]
├── difficulty: "iniciante" | "intermediário" | "avançado"
├── defaultSets: number
├── defaultReps: string (e.g., "8-10")
├── defaultRest: number (seconds)
├── coachingCues: string[]
├── commonMistakes: string[]
├── safetyNotes: string
├── progressionPath: ExerciseId[] (next exercises)
├── isSystemLibrary: boolean
└── createdBy: ProfessorId | null
```

### WorkoutTemplate
```
WorkoutTemplate
├── id: string
├── professionalId: string (FK, creator)
├── name: string
├── category: string
├── objective: string
├── level: string
├── estimatedDuration: number (minutes)
├── exercises: {
    exerciseId: string,
    order: number,
    sets: number,
    reps: string,
    rest: number,
    notes: string
  }[]
├── isSystemLibrary: boolean
└── createdAt: timestamp
```

### CardioTemplate
```
CardioTemplate
├── id: string
├── professionalId: string (FK, creator)
├── name: string
├── type: "corrida" | "bicicleta" | "elíptico" | etc.
├── intensity: "baixa" | "moderada" | "alta"
├── duration: number (minutes)
├── description: string
├── isSystemLibrary: boolean
└── createdAt: timestamp
```

### DayAssignment
```
DayAssignment
├── id: string
├── studentId: string (FK)
├── weekDay: string (monday-sunday)
├── dayType: "workout" | "cardio" | "rest" | "check-in" | "assessment"
├── workoutId: string | null (FK, if workout)
├── cardioId: string | null (FK, if cardio)
├── assessmentType: string | null (if assessment)
├── notes: string
├── prescribedDate: timestamp
└── updatedDate: timestamp
```

### WorkoutSession
```
WorkoutSession
├── id: string
├── studentId: string (FK)
├── workoutId: string (FK)
├── startTime: timestamp
├── endTime: timestamp
├── setExecutions: SetExecution[] (FK)
├── completionStatus: "completo" | "incompleto" | "não iniciado"
└── feedback: PostWorkoutFeedback (FK)
```

### SetExecution
```
SetExecution
├── id: string
├── workoutSessionId: string (FK)
├── exerciseId: string (FK)
├── setNumber: number
├── repsTarget: number
├── repsCompleted: number
├── rpe: number (1-10)
├── duration: number (seconds)
└── notes: string
```

### PostWorkoutFeedback
```
PostWorkoutFeedback
├── id: string
├── studentId: string (FK)
├── workoutSessionId: string (FK)
├── workoutRating: number (1-5)
├── perceivedEffort: number (1-10)
├── painLevel: number (0-10)
├── mood: "ótimo" | "bom" | "normal" | "ruim"
├── feedback: string
├── isCritical: boolean (pain > 5 or rating < 3)
└── createdAt: timestamp
```

### PaymentRecord
```
PaymentRecord
├── id: string
├── professorId: string (FK)
├── studentId: string (FK)
├── studentName: string
├── planName: string
├── amount: number
├── dueDate: timestamp
├── paidDate: timestamp | null
├── status: "pendente" | "vencido" | "pago" | "cancelado"
├── pixQrCode: string | null (mockado)
├── pixCopyPaste: string | null (mockado)
└── createdAt: timestamp
```

### PlatformSubscription
```
PlatformSubscription
├── id: string
├── professionalId: string (FK)
├── planName: string
├── price: number
├── billingPeriod: "mensal" | "anual"
├── startDate: timestamp
├── expiresAt: timestamp
├── status: "ativa" | "vencida" | "cancelada"
└── createdAt: timestamp
```

---

## 17. FLUXOS OPERACIONAIS PRINCIPAIS

### Fluxo 1: Professor Cria Aluno e Prescreve Semana

```
1. Professor → "Novo aluno"
2. Preenche: nome, modo, vencimento, plano
3. Aluno criado com status "ativo"
4. Professor → Perfil do aluno → "Editar semana"
5. Para cada dia (seg-dom):
   a. Clica no dia
   b. Modal: seleciona tipo (treino, cardio, rest, check-in, assessment)
   c. Se tipo requer prescrição:
      - Sub-modal: lista de treinos/cardios
      - Seleciona
   d. Dia atualizado
6. Semana salva
```

### Fluxo 2: Aluno Executa Treino e Envia Feedback

```
1. Aluno → "Minha semana"
2. Vê segunda com "Peito + Bíceps · 60 min"
3. Clica "Iniciar treino"
4. Para cada exercício:
   a. Vê nome + body-figure
   b. Dica de coaching
   c. Registra série 1: 10 reps, RPE 7
   d. Descanso inicia (countdown 90s)
   e. Série 2, 3, 4...
5. Último exercício → Modal feedback
6. Seleciona: dor 2, esforço 8, humor "bom", comenta
7. "Enviar feedback"
8. Sistema marca treino como "concluído"
```

### Fluxo 3: Professor Acompanha Progresso e Sugerи Progressão

```
1. Professor → "João Silva" (aluno)
2. Vê: últimos 5 treinos, RPE trend, carga atual
3. Vê exercício "Supino": 80 kg, RPE médio 7, 83% completude
4. Sistema sugere: "Pronto para progredir para 85 kg"
5. Professor clica "Aceitar progressão"
6. Prescrição atualizada para próximo treino
```

---

## 18. REGRAS DE INTEGRIDADE

### Dados
- ❌ Nunca permitir usuário aluno acessar dados de outro aluno
- ❌ Nunca permitir professor editar aluno de outro professor
- ❌ Nunca permitir admin criar/editar/deletar aluno (exclusivamente do professor)
- ✅ Sempre preservar histórico de usuário aluno (soft-delete, nunca hard-delete)

### Acesso
- ❌ Nunca permitir admin criar/editar aluno
- ❌ Nunca permitir professor acessar dados de outro professor
- ✅ Sempre validar permissão antes de ação

### Financeiro
- ❌ Nunca processar pagamento real
- ❌ Nunca expor dados bancários reais
- ✅ Sempre usar mockados para Pix/cobranças

---

## 19. CRITÉRIOS DE ACEITE

- ✅ Documento deixa claro que aluno É usuário limitado do sistema
- ✅ Documento deixa claro que aluno pertence exclusivamente ao professor
- ✅ Documento deixa claro que admin NÃO cria/edita/gerencia alunos
- ✅ Documento deixa claro que professor controla acesso e estado do aluno
- ✅ Documento define como o professor atribui treino exato por dia
- ✅ Documento define como cardio específico é atribuído
- ✅ Documento define a visão do aluno (portal limitado)
- ✅ Documento define o escopo financeiro (admin → professores, professor → alunos)
- ✅ Documento não afirma que aluno não é usuário
- ✅ Modelo conceitual inclui AdminProfile, StaffProfile, ProfessorProfile, StudentProfile
- ✅ Nenhuma tela é implementada (apenas especificação)
- ✅ Nenhum asset externo é criado
- ✅ Nenhuma publicação é feita

---

**Próximas ações:**
1. ✅ Especificação completa criada
2. ⏳ Atualizar DECISIONS.md com decisão de RBAC
3. ⏳ Atualizar PROJECT_CONTROL.md com Session 009
4. ⏳ Commit e push com validação local
5. 🎯 Implementação de papéis/permissões (Session 010+)

**Status**: 🔷 Especificação pronta para revisão
