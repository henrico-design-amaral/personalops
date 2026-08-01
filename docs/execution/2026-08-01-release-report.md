# Relatório de execução — 2026-08-01

## Estado

Reconstrução funcional e validação local concluídas. Este registro permanece como
pré-publicação até o merge, o workflow Hostinger e os fluxos reais no subdomínio
serem comprovados.

## [Certo]

- Astro 7 é a estrutura principal, com TypeScript estrito e uma ilha Preact para
  a experiência autenticada.
- Supabase Auth e Postgres estão integrados de verdade. O banco possui 15 tabelas,
  propriedade explícita por usuário, constraints, índices, triggers e RLS.
- Hoje, prioridades, tarefas, compromissos, rotinas, energia, objetivos, progresso,
  revisões, histórico, áreas, onboarding e preferências compartilham o mesmo modelo
  persistente.
- O RBAC simulado e as fixtures do protótipo fitness deixaram de ser fonte de
  produção. O material anterior foi preservado em `legacy/` com registro de migração.
- Os testes RLS provaram isolamento de leitura e alteração entre dois usuários reais.
- A suíte Playwright validou primeiro acesso, organização diária, rotina, revisão,
  logout, persistência após reload, proteção sem sessão, console, rede e interface.
- Resultado Playwright: 16 cenários passaram; 8 combinações redundantes foram
  ignoradas intencionalmente pela matriz responsiva.
- A auditoria automatizada não encontrou vulnerabilidade de severidade alta ou crítica.
- A verificação axe não encontrou violações sérias ou críticas nas páginas públicas.

## Comandos locais aprovados

- `npm ci`
- `npm run validate`
- `npm audit --audit-level=high`
- `npm run test:rls`
- `npm run seed:dev`
- `npx playwright test`

## Migrations aplicadas

- `20260801155742_personal_operating_system.sql`
- `20260801160519_add_fk_indexes.sql`

## Evidências visuais locais

- `docs/qa/evidence/home-desktop-1440.png`
- `docs/qa/evidence/home-desktop-1024.png`
- `docs/qa/evidence/home-tablet-768.png`
- `docs/qa/evidence/home-mobile-390.png`
- `docs/qa/evidence/tasks-desktop-1440.png`
- `docs/qa/evidence/tasks-mobile-390.png`

## [Provável]

- A proteção contra senhas vazadas deve ser ativada quando o plano Supabase permitir;
  o advisor a reporta como aviso e o painel a identifica como recurso do plano Pro.
- Métricas ganharão melhor valor decisório depois de algumas semanas de uso real.

## [Palpite]

- A recomendação diária poderá incorporar padrões históricos de energia e capacidade
  quando houver massa de dados suficiente; não há evidência para sofisticá-la agora.

## Gate de produção pendente

Não consigo confirmar isso antes do workflow e dos testes no subdomínio real:

- commit publicado e PR aprovado;
- workflow de validação verde;
- deploy Hostinger verde;
- HTTPS, assets, rotas, Auth e Supabase no subdomínio;
- CRUD, reload, logout/login, console e rede em desktop e mobile;
- ausência de fixtures históricas e chaves privilegiadas no bundle publicado.

O relatório será atualizado com commit, execução, URL e evidências de produção após
esses gates.
