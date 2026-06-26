# HenricoOPS — Memória Operacional: PersonalOps

Memória operacional contínua do trabalho com Henrico. Fatos verificados, sem suposição não marcada.

## Caminhos de projeto (inegociável)
- PersonalOps: `01_ACTIVE/PersonalOps` (abs.: `C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\PersonalOps`)
- Repo Git: `https://github.com/henrico-design-amaral/personalops` — branch principal `main`.
- URL pública: `https://henrico-design-amaral.github.io/personalops/`

## Convenções confirmadas
- Todo prompt de projeto inicia com `/goal`.
- Commit via `hcommit` (alias do usuário, na máquina dele — não existe no sandbox). Push só após aprovação manual.
- Uma branch por objetivo; commits atômicos. Sem `git push`/`reset --hard`/`clean` autônomos.
- Stack alvo: Astro-first SSG; client-side vanilla (data-store.js + app.js). Offline-first é pilar.

## Estado real do projeto (auditado em 2026-06-23)
- O projeto está com o desenvolvimento da base do MVP comercial em andamento na branch `feature/sellable-mvp-foundation`.
- As modificações locais dessa feature foram salvas no stash do Git (SHA: `ef37d9e89e1f1f4617a22090657f8285298a67cf`) para permitir a aplicação e commit isolado da governança operacional.
- O build Astro do projeto está configurado e funcional.
- **Operating Shell (`/personalops/shell/`)**: Inicialização corrigida e layout visual restaurado para a estrutura oficial de sidebar e topbar usando as classes do `app.css` (`#screen-app`, `.sidebar`, `.topbar`, `.main-content`). Estilos de cards, botões, inputs e status badges globalizados via `<style is:global>` para compatibilidade. Paridade visual dark premium 100% restabelecida.
- **Bloqueio 1**: `public/` não versionado → build em clone limpo gera só `index.html`. Migração não reproduzível.
- **Bloqueio 2**: sem `.github/workflows` e `dist/` gitignored → Pages serve o legado da raiz, não o Astro. Migração não está em produção.
- **Higiene**: sem `.gitattributes` → ruído CRLF↔LF no working tree (não é mudança real).
- Exercise System: especificado em `docs/product/exercise-system.md`; ainda não implementado (Session 009+).

## Pendências antes de implementar o Exercise System
1. Versionar `public/` e definir fonte única de assets (eliminar duplicação tripla).
2. Decidir e configurar deploy do Astro (GitHub Actions) ou assumir o legado.
3. Adicionar `.gitattributes` (`* text=auto eol=lf`).
4. Limpar import morto `getCollection`/`astro:content` em `BaseLayout.astro`.
