# Arquitetura do PersonalOps

## Forma de execução

Astro gera páginas e assets estáticos. A homepage, login e recuperação usam HTML/CSS e scripts mínimos. As rotas `/app/*` montam uma única ilha Preact protegida por sessão Supabase; cada rota escolhe a visão inicial, preservando URLs navegáveis sem transformar o site em uma SPA integral.

```text
Astro estático
├── página pública
├── login e recuperação
└── workspace autenticado (ilha Preact)
    ├── repository tipado
    ├── regras de domínio
    └── Supabase JS com chave publicável
         ├── Auth
         └── Postgres + RLS
```

## Fronteiras

- `src/pages`: rotas Astro.
- `src/layouts`: documento, metadados e acessibilidade global.
- `src/components/app`: navegação, estados e formulários interativos.
- `src/lib/data`: leitura, escrita e preparação do workspace.
- `src/lib/domain`: cálculos puros de Hoje, progresso e capacidade.
- `src/lib/supabase`: cliente público persistente.
- `src/types/database.ts`: contrato gerado do schema remoto.
- `supabase/migrations`: definição versionada do banco e das policies.

## Sessão e falhas

O cliente recupera a sessão persistida, redireciona ausência ou expiração para `/entrar`, mostra carregamento explícito e desabilita salvamento quando offline. Toda mutação espera a resposta do banco, atualiza o snapshot e apresenta feedback. Erros são normalizados sem expor payload sensível.

## Decisões de escala

Storage não é usado sem arquivo real. Realtime não é usado sem edição concorrente. A saída permanece estática para Hostinger; autorização e persistência acontecem no Supabase, não no servidor Astro.
