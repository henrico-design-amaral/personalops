# V1.2 / V1.3 Test Plan

Este arquivo permanece como trilha curta da V1.2. Para a validação completa de frequência, progresso, feedback pós-treino e dashboard da plataforma, usar `docs/qa/V1_3_TEST_PLAN.md`.

## Perfis

1. Abrir memorial público.
2. Entrar na aplicação.
3. Logar com Admin, Professor e Aluno usando credenciais demo.

## Admin

Verificar cards financeiros, cobranças Pix mockadas, notificações, alunos ativos, inadimplentes e aviso de pagamento demonstrativo.

## Professor

Verificar alunos com status financeiro, vencimentos próximos, inadimplentes, dados Pix mockados, biblioteca de treinos, clonar treino, grade semanal, feedbacks pendentes e rascunhos de voz/texto.

## Aluno

Verificar plano, periodicidade, próxima cobrança, status da mensalidade, QR Code Pix demonstrativo, Pix copia e cola, aviso de ambiente demonstrativo, treino da semana, treino do dia, timer, registro de série e fila offline.

## Cache e console

Rodar `node --check assets/js/app.js`, `node --check assets/js/data-store.js` e `git diff --check`. Em navegador, confirmar ausência de erro crítico do PersonalOps e ausência de overflow horizontal em viewport mobile.
