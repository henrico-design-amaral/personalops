# Workout Library Requirements — PersonalOps V1.2

## Biblioteca de exercícios

A biblioteca contém 50 exercícios com grupo muscular, equipamento, dificuldade, dicas, erros comuns, notas de segurança e placeholders visuais. Nenhum asset externo é usado.

## Biblioteca de treinos

`workout-library.json` inclui treinos prontos como Peito + Bíceps, Full body, Emagrecimento circuito, treino em casa e treino em condomínio.

## Templates, prescrição e execução

Template é modelo reutilizável. Prescrição é treino vinculado a aluno e data. Execução é o evento registrado pelo aluno durante o treino.

## Clonagem

A ação `cloneWorkoutMock(sourceWorkoutId, targetStudentId)` cria uma cópia local e um evento local. Não persiste em backend.

## Voz/texto

O fluxo é ditar, interpretar, estruturar, revisar e publicar. O sistema nunca deve publicar automaticamente.
