# Visual QA Loop — PersonalOps

## Objetivo
Transformar qualidade visual em gate contínuo do produto sem redesenhar o layout por gosto.

## Superfícies obrigatórias
- Entrada pública / memorial.
- Admin desktop completo e consulta mobile compacta.
- Professor: visão geral, atenção agora, alunos, criação de treino e feedbacks.
- Aluno: visão geral, treino de hoje, evolução e perfil.

## Viewports mínimos
- Desktop: 1440x1000.
- Mobile: 390x844.

## Gate visual obrigatório
Toda alteração visual deve preservar ou melhorar, com evidência:
1. hierarquia visual;
2. container e grid;
3. tipografia e legibilidade;
4. espaçamento e densidade;
5. responsividade sem overflow horizontal;
6. contraste e estados de foco;
7. consistência entre Admin, Professor e Aluno;
8. clareza dos estados de treino, timer, progresso, cobrança e feedback;
9. paridade com a fundação dark premium V1.4;
10. ausência de redesign não autorizado.

## Loop de execução
1. Capturar baseline antes da mudança.
2. Alterar somente o componente/fluxo autorizado.
3. Rodar sintaxe JS, fixtures, access control e build.
4. Capturar novamente desktop e mobile.
5. Comparar visualmente com o baseline.
6. Se houver regressão, corrigir antes de commit/merge/deploy.
7. Registrar a decisão visual no HANDOFF quando a mudança for aceita.

## Condição de bloqueio
Não integrar uma mudança quando screenshots não estiverem disponíveis para uma alteração visual relevante ou quando houver quebra de hierarquia, overflow, contraste, navegação, foco ou consistência de componentes.
