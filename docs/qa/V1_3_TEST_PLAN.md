# V1.3 Test Plan — Progress, Feedback and Platform Dashboard

## Memorial

1. Abrir o memorial público.
2. Confirmar menção a frequência, progresso, feedback pós-treino, Pix mockado e dashboard da plataforma.
3. Confirmar CTA "Entrar na aplicação".

## Admin PersonalOps

1. Login Admin.
2. Em desktop, verificar dashboard completo da plataforma.
3. Verificar professores cadastrados, alunos totais, alunos ativos, baixa adesão, treinos executados, feedbacks, cobranças, notificações, biblioteca, mídia pendente, saúde técnica e logs.
4. Em mobile, verificar aviso desktop-only.

## Professor

1. Login Professor.
2. Ver alunos, frequência, faltas, adesão, progresso e risco.
3. Ver feedbacks pós-treino e feedbacks críticos.
4. Abrir perfil completo do aluno.
5. Confirmar anamnese, avaliação física, bioimpedância mockada, frequência, grade semanal, financeiro e feedbacks.
6. Abrir Novo aluno e Editar aluno.
7. Clonar treino e confirmar toast local.

## Aluno

1. Login Aluno.
2. Ver dados, plano, vencimento, Pix mockado e QR Code demonstrativo.
3. Ver evolução, bioimpedância mockada e semana de treino.
4. Abrir treino do dia.
5. Registrar série.
6. Finalizar treino.
7. Enviar feedback pós-treino.
8. Confirmar histórico de feedbacks e fila local/mockada.

## Técnica

1. Rodar `node --check assets/js/app.js`.
2. Rodar `node --check assets/js/data-store.js`.
3. Rodar `git diff --check`.
4. Parsear todos os JSONs.
5. Verificar console sem erro crítico.
6. Verificar mobile Professor/Aluno sem overflow horizontal.
