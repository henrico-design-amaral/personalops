# Desenvolvimento

## Ambiente

1. Instale Node.js 24 LTS.
2. Execute `npm ci`.
3. Copie `.env.example` para `.env.local` e substitua apenas a URL e a chave publicável.
4. Mantenha contas E2E em `.env.test`, que é ignorado pelo Git.
5. Execute `npm run validate` antes de iniciar `npm run dev`.

## Banco

Migrations devem ser aplicadas ao projeto Supabase `personalops` e depois validadas com `npm run validate:migrations`. Regenerar `src/types/database.ts` sempre que o schema mudar. O seed de desenvolvimento deve usar uma conta de teste autenticada; nunca importar fixtures históricas como dados de produção.

## Mudanças

Uma alteração funcional só fecha depois de: teste unitário ou de integração, fluxo real no Playwright, inspeção mobile e desktop, e verificação de regressão. Não aceitar formulário que simule salvamento, botão sem ação ou estado derivado de fixture.
