# Modelo Supabase

## Tabelas

| Grupo         | Tabelas                                              | Papel                                                    |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| Identidade    | `profiles`                                           | nome, fuso, onboarding, preferências e capacidade padrão |
| Direção       | `areas`, `goals`, `projects`, `priorities`           | contexto, resultados e ordem de atenção                  |
| Execução      | `tasks`, `task_events`, `commitments`                | próximos passos, histórico e ocupação temporal           |
| Ritmo         | `routines`, `routine_occurrences`                    | regra recorrente e execução por data                     |
| Estado diário | `energy_checkins`, `daily_plans`, `daily_plan_items` | energia, capacidade e composição do dia                  |
| Reflexão      | `reviews`, `progress_entries`                        | leitura periódica, decisões e evolução                   |

## Integridade

Todos os IDs são UUID. Todas as tabelas têm `created_at`, `updated_at` e `user_id`. Foreign keys compostas incluem o proprietário, impedindo que um registro de um usuário seja associado ao de outro. Enums controlam estados; checks limitam escalas de energia, impacto, urgência e progresso. Índices cobrem filtros por proprietário, data, estado e relações.

Tarefas usam `deleted_at` porque eventos e comparação planejado/realizado precisam sobreviver à exclusão. As demais entidades usam status ou exclusão confirmada conforme sua semântica.

## RLS

RLS está habilitada e forçada nas 15 tabelas. Cada tabela possui policies separadas de `select`, `insert`, `update` e `delete`, sempre comparando `user_id` com `auth.uid()`. Grants são limitados ao papel `authenticated`; o cliente nunca usa `service_role`.

`scripts/test-rls.mjs` autentica dois usuários e prova que A não lê, altera nem cria relações com identidade de B, e vice-versa.

O Site URL de Auth é `https://personalops.henrico.works` e a allow list inclui `/recuperar/`. A senha mínima foi elevada para 8 caracteres. A checagem de senhas vazadas continua indisponível no plano Free; o advisor registra um warning externo, sem erro crítico de tabela ou RLS.

## Migrations e seed

- `20260801155742_personal_operating_system.sql`: schema, integridade, triggers e RLS.
- `20260801160519_add_fk_indexes.sql`: cobertura de índices para foreign keys.
- `supabase/seed.sql`: referência de seed local.
- `scripts/seed-dev.mjs`: seed idempotente autenticado, separado de produção.

Os tipos em `src/types/database.ts` foram gerados a partir do projeto Supabase canônico depois das migrations.
