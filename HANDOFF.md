# Handoff operacional

Branch de reconstrução: `codex/personalops-supabase-rebuild`.

Antes de qualquer publicação, execute `npm ci`, `npm run validate`, `npm audit --audit-level=high`, `npm run test:rls` e `npm run test:e2e`. Não use `git add .`; confira o diff e faça staging apenas do lote intencional.

O Supabase canônico é o projeto `personalops`. As migrations locais ficam em `supabase/migrations`; o seed de desenvolvimento não é fonte de produção. Não versionar `.env.local`, `.env.test` ou qualquer credencial.

O único destino de publicação é `https://personalops.henrico.works`. O workflow da Hostinger aceita apenas os diretórios PersonalOps aprovados e publica somente o artifact `dist` que passou pelo release gate.

O produto fitness anterior está em `legacy/fitness-prototype` e `legacy/pre-rebuild-runtime`. Não reintroduzir seus dados, RBAC simulado ou vocabulário no produto atual.
