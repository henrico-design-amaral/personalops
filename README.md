# PersonalOps

Sistema pessoal para transformar capacidade, energia e compromissos em uma leitura operacional do dia. O produto não é uma lista genérica: prioridades representam resultados, tarefas representam próximos passos e revisões registram decisões.

## Estado do produto

- Astro 7 como estrutura principal, com uma ilha Preact para o workspace autenticado.
- TypeScript estrito, CSS por tokens, Inter, Syne e ícones Lucide.
- Supabase Auth e Postgres reais; todas as tabelas expostas têm RLS e propriedade por usuário.
- Visões funcionais de Hoje, Prioridades, Tarefas, Rotinas, Objetivos, Revisões, Histórico e Configurações.
- Persistência após reload, histórico de tarefas, progresso, energia e revisão.
- Testes unitários, integração, isolamento RLS e Playwright em 390, 768, 1024 e 1440 px.
- Publicação estática do diretório `dist` na Hostinger, condicionada ao gate completo do GitHub Actions.

O protótipo fitness anterior foi preservado em `legacy/fitness-prototype`; ele não participa do build nem fornece dados para produção.

## Começar

Requisitos: Node.js 24 LTS e npm.

```bash
npm ci
cp .env.example .env.local
npm run validate
npm run dev
```

Preencha `.env.local` com a URL e a chave publicável do projeto Supabase. Nunca use `service_role` no cliente.

## Comandos

```bash
npm run dev                 # servidor Astro local
npm run validate            # formato, lint, tipos, testes, env, migrations e build
npm run test:rls            # isolamento entre dois usuários reais de teste
npm run test:e2e            # fluxos críticos e evidências visuais
npm run seed:dev            # conteúdo inicial para a conta E2E A
npm run serve:dist          # serve o build estático em 127.0.0.1:4173
```

`test:rls`, `test:e2e` autenticado e `seed:dev` também exigem as variáveis `E2E_USER_*` mantidas em `.env.test` local ou nos Repository Secrets.

## Documentação

- [Arquitetura](docs/architecture/PERSONALOPS_ARCHITECTURE.md)
- [Modelo Supabase](docs/data/SUPABASE_MODEL.md)
- [Desenvolvimento](docs/operations/DEVELOPMENT.md)
- [Deploy Hostinger](docs/deployment/HOSTINGER_RUNBOOK.md)
- [Registro de migração](docs/migration/MIGRATION_REGISTER.md)
- [Checklist de validação](docs/qa/VALIDATION_CHECKLIST.md)
- [Diagnóstico inicial](docs/diagnostics/2026-08-01-initial-inventory.md)
