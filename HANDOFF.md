# Handoff operacional — restauração PersonalOps

## Direção canônica

PersonalOps é uma plataforma de **personal training**, com três contextos principais: Admin da plataforma, Professor/Personal Trainer e Aluno. Qualquer instrução anterior que o trate como sistema pessoal de produtividade, tarefas, energia ou organização da vida está revogada.

## Fontes obrigatórias antes de implementar

1. `PRODUCT.md`
2. `DECISIONS.md`
3. `QUALITY_GATES.md`
4. `legacy/fitness-prototype/root-docs/PROJECT_CONTROL.md`
5. `legacy/fitness-prototype/docs/product/RBAC_AND_OPERATIONAL_MODEL.md`
6. `legacy/fitness-prototype/docs/product/exercise-system.md`
7. requisitos de Admin, biblioteca, perfil do aluno, progresso/feedback e experiência visual em `legacy/fitness-prototype/docs/product/`

## Regra de restauração

A documentação original fitness é autoridade de domínio, mas código antigo não deve ser copiado automaticamente. Inventariar primeiro o runtime moderno, separar infraestrutura reaproveitável da reconstrução conceitualmente errada e restaurar o produto em lotes pequenos.

Não redesenhar. Recuperar a identidade visual aprovada do PersonalOps a partir do histórico/artefatos originais e validar desktop/mobile visualmente.

## Modelo obrigatório

- Admin administra plataforma/professores/biblioteca global/métricas; não administra alunos.
- Professor controla exclusivamente seus alunos, treinos, prescrições, acompanhamento e financeiro do workspace.
- Aluno é usuário autenticado limitado, criado/convidado pelo professor e restrito ao próprio portal.
- Exercícios, templates, planos, sessões, execuções, feedbacks e relações devem respeitar ownership e isolamento.

## Infraestrutura

O destino público continua `https://personalops.henrico.works`. Astro/Supabase/Hostinger podem ser preservados quando tecnicamente úteis, mas schema, rotas e conteúdo da reconstrução pessoal não são autoridade de produto.

Antes de qualquer publicação: instalar dependências de forma limpa, executar gates disponíveis, validar RBAC/RLS, revisar diff, fazer Visual QA em desktop/mobile e confirmar que nenhum conceito de produtividade pessoal permanece no runtime público.

## Próximo lote recomendado

1. Inventariar schema Supabase, rotas e componentes atuais.
2. Mapear o que pode ser preservado tecnicamente.
3. Definir migration segura do modelo atual para Admin → Professor → Aluno sem destruir dados automaticamente.
4. Restaurar shell/login e dashboards de personal training usando a identidade visual correta.
5. Implementar Professor + Aluno primeiro; Admin depois da base de ownership.
6. Só então preparar release para produção.
