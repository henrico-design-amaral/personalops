# Registro de migração do estado anterior

## Classificação

| Origem anterior                                                  | Classificação                             | Destino                                                 |
| ---------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Linguagem de intenção, ação, reflexão, foco, energia e progresso | conteúdo aprovado                         | incorporada ao produto atual                            |
| Paleta, Inter, Syne, assinatura visual e tom direto              | decisão visual aprovada                   | incorporados aos tokens e componentes atuais            |
| Áreas, prioridades, estados vazios e loop diário                 | conceito transferível                     | remodelados no domínio pessoal e no Supabase            |
| Professor, aluno, admin, treinos, Pix e cobrança                 | produto fitness legado                    | preservados em `legacy/fitness-prototype`               |
| Fixtures JSON e RBAC no navegador                                | dados demonstrativos e mecanismo inseguro | preservados no legado; removidos do runtime de produção |
| Runtime Astro imediatamente anterior à reconstrução              | evidência de transição                    | preservado em `legacy/pre-rebuild-runtime`              |

## Transformação

Nenhuma fixture fitness foi convertida artificialmente em tarefa, objetivo ou energia. O conteúdo pessoal aprovado foi convertido em seed de desenvolvimento autenticado, sem uso como fonte de produção. O RBAC simulado foi substituído por Supabase Auth, propriedade explícita e RLS.

IDs históricos foram preservados nos arquivos arquivados; não foram mantidos no banco porque representam entidades de outro domínio e criariam relações sem significado.

## Descartes do runtime

GitHub Pages, service worker, arquivos JSON públicos, scripts de login demonstrativo e workflows antigos deixam de participar do build. Eles continuam recuperáveis no legado ou no histórico Git. O motivo é evitar autenticação simulada, dados hardcoded e dois destinos de publicação concorrentes.
