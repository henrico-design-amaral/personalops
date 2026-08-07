# PersonalOps

Plataforma SaaS de personal training para a operação completa entre **Admin da plataforma, Professor/Personal Trainer e Aluno**.

PersonalOps foi concebido para competir com Mfit e outros sistemas da categoria, indo além de uma simples ficha de treino: gestão de alunos, biblioteca de exercícios, criação e clonagem de treinos, prescrição semanal, execução assistida, frequência, progresso, feedback pós-treino e operação financeira do personal fazem parte do mesmo sistema.

## Produto

### Admin da plataforma

Administra profissionais, biblioteca global, métricas agregadas, uso do sistema e saúde técnica. Admin não é professor e não cria ou edita alunos de professores.

### Professor / Personal Trainer

Opera seu próprio workspace: cria e convida alunos, acompanha atenção agora, frequência, faltas, adesão, progresso e feedbacks; cria treinos pela biblioteca, clonagem e fluxos assistidos; organiza a semana e acompanha cobranças do próprio negócio.

### Aluno

É usuário autenticado limitado, vinculado ao professor. Visualiza sua semana, treino do dia, detalhes dos exercícios, executa séries, registra esforço e envia feedback pós-treino, além de consultar histórico e evolução.

## Autoridade de produto

A documentação original preservada em `legacy/fitness-prototype` é fonte histórica autoritativa do domínio PersonalOps. O diretório contém o protótipo V1.4 e especificações posteriores de RBAC, exercício, biblioteca, progresso, feedback e experiência visual.

A reconstrução de 2026-08-01 como sistema pessoal de produtividade foi revogada por decisão explícita em `DECISIONS.md`. Código dessa reconstrução pode conter infraestrutura técnica aproveitável, mas seu modelo conceitual não define o produto.

## Direção técnica

- Astro permanece como base de aplicação quando compatível com a restauração.
- Supabase pode fornecer autenticação e Postgres, com RBAC/RLS redesenhados para Admin → Professor → Aluno.
- Nenhuma persistência pode ser simulada como real.
- Dados reais de alunos/professores não devem entrar em fixtures, testes ou documentação.
- A experiência deve preservar a identidade visual aprovada do PersonalOps, sem redesign oportunista durante a restauração.

## Próxima etapa

Restaurar o runtime de personal training sobre a infraestrutura moderna, começando pelo modelo de identidade/RBAC e pelas superfícies essenciais de Professor e Aluno, seguido do Admin da plataforma. A publicação só deve ocorrer após build, testes, isolamento de dados e Visual QA.

Consulte `PRODUCT.md`, `DECISIONS.md`, `QUALITY_GATES.md` e a documentação original em `legacy/fitness-prototype/docs/product/` antes de implementar.
