# Diagnóstico inicial — reconstrução funcional

Data: 2026-08-01  
Alias canônico: `PersonalOps`  
Root confirmado: `C:\Users\henri\Documents\04_PROJETOS_CONTEÚDO\01_ACTIVE\PersonalOps`

## Decisão objetiva

O produto será reconstruído a partir de `origin/main` (`5bc4cc3`) em
`codex/personalops-supabase-rebuild`. A decisão explícita de 2026-08-01 e o
conteúdo recente “Reflective Signal” em `src/pages/index.astro` são a fonte
canônica do novo domínio: organização pessoal, energia, capacidade,
prioridades, execução, progresso e revisão.

Os documentos e fixtures de gestão de personal trainers são legado de outro
enquadramento do produto. Eles permanecem preservados no histórico Git e serão
classificados no registro de migração, mas não serão usados como dados de
produção nem misturados ao modelo pessoal atual.

## Repositório e árvore de trabalho

- Repositório: `henrico-design-amaral/personalops`.
- Branch principal: `main`.
- Remote: `origin` via HTTPS.
- Branch de reconstrução: `codex/personalops-supabase-rebuild`, criada de
  `origin/main`.
- A branch anterior `feature/sellable-mvp-foundation` tinha 12 arquivos
  modificados e quatro grupos de itens não rastreados.
- O lote funcional das Sessions 027–029 foi validado e preservado no commit
  local `8bb897b` antes da troca de branch.
- Os atalhos `.gform` e `.codex/hooks.json` são metadados locais e não serão
  versionados. Seus arquivos permanecem intactos no disco.

## Fonte canônica e divergências

1. A decisão explícita de 2026-08-01 substitui a definição antiga do produto.
2. `origin/main:src/pages/index.astro` já contém a linguagem aprovada de
   intenção, ação, reflexão, agenda, foco, energia, hábitos e progresso.
3. `PRODUCT.md`, `README.md`, `DECISIONS.md`, `PROJECT_CONTROL.md` e a maior
   parte de `docs/` ainda descrevem um protótipo fitness multiusuário. Esses
   documentos estão desatualizados para o novo domínio.
4. A implementação recente continua sendo uma vitrine estática: não há Auth,
   banco, CRUD ou persistência real.

## Infraestrutura confirmada

- Astro é o framework atual; `origin/main` usa Astro 5 e build estático.
- Existem workflows ativos para validação Astro, GitHub Pages e Hostinger.
- O workflow Hostinger de `origin/main` usa credenciais e caminho hardcoded e
  referencia `HOSTINGER_SSH_PASSWORD`.
- O repositório atualmente disponibiliza os secrets
  `HOSTINGER_HOST`, `HOSTINGER_PORT`, `HOSTINGER_USERNAME`,
  `HOSTINGER_PASSWORD` e `HOSTINGER_TARGET_DIR`.
- O workflow e os secrets não estão alinhados. Nenhum valor foi lido ou
  impresso.
- Projeto Supabase canônico: `personalops`, região `us-east-2`. Ele estava
  pausado e entrou em restauração durante este diagnóstico.
- URL pública antiga documentada: GitHub Pages em
  `https://henrico-design-amaral.github.io/personalops/`.
- Não consigo confirmar isso: o subdomínio Hostinger de produção ainda não foi
  identificado por evidência no repositório ou DNS neste ponto do diagnóstico.

## Conteúdo inventariado

### Fonte aprovada para migração

- Loop: intenção, ação, reflexão e ajuste.
- Telas/conceitos: Hoje/Dashboard, agenda, foco, treino/atividade, hábitos,
  energia, progresso, revisão e estados vazios.
- Estados semânticos: foco, prioridade, conclusão e atenção.
- Voz: calma, direta, honesta, sem gamificação vazia.
- Direção visual: `#F3F0EA`, `#151313`, `#D8D2C9`, `#282321`, `#1A1715`,
  `#FFC83D`, Inter e Syne.

### Legado preservado, fora do runtime novo

- Gestão de professor/aluno/admin, treinos, cobranças Pix mockadas e RBAC
  simulado.
- Fixtures em `assets/data/` e `public/assets/data/`.
- Requisitos fitness, questionários, screenshots e histórico das Sessions
  001–029.
- O legado tem valor de rastreabilidade, pesquisa e histórico de engenharia,
  mas não tem correspondência semântica segura com tarefas pessoais, energia,
  objetivos ou revisões.

## Gates antes de publicar

- Instalação limpa, formato, lint, TypeScript, testes unitários e integração.
- Migrations e seed local validados.
- RLS em todas as tabelas expostas e teste com dois usuários.
- E2E dos fluxos primeiro acesso, organização diária, rotina, revisão e
  isolamento.
- Build, auditoria de dependências, scan de secrets e inspeção do diff.
- QA real em 390, 768, 1024 e 1440 px, acessibilidade, console e requests.
- Push somente após os gates locais; produção somente após workflow verde.
