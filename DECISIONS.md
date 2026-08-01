# Decisões canônicas

## 2026-08-01 — domínio do produto

O PersonalOps passa a ser um sistema autoral de organização pessoal e clareza operacional. O produto fitness anterior é legado histórico e não deve reaparecer no runtime, no modelo de dados ou na comunicação atual.

## 2026-08-01 — fonte e precedência

A decisão explícita do objetivo de reconstrução, a linguagem “Reflective Signal” aprovada na `main` e os conceitos pessoais listados em `PRODUCT.md` prevalecem sobre documentos fitness antigos. O legado foi arquivado, não apagado.

## 2026-08-01 — arquitetura

- Astro continua como framework principal e gera saída estática compatível com Hostinger.
- Preact existe somente como ilha autenticada, onde estado e CRUD justificam hidratação.
- Supabase fornece Auth e Postgres; o navegador usa apenas URL e chave publicável.
- Relações pertencem a tabelas relacionais; JSON fica restrito a preferências pequenas ou metadados de evento.
- Toda referência entre registros carrega `user_id` e usa foreign key composta para impedir relações cruzadas entre usuários.

## 2026-08-01 — segurança

- Todas as tabelas expostas têm RLS forçada e políticas explícitas de `select`, `insert`, `update` e `delete`.
- Identidade é derivada de `auth.uid()`; o cliente não recebe chave privilegiada.
- Exclusão de tarefas é lógica para preservar histórico. Exclusões pequenas e reversíveis usam confirmação.
- Storage e Realtime permanecem desativados até existir necessidade funcional concreta.

## 2026-08-01 — publicação

GitHub Pages deixa de ser destino. O workflow de `main` valida o código, o banco, o isolamento e os fluxos de navegador, empacota o `dist` validado e só então publica na Hostinger. Ausência de secret ou target fora dos caminhos aprovados interrompe o job.
