# V1.4 Visual QA Plan — Visual Flow and Smart Workout UX

## Memorial

1. Abrir o memorial público.
2. Confirmar menção à nova fase visual, cockpit operacional, biblioteca, clonagem, voz/texto, Pix mockado, dashboard da plataforma e semana do aluno.
3. Confirmar aviso de dados sintéticos e pagamentos demonstrativos.
4. Confirmar CTA para login.

## Admin

1. Login Admin.
2. Em desktop, verificar dashboard completo da plataforma.
3. Em mobile, verificar versão compacta, não bloqueio absoluto.
4. Confirmar métricas essenciais, alertas, saúde do sistema, pagamentos mockados e mídia/biblioteca resumida.
5. Confirmar ausência de overflow horizontal no mobile.

## Professor

1. Login Professor.
2. Confirmar hero operacional com alunos ativos, atenção, treinos hoje, feedbacks críticos e cobranças vencidas.
3. Confirmar bloco "Atenção agora".
4. Confirmar cards visuais de alunos em acompanhamento.
5. Abrir Novo Aluno e verificar selects, segmented controls, checkboxes, dias e tipos por dia.
6. Abrir Editar Aluno e verificar mesmos controles.
7. Abrir Criar Treino.
8. Confirmar modos: biblioteca, clonagem e voz/texto.
9. Filtrar biblioteca e visualizar exercícios.
10. Clonar treino de aluno origem para aluno destino e confirmar mensagem.
11. Abrir perfil do aluno e confirmar tabs.
12. Confirmar frequência, progresso, financeiro, feedbacks, avaliação e treinos no perfil.

## Aluno

1. Login Aluno.
2. Confirmar "Minha semana" de domingo a sábado.
3. Confirmar card de treino do dia com CTA.
4. Abrir sessão de treino.
5. Confirmar blocos de exercícios, instruções curtas, séries, reps, carga, descanso e próximo exercício.
6. Registrar série.
7. Finalizar treino.
8. Enviar feedback pós-treino.
9. Confirmar fila offline e histórico local/mockado.
10. Confirmar ausência de overflow horizontal no mobile.

## Técnica

1. Rodar `node --check assets/js/app.js`.
2. Rodar `node --check assets/js/data-store.js`.
3. Rodar `git diff --check`.
4. Parsear todos os JSONs.
5. Verificar console sem erro crítico.
