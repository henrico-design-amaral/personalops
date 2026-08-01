# Fixture Scenarios — PersonalOps

**Data**: 2026-06-14  
**Versão**: 1.0  
**Status**: Cenários mínimos de teste para validação de acesso por perfil  

---

## 1. VISÃO GERAL

Este documento descreve os cenários de teste criados em fixtures JSON para validar regras de acesso e domínio por perfil no PersonalOps.

**Arquivo de referência**: `public/assets/data/`

**Dez arquivos de fixtures**:
1. `users.json` — Entidade User (autenticação base)
2. `role-assignments.json` — Atribuição de papéis
3. `admin-profiles.json` — Perfil administrativo
4. `staff-profiles.json` — Perfil de suporte técnico
5. `professor-profiles.json` — Perfis de professores
6. `student-profiles.json` — Perfis de alunos
7. `professor-student-links.json` — Vínculos professor-aluno
8. `invitations.json` — Convites (pendente, expirado)
9. `password-recoveries.json` — Recuperações de acesso
10. `support-action-logs.json` — Logs de ações técnicas

---

## 2. POPULAÇÃO DE DADOS

### Identidades (User)

| ID | Email | Role | Descrição |
|----|----|------|-----------|
| `admin-1` | `admin@personalops.test` | admin | Administrador principal |
| `staff-1` | `staff@personalops.test` | staff | Suporte técnico |
| `prof-a` | `joao.silva@personaltrainer.com` | professor | Professor A (3 alunos) |
| `prof-b` | `maria.santos@personaltrainer.com` | professor | Professor B (1 aluno) |
| `std-01` | `aluno.um@email.com` | student | Aluno Um (prof-a, ativo) |
| `std-02` | `aluno.dois@email.com` | student | Aluno Dois (prof-a, pausado) |
| `std-03` | `aluno.tres@email.com` | student | Aluno Três (prof-a, arquivado) |
| `std-04` | `aluno.quatro@email.com` | student | Aluno Quatro (prof-b, ativo) |

### Professores

| ID | Nível | Especialidade | Alunos |
|----|-------|---------------|--------|
| `prof-a` | João Silva | Hipertrofia | std-01 (ativo), std-02 (pausado), std-03 (arquivado) |
| `prof-b` | Maria Santos | Emagrecimento | std-04 (ativo) |

### Alunos por Professor

**Professor A (João Silva)**:
- `std-01` — Status: **habilitado** (ativo), modo presencial, plano premium
- `std-02` — Status: **pausado** (temporariamente), modo online, plano básico (pausado em 2026-06-10)
- `std-03` — Status: **arquivado** (permanentemente), modo híbrido, plano elite (arquivado em 2026-06-10)

**Professor B (Maria Santos)**:
- `std-04` — Status: **habilitado** (ativo), modo presencial, plano premium

### Convites

| ID | Status | Email | Professor | Expiração | Notas |
|----|--------|-------|-----------|-----------|-------|
| `inv-01` | **pendente** | novo.aluno.a@email.com | prof-a | 2026-07-14 | Aluno novo não ativou |
| `inv-02` | **expirado** | novo.aluno.b@email.com | prof-b | 2026-06-14 | Token expirou sem ativação |

### Recuperação de Acesso

| ID | Usuário | Status | Expiração | Notas |
|----|---------|--------|-----------|-------|
| `pr-01` | std-02 | **solicitado** | 2026-06-15 | Aluno dois solicitou recuperação |

### Logs de Suporte Técnico

| ID | Ação | Executor | Alvo | Notas |
|----|------|----------|------|-------|
| `sal-01` | reenviar_convite | staff-1 | prof-b, inv-02 | Staff reenviou convite expirado |

---

## 3. REGRAS DE ACESSO POR PERFIL

### Admin (admin-1)

**Pode acessar**:
- ✅ Lista de todos os professores
- ✅ Status técnico dos alunos (convidado, habilitado, pausado, arquivado, bloqueado)
- ✅ Métricas agregadas (total de alunos, professores)
- ✅ Logs de suporte técnico (auditoria)

**NÃO pode acessar/editar**:
- ❌ Dados operacionais de alunos (prescrição de treinos)
- ❌ Execução de treinos por aluno
- ❌ Fotos ou feedback físico do aluno
- ❌ Senha do aluno (apenas dispara fluxo de recuperação)
- ❌ Workspace de professor (operação)

**Ações de suporte técnico que PODE fazer**:
- ✅ Reenviar convite (gera novo token)
- ✅ Desbloquear aluno (muda status: bloqueado → habilitado)
- ✅ Resetar senha (dispara PasswordRecovery)

### Staff (staff-1)

**Pode acessar**:
- ✅ Logs de suporte técnico (próprias ações)
- ✅ Executar ações de suporte técnico (reenviar, desbloquear, resetar)

**NÃO pode acessar**:
- ❌ Dados de alunos ou professores diretamente
- ❌ Logs de outras pessoas (apenas próprias ações)

### Professor A (prof-a)

**Pode acessar**:
- ✅ Seus alunos: `std-01` (ativo), `std-02` (pausado), `std-03` (arquivado)
- ✅ Prescrição de treinos
- ✅ Execução de treinos dos alunos
- ✅ Fotos e feedback dos alunos
- ✅ Histórico e progresso dos alunos

**NÃO pode acessar**:
- ❌ Alunos de outro professor (`std-04` de prof-b)
- ❌ Senha ou recuperação de acesso dos alunos
- ❌ Logs de suporte técnico
- ❌ Dashboard administrativo

**Ações que pode fazer**:
- ✅ Criar novo convite
- ✅ Reenviar convite próprio
- ✅ Pausar aluno (sem deletar)
- ✅ Arquivar aluno (soft delete)
- ✅ Prescrever treinos
- ✅ Acompanhar execução

### Aluno (std-01, std-02, std-03, std-04)

**Pode acessar** (apenas dados próprios):
- ✅ Próprio perfil (StudentProfile)
- ✅ Treinos prescritos
- ✅ Histórico de execução
- ✅ Dicas de coaching

**NÃO pode acessar**:
- ❌ Dados de outro aluno
- ❌ Prescrição (apenas ver, não editar)
- ❌ Dashboard administrativo
- ❌ Dados financeiros (cobranças)
- ❌ Workspace do professor

**Ações que pode fazer**:
- ✅ Editar dados próprios (perfil, foto, dob)
- ✅ Trocar senha
- ✅ Executar treino
- ✅ Registrar séries e feedback
- ✅ Solicitar recuperação de acesso

---

## 4. CENÁRIOS DE TESTE

### Cenário 1: Aluno Ativo (std-01)

**Contexto**: Aluno um vinculado a prof-a, status habilitado, sem problemas.

**Testes esperados**:
- Prof-a vê std-01 na lista de alunos
- Prof-a pode prescrever treinos para std-01
- Prof-a vê feedback de std-01
- Std-01 acessa próprio portal, vê treinos, executa, envia feedback
- Std-01 não acessa dados de std-02, std-03, std-04
- Admin vê std-01 sob prof-a com status "habilitado"
- Admin não pode editar treino de std-01

### Cenário 2: Aluno Pausado (std-02)

**Contexto**: Aluno dois vinculado a prof-a, status pausado desde 2026-06-10 (férias).

**Testes esperados**:
- Prof-a vê std-02 com status "pausado"
- Prof-a pode ver histórico de std-02, mas operação ocultada
- Prof-a pode reativar pausa (despausar)
- Std-02 acessa recuperação de acesso (`pr-01` solicitado)
- Std-02 não vê treinos da semana (acesso suspenso)
- Admin vê std-02 com status "pausado" sob prof-a

### Cenário 3: Aluno Arquivado (std-03)

**Contexto**: Aluno três vinculado a prof-a, status arquivado desde 2026-06-10 (cancelamento).

**Testes esperados**:
- Prof-a vê std-03 com status "arquivado"
- Prof-a não pode reativar std-03 (permanente)
- Std-03 não pode fazer login (acesso revogado)
- Admin vê std-03 com status "arquivado", razão "Cancelamento por mudança de cidade"
- Histórico de std-03 preservado para auditoria

### Cenário 4: Convite Pendente (inv-01)

**Contexto**: Convite criado por prof-a, ainda não ativado, token válido até 2026-07-14.

**Testes esperados**:
- Prof-a vê convite com status "pendente"
- Prof-a pode reenviar convite
- Novo User/StudentProfile não criado ainda
- Admin pode reenviar convite (via suporte técnico)
- Token expira automaticamente em 2026-07-14

### Cenário 5: Convite Expirado (inv-02)

**Contexto**: Convite criado por prof-b, não ativado, token expirou em 2026-06-14.

**Testes esperados**:
- Prof-b vê convite com status "expirado"
- Prof-b pode reenviar (Admin gera novo)
- Admin (staff-1) reenviou via `sal-01` (reenviar_convite)
- Novo User/StudentProfile ainda não criado
- Novo token gerado (mockado)

### Cenário 6: Isolamento de Alunos

**Contexto**: Prof-a com alunos std-01, std-02, std-03; Prof-b com aluno std-04.

**Testes esperados**:
- Prof-a nunca vê std-04 (Prof-b's student)
- Prof-b nunca vê std-01, std-02, std-03 (Prof-a's students)
- Std-01 nunca acessa std-04 (outro aluno)
- Admin vê ambos os professores e alunos, mas não interfere em operação

### Cenário 7: Logs de Suporte (sal-01)

**Contexto**: Staff-1 reenviou convite expirado de prof-b.

**Testes esperados**:
- Só staff-1 e admin podem ler sal-01
- Log imutável (nunca editado)
- Registra: quem fez (staff-1), ação (reenviar_convite), alvo (prof-b, inv-02), timestamp
- Admin pode ler todos os logs; staff-1 lê apenas próprios

---

## 5. INVARIANTES PRESERVADAS

### Invariante 1: Aluno É Usuário Autenticado
- Não há StudentProfile sem User correspondente
- Não há User.student sem RoleAssignment.student

### Invariante 2: Aluno Via Convite
- Aluno std-01, std-02, std-03, std-04 criados via Invitation (inv-01 foi template)
- Nenhum aluno criado direto (sem convite)

### Invariante 3: Professor Controla Aluno
- Cada StudentProfile tem exatamente um ProfessorStudentLink ativo
- Prof-a controla std-01, std-02, std-03
- Prof-b controla std-04

### Invariante 4: Admin Não Cria Aluno
- Admin não criou std-01, std-02, std-03, std-04
- Apenas Prof-a e Prof-b criaram convites

### Invariante 5: Sem Hard Delete
- Std-03 status arquivado, não deletado
- User std-03 ainda existe (isActive=true)
- Histórico preservado

### Invariante 6: Suporte Técnico Auditado
- sal-01 registra ação de staff-1
- Imutável, para análise futura

---

## 6. JSON VALIDATION

Todos os arquivos em `public/assets/data/` são JSON válidos e podem ser testados com:

```bash
npm run build  # Valida estrutura geral
```

Cada arquivo segue o contrato em `docs/technical/data-contracts.md`:
- Campos mínimos presentes
- Status válidos (enum)
- Relacionamentos corretos (ForeignKeys existem)
- Timestamps em ISO 8601

---

## 7. PRÓXIMAS ETAPAS

1. **Implementação de acesso**: Criar API/backend que valida essas regras
2. **UI de visualização**: Mostrar dados corretos por perfil
3. **Teste de segurança**: Validar que prof-a não consegue acessar std-04
4. **Seeds para produção**: Expandir fixtures com mais dados

---

**Status**: ✅ Cenários de teste definidos, prontos para validação.
