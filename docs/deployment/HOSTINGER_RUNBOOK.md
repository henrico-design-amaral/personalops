# Deploy — GitHub e Hostinger

## Destino

- Repositório: `henrico-design-amaral/personalops`.
- Branch de produção: `main`.
- URL: `https://personalops.henrico.works`.
- Artifact: somente `dist`, gerado do commit validado.

## Repository Secrets

O workflow referencia, sem imprimir valores:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `E2E_USER_A_EMAIL`, `E2E_USER_A_PASSWORD`
- `E2E_USER_B_EMAIL`, `E2E_USER_B_PASSWORD`
- `HOSTINGER_HOST`, `HOSTINGER_PORT`
- `HOSTINGER_USERNAME`, `HOSTINGER_PASSWORD`
- `HOSTINGER_TARGET_DIR`

O target precisa corresponder ao diretório PersonalOps aprovado dentro de `henrico.works/public_html/personalops` ou ao document root de `personalops.henrico.works`. Qualquer outro valor falha antes da limpeza remota.

## Pipeline

1. Checkout e Node 24 LTS.
2. `npm ci` com lockfile.
3. formato, lint, TypeScript, unitários, migrations, env e build.
4. auditoria de dependências e teste RLS A/B.
5. Playwright dos fluxos críticos.
6. upload do `dist` validado como artifact.
7. download isolado e SCP para Hostinger.
8. confirmação HTTPS pelo marcador da release.

O workflow não possui caminho de “deploy ignorado”: secret ausente, teste falho ou destino inesperado interrompem a publicação.

## Pós-deploy

Executar Playwright contra `PLAYWRIGHT_BASE_URL=https://personalops.henrico.works`, verificar console e rede, realizar CRUD autenticado, reload, logout/login e comparar screenshots com as evidências locais.
