# Progress and Feedback Requirements — PersonalOps V1.3

## Frequência, faltas e adesão

O professor deve enxergar se o aluno treinou, iniciou, concluiu, faltou, remarcou ou atrasou. A V1.3 usa `attendance-events.json` com eventos sintéticos como `workout_scheduled`, `workout_completed`, `workout_missed`, `no_show` e `late_start`.

## Progresso

`progress-snapshots.json` consolida adesão, treinos concluídos, faltas, nota média, RPE médio, volume mockado, peso mockado, percentual de gordura, massa magra e tendência corporal. Tudo é demonstrativo.

## Feedback pós-treino

Ao concluir o treino, o aluno informa nota, esforço percebido, status de conclusão, dor, humor e comentário. O feedback é salvo localmente por `savePostWorkoutFeedback`.

## Alertas para professor

São críticos: nota 1 ou 2, dor reportada, treino parcial/não concluído ou comentário com dúvida. O professor vê feedbacks críticos, alunos em risco e últimos relatos no perfil do aluno.

## Histórico para aluno

O aluno vê notas anteriores, percepção de esforço, frequência, bioimpedância demonstrativa e evolução corporal mockada.
