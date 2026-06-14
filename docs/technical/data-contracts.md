# Data Contracts — PersonalOps

**Data**: 2026-06-14  
**Versão**: 1.0 — Data Contracts  
**Status**: Contratos mínimos prontos para implementação  

---

## 1. VISÃO GERAL

Este documento define os contratos mínimos de dados para PersonalOps baseado na especificação RBAC v1.0. Cada entidade lista:
- **Campos mínimos** (obrigatórios para MVP)
- **Status possíveis** (enum, se aplicável)
- **Relações** (ForeignKeys, cardinality)
- **Permissões CRUD** (por perfil: Admin, Staff, Professor, Student)
- **Invariantes** (regras que nunca podem ser violadas)

Estes contratos servem como bridge entre especificação funcional e implementação de schema (SQL, NoSQL, ou outro).

---

## 2. ENTIDADES CORE

---

### 2.1 User (Autenticação Base)

**Propósito**: Entidade de autenticação única para qualquer ator (Admin, Professor, Student).

**Campos Mínimos**:
```
id: string (unique, PK)
email: string (unique, validated format)
password: string (hashed, bcrypt v2b)
isActive: boolean (default: true)
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status**: N/A (User tem apenas isActive: true/false)

**Relações**:
- `1:N` com RoleAssignment (um User pode ter múltiplos papéis)
- `0:1` com AdminProfile (opcional, se role=admin)
- `0:1` com StaffProfile (opcional, se role=staff)
- `0:1` com ProfessorProfile (opcional, se role=professor)
- `0:1` com StudentProfile (opcional, se role=student)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | próprio | N/A | próprio | N/A (via Invitation) |
| Read | próprio | N/A | próprio | próprio |
| Update | próprio (senha) | N/A | próprio (senha) | próprio (senha) |
| Delete | N/A (soft apenas) | N/A | N/A | N/A |

**Invariantes**:
- Email deve ser único no sistema
- Password nunca é retornado em queries (apenas hashed)
- Nunca hard-delete (soft delete via isActive=false)
- StudentProfile User só criado após Invitation.status=ativado
- Admin/Professor Users criados por onboarding ou seed, nunca por Student

---

### 2.2 RoleAssignment (Atribuição de Papel)

**Propósito**: Define qual papel (role) um User tem no sistema. Permite múltiplos papéis por User.

**Campos Mínimos**:
```
id: string (unique, PK)
userId: string (FK → User, required)
role: enum ['admin' | 'staff' | 'professor'] (required)
profileId: string (FK → AdminProfile | StaffProfile | ProfessorProfile)
isActive: boolean (default: true)
assignedAt: timestamp (immutable)
createdAt: timestamp (immutable)
```

**Status**: isActive (true/false apenas)

**Relações**:
- `N:1` com User (muitos RoleAssignments apontam para um User)
- `1:1` com AdminProfile / StaffProfile / ProfessorProfile (um assignment, um profile)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | próprio (seed) | N/A | N/A | N/A |
| Read | próprio | N/A | próprio | N/A |
| Update | isActive apenas | N/A | N/A | N/A |
| Delete | N/A (soft) | N/A | N/A | N/A |

**Invariantes**:
- role em User.RoleAssignments deve corresponder ao tipo de Profile
- Um User não pode ter 2x o mesmo role
- Revogar role (isActive=false) não deleta o RoleAssignment
- Student não tem RoleAssignment (User Student não tem role, apenas StudentProfile)

---

### 2.3 AdminProfile (Perfil Administrativo)

**Propósito**: Identidade de administrador da plataforma. Gerencia exercícios base, métricas agregadas, suporte técnico.

**Campos Mínimos**:
```
id: string (unique, PK)
userId: string (FK → User, unique, required)
role: literal 'admin' (required)
name: string (required)
isFirstLoginDone: boolean (default: false)
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status**: isFirstLoginDone (true/false apenas)

**Relações**:
- `1:1` com User (um AdminProfile, um User)
- `1:N` com Exercise (Admin cria/edita exercícios base)
- `1:N` com SupportActionLog (Admin executa ações técnicas)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | seed | N/A | N/A | N/A |
| Read | próprio | N/A | N/A | N/A |
| Update | próprio (name, isFirstLoginDone) | N/A | N/A | N/A |
| Delete | N/A | N/A | N/A | N/A |

**Invariantes**:
- AdminProfile.userId deve existir e ter RoleAssignment com role='admin'
- Admin não cria StudentProfile ou ProfessorStudentLink
- Admin não cria alunos (apenas Invitation → Professor → Student)
- Admin não edita prescrição, treino, execução, fotos ou feedback

---

### 2.4 StaffProfile (Perfil de Suporte)

**Propósito**: Identidade de staff/suporte técnico. Atua em suporte: reenviar convites, desbloquear alunos, resetar senhas.

**Campos Mínimos**:
```
id: string (unique, PK)
userId: string (FK → User, unique, required)
role: literal 'staff' (required)
name: string (required)
department: string (optional, ex: "technical-support")
isFirstLoginDone: boolean (default: false)
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status**: isFirstLoginDone (true/false apenas)

**Relações**:
- `1:1` com User (um StaffProfile, um User)
- `1:N` com SupportActionLog (Staff executa ações técnicas)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | seed | N/A | N/A | N/A |
| Read | próprio | próprio | N/A | N/A |
| Update | próprio (name, department) | próprio (name) | N/A | N/A |
| Delete | N/A | N/A | N/A | N/A |

**Invariantes**:
- StaffProfile.userId deve existir e ter RoleAssignment com role='staff'
- Staff pode ler logs de suas próprias ações; Admin Super pode ler todos
- Staff executa ações de suporte técnico (reenviar, desbloquear, resetar)
- Staff não cria alunos ou prescreve treinos

---

### 2.5 ProfessorProfile (Perfil Operacional do Professor)

**Propósito**: Identidade de professor/trainer. Gerencia alunos, prescreve treinos, acompanha execução.

**Campos Mínimos**:
```
id: string (unique, PK)
userId: string (FK → User, unique, required)
role: literal 'professor' (required)
name: string (required)
specialty: string (required, ex: 'hipertrofia', 'emagrecimento', 'força')
location: string (required, ex: 'academia', 'estúdio', 'online', 'híbrido')
cref: string (optional, certificação profissional)
isFirstLoginDone: boolean (default: false)
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status**: isFirstLoginDone (true/false apenas)

**Relações**:
- `1:1` com User (um ProfessorProfile, um User)
- `1:N` com ProfessorStudentLink (professor → múltiplos alunos)
- `1:N` com Invitation (professor cria convites)
- `1:N` com WorkoutTemplate (professor cria seus próprios templates)
- `1:N` com CardioTemplate (professor cria seus próprios templates)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | seed | N/A | N/A (onboarding) | N/A |
| Read | agregado | N/A | próprio | N/A |
| Update | N/A | N/A | próprio | N/A |
| Delete | N/A | N/A | N/A | N/A |

**Invariantes**:
- ProfessorProfile.userId deve existir e ter RoleAssignment com role='professor'
- Professor não pode editar StudentProfile diretamente (apenas via ProfessorStudentLink)
- Professor não pode ver alunos de outros professores
- Professor não define ou reseta senhas de alunos

---

### 2.6 StudentProfile (Perfil Operacional do Aluno)

**Propósito**: Identidade de aluno/student. Executa treinos, envia feedback, acessa portal próprio.

**Campos Mínimos**:
```
id: string (unique, PK)
userId: string (FK → User, unique, required)
role: literal 'student' (required)
name: string (required)
email: string (optional, email de contato, pode diferir de User.email)
dateOfBirth: date (optional)
photo: string (optional, URL ou path)
status: enum ['convidado' | 'habilitado' | 'pausado' | 'arquivado' | 'bloqueado']
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status Possíveis**:
- `convidado`: Invitation criado, User não existe ainda, aluno não pode fazer login
- `habilitado`: User ativou Invitation, criou senha, pode fazer login
- `pausado`: Temporariamente inativo (férias, lesão), User existe mas acesso oculto de operação
- `arquivado`: Inativo permanentemente, User existe mas acesso revogado
- `bloqueado`: Acesso técnico suspenso, User existe mas login bloqueado (ação de suporte)

**Relações**:
- `1:1` com User (um StudentProfile, um User)
- `1:1` com ProfessorStudentLink (um aluno, um professor owner)
- `1:N` com WorkoutSession (aluno executa múltiplos treinos)
- `1:N` com PostWorkoutFeedback (aluno envia múltiplos feedbacks)
- `1:N` com DayAssignment (aluno tem agenda semanal prescrita)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | N/A | N/A | via Invitation | N/A |
| Read | agregado | N/A | próprio + alunos | próprio |
| Update | N/A | N/A | data/vencimento/plano | próprio (foto, dob) |
| Delete | N/A (soft) | N/A | N/A (soft) | N/A |

**Invariantes**:
- StudentProfile.userId deve existir e ter RoleAssignment com role='student'
- StudentProfile criado APÓS Invitation.status=ativado
- Student só pode acessar seus próprios dados
- Professor não visualiza User.password do aluno
- Admin não cria StudentProfile diretamente
- Status transição: convidado→habilitado→pausado↔habilitado→arquivado (nunca hard delete)

---

### 2.7 ProfessorStudentLink (Vínculo Operacional)

**Propósito**: Representa a relação operacional entre professor e aluno. Controla acesso, status, período.

**Campos Mínimos**:
```
id: string (unique, PK)
professorId: string (FK → ProfessorProfile, required)
studentId: string (FK → StudentProfile, required, unique per professor)
mode: enum ['presencial' | 'online' | 'híbrido'] (required)
plan: enum ['básico' | 'premium' | 'elite'] (required)
startDate: date (required)
expiresAt: date (required, vencimento do plano)
status: enum ['ativo' | 'pausado' | 'arquivado'] (default: 'ativo')
notes: string (optional, notas do professor)
pausedAt: timestamp (optional, when paused)
pausedUntil: date (optional, previsão de retorno)
archivedAt: timestamp (optional, when archived)
archivedReason: string (optional)
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status Possíveis**:
- `ativo`: Aluno participando, acesso completo
- `pausado`: Temporariamente inativo, User existe, acesso oculto de operação
- `arquivado`: Inativo permanentemente, User existe, acesso revogado

**Relações**:
- `N:1` com ProfessorProfile (múltiplos alunos, um professor)
- `N:1` com StudentProfile (um aluno, um professor owner)
- `1:N` com DayAssignment (agenda semanal)
- `1:N` com WorkoutSession (histórico de treinos)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | N/A | N/A | via Invitation | N/A |
| Read | agregado | N/A | próprio | próprio (read-only) |
| Update | N/A | N/A | modo, plan, status, notes | N/A |
| Delete | N/A (soft) | N/A | N/A (soft) | N/A |

**Invariantes**:
- Cada StudentProfile tem exatamente um ProfessorStudentLink (ativo ou pausado)
- ProfessorStudentLink.status=pausado não afeta StudentProfile.status (apenas operação)
- ProfessorStudentLink.status=arquivado → StudentProfile.status=arquivado
- Professor não pode transferir aluno (vínculo é permanente até arquivo)
- Pausar vínculo preserva histórico; Student vê apenas dados históricos
- Nenhum hard delete (soft delete apenas via status=arquivado)

---

### 2.8 Invitation (Convite)

**Propósito**: Rastreia convite de aluno e seu fluxo de ativação.

**Campos Mínimos**:
```
id: string (unique, PK)
token: string (unique, 32 chars hex, cryptographically secure, immutable)
professorId: string (FK → ProfessorProfile, required)
invitedEmail: string (required, email do convidado)
invitedName: string (required)
mode: enum ['presencial' | 'online' | 'híbrido'] (required)
plan: enum ['básico' | 'premium' | 'elite'] (required)
startDate: date (required)
expiresAt: date (required, vencimento do plano)
status: enum ['pendente' | 'ativado' | 'expirado' | 'cancelado'] (default: 'pendente')
tokenExpiresAt: timestamp (required, ex: now + 30 dias, immutable)
activatedAt: timestamp (optional, when student activated)
studentProfileId: string (optional, FK → StudentProfile após ativação)
createdAt: timestamp (immutable)
updatedAt: timestamp (auto-managed)
```

**Status Possíveis**:
- `pendente`: Convite criado, token válido, aluno não ativou ainda
- `ativado`: Student criou User com senha, StudentProfile criado, Invitation consumido
- `expirado`: Token > tokenExpiresAt, Student não ativou
- `cancelado`: Professor ou Admin cancelou antes de ativação

**Relações**:
- `N:1` com ProfessorProfile (múltiplos convites, um professor)
- `0:1` com StudentProfile (criado após ativação)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | N/A | N/A | novo convite | N/A |
| Read | agregado | N/A | próprio | via token (público) |
| Update | N/A | N/A | cancelar (status) | N/A |
| Delete | N/A | N/A | N/A | N/A |

**Invariantes**:
- token deve ser único e criptograficamente seguro (32 caracteres hexadecimais mínimo)
- Após status=ativado, token não pode ser reutilizado
- tokenExpiresAt imutável (define-se na criação)
- Invitation.expiresAt ≠ tokenExpiresAt: expiresAt é vencimento do plano; tokenExpiresAt é expiração do token
- Apenas um Invitation ativo por invitedEmail (não há múltiplos convites pendentes para mesmo email)
- Admin pode gerar novo Invitation (reenviar) se anterior expirou

---

### 2.9 PasswordRecovery (Recuperação de Acesso)

**Propósito**: Rastreia tentativas de recuperação de senha com auditoria.

**Campos Mínimos**:
```
id: string (unique, PK)
token: string (unique, 32 chars hex, cryptographically secure, immutable)
userId: string (FK → User, required)
userEmail: string (required, email do usuário, cópia para auditoria)
status: enum ['solicitado' | 'usado' | 'expirado' | 'cancelado'] (default: 'solicitado')
tokenExpiresAt: timestamp (required, ex: now + 24 horas, immutable)
usedAt: timestamp (optional, when token was consumed)
usedIp: string (optional, IP de consumo para auditoria)
requestedAt: timestamp (immutable)
createdAt: timestamp (immutable)
```

**Status Possíveis**:
- `solicitado`: Token gerado, e-mail "enviado", User não atualizou ainda
- `usado`: User criou nova senha, token consumido, User.password atualizado
- `expirado`: Token > tokenExpiresAt, User não atualizou
- `cancelado`: Admin/Staff cancelou (ex: múltiplas tentativas suspeitas)

**Relações**:
- `N:1` com User (múltiplas recovery attempts, um User)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | N/A (seed) | N/A | N/A | via form (público) |
| Read | próprio (seed) | agregado | N/A | N/A |
| Update | N/A | cancelar | N/A | usar token |
| Delete | N/A | N/A | N/A | N/A |

**Invariantes**:
- token deve ser único e criptograficamente seguro (32 caracteres hexadecimais mínimo)
- Após status=usado, token não pode ser reutilizado
- tokenExpiresAt imutável (24 horas padrão)
- Admin dispara PasswordRecovery apenas via form pública; não define senha manualmente
- Apenas um PasswordRecovery ativo (solicitado) por User (não há múltiplas tentativas ativas)
- usedIp registrado para auditoria (opcional, para detecção de anomalias)

---

### 2.10 SupportActionLog (Auditoria de Suporte Técnico)

**Propósito**: Auditoria imutável de ações técnicas executadas por Admin/Staff.

**Campos Mínimos**:
```
id: string (unique, PK)
actionType: enum ['reenviar_convite' | 'desbloquear' | 'resetar_senha' | 'resolver_tecnico'] (required)
performedBy: string (FK → User, Admin/Staff que executou, required)
performedByRole: enum ['admin' | 'staff'] (required, snapshot)
targetUser: string (optional, FK → User, quem foi afetado)
targetStudent: string (optional, FK → StudentProfile, se aluno)
targetProfessor: string (optional, FK → ProfessorProfile, se professor)
details: {
  reason: string (obrigatório, por quê)
  notes: string (optional, comentários adicionais)
  resultingInvitationId: string (optional, se reenviar_convite)
  resultingPasswordRecoveryId: string (optional, se resetar_senha)
} (required, JSON object)
ipAddress: string (optional, IP de origem)
userAgent: string (optional, user agent da requisição)
timestamp: timestamp (immutable)
createdAt: timestamp (immutable)
```

**Status**: N/A (Log é imutável, read-only após criação)

**Relações**:
- `N:1` com User (performedBy)
- `0:1` com StudentProfile (targetStudent)
- `0:1` com ProfessorProfile (targetProfessor)
- `0:1` com Invitation (se reenviar_convite)
- `0:1` com PasswordRecovery (se resetar_senha)

**CRUD Permissions**:
| Ação | Admin | Staff | Professor | Student |
|------|-------|-------|-----------|---------|
| Create | próprio (seed) | próprio | N/A | N/A |
| Read | próprio + seed | próprio | N/A | N/A |
| Update | N/A (imutável) | N/A | N/A | N/A |
| Delete | N/A | N/A | N/A | N/A |

**Invariantes**:
- SupportActionLog é **imutável** (nunca editável, apenas insert)
- timestamp e createdAt são imutáveis (registram quando ação ocorreu)
- performedByRole é snapshot de User.RoleAssignment no momento da ação
- Admin Super pode ler todos os logs; Staff/Admin podem ler logs de suas próprias ações
- Cada ação técnica cria exatamente um SupportActionLog
- actionType determina quais campos opcionais devem estar preenchidos:
  - `reenviar_convite`: resultingInvitationId obrigatório
  - `resetar_senha`: resultingPasswordRecoveryId obrigatório
  - `desbloquear`: targetStudent obrigatório
  - `resolver_tecnico`: targetUser obrigatório

---

## 3. RELAÇÕES DE INTEGRIDADE REFERENCIAL

### Diagrama Simplificado

```
User (base de autenticação)
├── 1:N RoleAssignment
│   ├── AdminProfile (1:1)
│   ├── StaffProfile (1:1)
│   ├── ProfessorProfile (1:1)
│   │   ├── 1:N Invitation
│   │   ├── 1:N ProfessorStudentLink
│   │   └── 1:N WorkoutTemplate
│   └── StudentProfile (1:1)
│       ├── 1:1 ProfessorStudentLink (N:1 professor)
│       ├── 1:N WorkoutSession
│       └── 1:N PostWorkoutFeedback

User ← PasswordRecovery (N:1)
User ← SupportActionLog (N:1 performedBy)
```

### Cascatas

| Ação | Efeito |
|------|--------|
| Delete User (soft) | isActive=false; RoleAssignments permanecem; StudentProfile preservado |
| Archive ProfessorStudentLink | StudentProfile.status→arquivado |
| Pause ProfessorStudentLink | StudentProfile.status permanece; apenas link pausado |
| Expire Invitation (token) | Invitation.status→expirado; StudentProfile não criado |
| Consume PasswordRecovery | User.password atualizado; token consumido |

---

## 4. PERMISSÕES CRUD POR PERFIL

**Legenda**: ✅ = Permitido | ❌ = Proibido | 🔒 = Somente leitura | 🔄 = Limitado

| Entidade | Admin | Staff | Professor | Student |
|----------|-------|-------|-----------|---------|
| **User** | ✅C(seed) 🔒R ✅U(senha) ❌D | ❌ | ✅C(onboarding) 🔒R ✅U(senha) ❌D | ✅C(via Inv) 🔒R(próprio) ✅U(senha,perfil) ❌D |
| **RoleAssignment** | ✅C(seed) 🔒R ✅U(isActive) ❌D | ❌ | ❌ | ❌ |
| **AdminProfile** | ✅C(seed) 🔒R(próprio) ✅U(próprio) ❌D | ❌ | ❌ | ❌ |
| **StaffProfile** | ✅C(seed) 🔒R ✅U(próprio) ❌D | 🔒R(próprio) ✅U(próprio) ❌D | ❌ | ❌ |
| **ProfessorProfile** | 🔒R(agregado) ❌C ✅U(N/A) ❌D | ❌ | ✅C(onboarding) 🔒R(próprio) ✅U(próprio) ❌D | ❌ |
| **StudentProfile** | 🔒R(agregado) ❌C ❌U ❌D(soft) | ❌ | 🔒R(próprios) ✅U(dados) ❌D(soft) | 🔒R(próprio) ✅U(perfil) ❌D |
| **ProfessorStudentLink** | 🔒R(agregado) ❌C ❌U ❌D | ❌ | 🔒R(próprios) ✅U(status,modo,plan) ❌D(soft) | 🔒R(próprio) ❌U ❌D |
| **Invitation** | 🔒R(agregado) ❌C ❌U ❌D | ❌ | ✅C(novo) 🔒R(próprio) ✅U(cancelar) ❌D | 🔒R(via token) ❌U ❌D |
| **PasswordRecovery** | 🔒R(agregado) ❌C ✅U(cancelar) ❌D | 🔒R ✅U(cancelar) ❌D | ❌ | ✅C(form) 🔒R(N/A) ✅U(usar) ❌D |
| **SupportActionLog** | ✅C(ação) 🔒R(próprio+seed) ❌U ❌D | ✅C(ação) 🔒R(próprio) ❌U ❌D | ❌ | ❌ |

---

## 5. INVARIANTES DE SEGURANÇA

### Invariantes Críticas (nunca violar)

1. **Student IS User**: StudentProfile.userId deve existir, User.isActive=true, RoleAssignment.role='student'
2. **Student via Invitation**: StudentProfile criado APÓS Invitation.status=ativado, nunca antes
3. **Student NEVER deleted hard**: StudentProfile soft-deleted via status=arquivado, User nunca hard-deleted
4. **Professor owns Student**: Cada StudentProfile tem exatamente um ProfessorStudentLink ativo/pausado
5. **Professor no password control**: Professor nunca vê User.password de aluno, nunca define ou reseta manualmente
6. **Admin NO student creation**: Admin não cria StudentProfile, não pode alterar status de StudentProfile, não pode arquivar Invitation
7. **Admin NO operational editing**: Admin não edita prescrição, treino, execução, fotos, feedback
8. **Support action audit**: Cada ação técnica cria exatamente um SupportActionLog imutável
9. **Token security**: Invitation.token e PasswordRecovery.token únicos, criptograficamente seguros (32+ chars hex)
10. **No hard delete MVP**: Nenhuma entidade hard-deletada no MVP; apenas soft-delete via status ou isActive

### Invariantes de Domínio (negócio)

1. Professor controla: prescrição, pausa/arquivo de aluno, modo, plano, vencimento
2. Admin controla: suporte técnico (reenviar convites, desbloquear, resetar), exercícios base, métricas agregadas
3. Student controla: dados próprios (perfil, foto, dob), senha, feedback, execução
4. Aluno pausado: StudentProfile.status=pausado; ProfessorStudentLink.status=pausado; histórico preservado
5. Aluno arquivado: StudentProfile.status=arquivado; ProfessorStudentLink.status=arquivado; acesso revogado
6. Convite expirado: Invitation.status=expirado; StudentProfile não criado; Professor pode reenviar via Admin
7. Sem transferência: Uma vez vinculado, aluno não transfere para outro professor (vínculo permanente até arquivo)

---

## 6. SEEDS MÍNIMOS FUTUROS

Sem implementação agora, mas documentados para uso posterior:

### Admin Seed
```javascript
{
  userId: "admin-1",
  name: "Administrator",
  specialty: null,
  location: null,
  cref: null,
  isFirstLoginDone: true
}
```

### Exercício Base Seed (50+)
Referência: `docs/product/exercise-system.md`
- 50+ exercícios base (biblioteca padrão)
- Cada um com schema completo (vide exercise-system.md)

### Professor Seed (test)
```javascript
{
  userId: "prof-test-1",
  name: "João Personal",
  specialty: "hipertrofia",
  location: "estúdio",
  cref: "CREF 1234567890",
  isFirstLoginDone: true
}
```

### Student Seed (test)
Criado via Invitation activation, nunca seed direto.

---

## 7. NOTA SOBRE IMPLEMENTAÇÃO

Estes contratos são **agnósticos de tecnologia**. Podem ser implementados como:
- **SQL**: PostgreSQL, MySQL (schemas com foreign keys, constraints)
- **NoSQL**: MongoDB, Firestore (documentos com validação em aplicação)
- **Graph**: Neo4j (nós e relacionamentos)
- **JSON File**: localStorage + IndexedDB (protótipo local)

Próximas etapas:
1. Escolher tecnologia de persistência
2. Criar schema/model específico (SQL DDL, Mongoose models, etc.)
3. Implementar validação de invariantes em aplicação
4. Criar API CRUD com permissões por perfil

---

**Status**: ✅ Contratos completos, prontos para schema design.
