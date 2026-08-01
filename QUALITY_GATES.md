# Quality gates

## Código e supply chain

- `npm ci`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm audit --audit-level=high`
- scan de credenciais, ações falsas e fixtures no runtime

## Supabase

- `npm run validate:env`
- `npm run validate:migrations`
- migrations aplicadas no projeto canônico
- advisors sem erro crítico de segurança
- `npm run test:rls` com dois usuários reais
- `npm run seed:dev` somente na conta de teste

## Navegador

- `npm run test:e2e`
- primeiro acesso, organização diária, rotina, revisão e persistência
- 390, 768, 1024 e 1440 px
- axe sem violações sérias ou críticas
- console e requests críticos sem falha

## Release

- diff e working tree explicados
- commits intencionais
- PR e workflow verdes
- artifact `dist` produzido pelo commit publicado
- HTTPS, assets, Auth, CRUD, reload e novo login no subdomínio real
