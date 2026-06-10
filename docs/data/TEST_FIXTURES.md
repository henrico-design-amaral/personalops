# Test Fixtures — PersonalOps V1.2

Todos os arquivos em `assets/data/` usam dados sintéticos para validar operação, treino e cobrança Pix mockada. Não há CPF real, chave Pix real, conta bancária real, aluno real ou pagamento real.

## Entidades

- `users.json`: credenciais demo por perfil.
- `professionals.json`: professores sintéticos com perfil financeiro mascarado e provider `pix-manual-mock`.
- `students.json`: 16 alunos sintéticos com modo de treino, risco, plano, assinatura, vencimento e grade semanal.
- `plans.json`, `subscriptions.json`, `invoices.json`: planos, recorrências e cobranças demonstrativas.
- `notification-rules.json` e `notification-events.json`: régua automática simulada; não envia WhatsApp, e-mail ou push real.
- `exercises.json`: 50 exercícios com placeholders visuais sem imagens externas.
- `workout-library.json`: biblioteca de treinos prontos clonáveis.
- `workout-templates.json`: modelos reutilizáveis pelo professor.
- `prescribed-workouts.json`: treinos publicados para alunos específicos.
- `workout-events.json`, `feedbacks.json`, `assessments.json`, `voice-drafts.json`: execução, feedback, anamnese sintética e criação assistida por voz/texto.

## Relacionamentos

Aluno aponta para `professionalId`, `planId`, `subscriptionId` e `weeklyScheduleId`. Assinatura aponta para plano e aluno. Cobrança aponta para assinatura. Treino prescrito aponta para aluno e biblioteca. Eventos de treino e feedbacks apontam para aluno e treino.

## Biblioteca, Template e Prescrição

`workout-library.json` representa treinos prontos de sistema. `workout-templates.json` representa modelos reutilizáveis que o professor pode adaptar. `prescribed-workouts.json` representa o treino vinculado a um aluno em uma data/dia.

## Evolução futura

Para banco real, manter os mesmos IDs semânticos, migrar relações para tabelas e substituir `pix-manual-mock` por um `PaymentProvider` real somente fora do GitHub Pages e sem dados sensíveis no repositório.
