# PersonalOps V1.2 — Synthetic Test Fixtures

Este documento descreve a estrutura, relacionamentos, cenários simulados e evolução do modelo de dados sintéticos estáticos da versão V1.2.

---

## 1. Objetivo dos Dados
Garantir um ambiente de testes e validação de produto realista sem dependências externas (como Supabase, Firebase ou banco SQL). A consistência relacional permite simular a experiência de ponta a ponta dos diferentes perfis de usuários (Admin, Professor, Aluno) em cenários de uso cotidiano do aplicativo, como modo offline, registro de séries, acompanhamento de adesão e envio de feedbacks.

## 2. Entidades & Estruturas (JSONs)

### `users.json`
Controle de autenticação simulada e atribuição de papéis (`admin`, `professor`, `aluno`).
* **Relacionamentos**: Aponta para `professionals.json` via `professionalId` ou `students.json` via `studentId`.

### `professionals.json`
Armazena o perfil dos profissionais (personais).
* **Campos**: `id`, `name`, `specialty`, `methodSummary`, `communicationTone`, `activeStudentsCount`, `weeklyCheckinDay`, `defaultWorkoutSplit`, `aiRules`.

### `students.json`
Perfis de alunos com características variadas (adesão, limitações físicas, etc.).
* **Relacionamentos**: Vinculado a um profissional via `professionalId`.
* **Campos**: `id`, `professionalId`, `name`, `goal`, `trainingMode` (Híbrido/Online/Presencial), `level`, `adherenceStatus` (Alta/Média/Baixa), `riskLevel` (Alto/Médio/Baixo), `lastWorkoutAt`, `nextWorkoutAt`, `restrictions`, `preferredGymContext`, `usesBluetooth`, `internetQuality`, `notes`.

### `exercises.json`
Catálogo de 40 exercícios de musculação enriquecidos com dicas e segurança.
* **Mídia**: Mockada através de `visualType` (`css-mannequin`, `licensed-gif-placeholder`, `future-3d-placeholder`) e `visualStatus` (`placeholder`, `needs-license`, `future-owned-asset`).

### `workout-templates.json`
Divisões de treinos predefinidas usadas por profissionais para prescrever treinos rapidamente.
* **Relacionamentos**: Ligados a `professionals.json` via `professionalId` e `exercises.json` via `exerciseBlocks.exerciseId`.

### `prescribed-workouts.json`
Planilhas de treinos agendadas especificamente para alunos individuais.
* **Relacionamentos**: Mapeia `studentId`, `professionalId` e array de exercícios vinculados por `exerciseId`.

### `workout-events.json`
Histórico de logs de atividades que simulam telemetria operacional (início, término, séries registradas, alterações de carga).
* **Campos**: `id`, `studentId`, `workoutId`, `type` (`workout_started`, `set_completed`, `rest_started`, `rest_finished`, `load_changed`, `exercise_skipped`, `workout_finished`, `feedback_submitted`, `sync_pending`, `sync_completed`), `createdAt`, `payload`, `syncStatus`.

### `feedbacks.json`
Feedbacks e anotações dos alunos enviados após os treinos.
* **Relacionamentos**: Ligados a `studentId`, `workoutId` (opcional) e `exerciseId` (opcional).

### `assessments.json`
Anamneses detalhadas correspondendo ao perfil do aluno.
* **Relacionamentos**: Ligados a `studentId`.

### `payments.json`
Fluxo financeiro simulado para visualização no painel administrativo.
* **Relacionamentos**: Ligados a `studentId`.

---

## 3. Cenários de Teste Simulados
Os dados contêm perfis estratégicos criados deliberadamente para testar fluxos importantes do produto:
1. **Risco de Evasão (Churn)**: O aluno Lucas Sousa (`std-10`) tem adesão `Baixa` e `riskLevel: "Alto"`, com último treino há mais de 10 dias. O dashboard do professor destaca este alerta.
2. **Revisão de Planilha**: A aluna Fernanda Melo (`std-13`) tem um feedback sinalizado com `requiresReview: true` devido a dificuldades de execução na flexão de solo.
3. **Modo Offline e Sincronização**: O histórico contém eventos da aluna Roberto Alves com `syncStatus: "sync_pending"`, simulando registros salvos localmente esperando rede.
4. **Restrições de Movimento**: Luiza Santos (`std-05`) possui restrição de "Condromalácia patelar grau I". O personal configurou regras e observações de amplitude de agachamento em suas notas.

---

## 4. Evolução para Banco de Dados Real
Para transicionar deste modelo estático para um banco de dados real (como PostgreSQL via Supabase ou Firebase Firestore):
1. **Migração de Schemas**: As chaves dos arquivos JSON traduzem-se diretamente em colunas SQL (com chaves estrangeiras `FOREIGN KEY` referenciando relacionamentos).
2. **Criação de APIs/Handlers**: O módulo `data-store.js` será substituído por chamadas de rede para o backend ou SDK do banco (ex: `supabase.from('students').select('*')`).
3. **Auth**: Substituir a verificação de credenciais em texto claro no `users.json` por JWT tokens e fluxos padrão de autenticação do provedor escolhido.
