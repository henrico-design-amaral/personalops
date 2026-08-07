# Decisões canônicas

## 2026-08-07 — correção definitiva do domínio do produto

PersonalOps é e sempre deve ser tratado como uma plataforma de **personal training**. Sua autoridade original é o produto estruturado para Admin da plataforma, Professor/Personal Trainer e Aluno, concebido como concorrente de Mfit e outros sistemas da categoria.

A reconstrução de 2026-08-01 que redefiniu PersonalOps como sistema pessoal de organização, energia, capacidade, prioridades e tarefas foi uma interpretação equivocada e está revogada. Documentos, runtime, modelo de dados e comunicação derivados dessa tese não possuem precedência conceitual sobre a documentação original de personal training.

A documentação preservada em `legacy/fitness-prototype` deixa de ser tratada como legado conceitual: ela é **fonte histórica autoritativa para o domínio do produto**, especialmente para fluxos, RBAC, exercícios, treinos, Admin, Professor e Aluno. Código antigo ainda deve ser avaliado tecnicamente antes de ser reutilizado; autoridade de produto não significa reutilização automática de implementação antiga.

## 2026-08-07 — precedência documental

Em conflito de significado do produto, a ordem é:

1. decisão explícita atual: PersonalOps é personal training;
2. documentação original de produto e operação fitness preservada no repositório;
3. especificações de RBAC, exercícios, biblioteca, progresso, feedback, Admin, Professor e Aluno;
4. infraestrutura técnica moderna que não contradiga o domínio correto.

Arquivos criados na reconstrução de 2026-08-01 devem ser corrigidos antes de serem usados como fonte canônica.

## 2026-08-07 — modelo operacional

- Admin representa a plataforma e administra profissionais, biblioteca global, métricas e saúde técnica.
- Professor/Personal Trainer possui workspace próprio e controla exclusivamente seus alunos.
- Aluno é usuário autenticado limitado, criado/convidado pelo professor e restrito ao próprio portal.
- Admin não cria ou edita alunos e não prescreve treinos.
- Professor não acessa alunos, dados ou finanças de outros professores.
- O produto cobre gestão de alunos, biblioteca, prescrição, agenda semanal, execução, frequência, progresso, feedback e operação financeira do professor.

## 2026-08-07 — arquitetura e restauração

- A restauração conceitual não autoriza copiar código antigo indiscriminadamente.
- Astro e infraestrutura moderna podem ser preservados quando forem compatíveis com o produto correto.
- Supabase pode continuar como Auth/Postgres, mas schema, RLS e rotas devem ser redesenhados para o modelo Admin → Professor → Aluno.
- O runtime pessoal criado em agosto deve ser substituído progressivamente por superfícies de personal training, com validação local e visual antes de publicação.
- A identidade visual correta deve ser recuperada das versões aprovadas do PersonalOps; não criar redesign durante a restauração.

## 2026-08-07 — publicação

O destino público permanece `https://personalops.henrico.works` enquanto a infraestrutura de publicação for válida. Nenhuma versão deve ser promovida como corrigida até que o runtime represente novamente o produto de personal training e passe pelos gates de build, segurança, RBAC e Visual QA.
