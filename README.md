# PersonalOps — V1.3 Progress & Feedback Prototype

Protótipo estático de validação operacional para o cockpit do personal trainer: alunos, treinos, frequência, progresso, feedback pós-treino, recebimentos e sinais importantes em um só fluxo.

**URL pública:** https://henrico-design-amaral.github.io/personalops/

## Entrada Pública

A raiz abre o memorial público. Use **Entrar na aplicação** para acessar o login demo.

## Credenciais Demo

| Perfil | E-mail | Senha |
|---|---|---|
| Administrativo | `admin@personalops.test` | `admin123` |
| Professor | `professor@personalops.test` | `prof123` |
| Aluno | `aluno@personalops.test` | `aluno123` |

## Estado da Versão

- Dados sintéticos estruturados em `assets/data/*.json`.
- Login, perfis, treinos, cobranças, lembretes, frequência, progresso e feedback pós-treino são simulados no cliente.
- Pix é mockado com QR Code demonstrativo e copia e cola falso.
- Dashboard Admin representa a plataforma PersonalOps e é desktop-only.
- Professor acompanha frequência, faltas, adesão, risco, evolução, bioimpedância mockada e feedbacks críticos.
- Aluno registra treino, nota pós-treino, esforço percebido, dor, humor e comentário livre.
- Não há pagamento real, gateway real, Open Finance real ou WhatsApp real.
- Não há backend, banco real, autenticação real ou coleta de dados reais.
- Não usar CPF, chave Pix, dados bancários, fotos, documentos, alunos ou professores reais.

## Fluxos Validados

- Admin: métricas de plataforma, professores, alunos totais, uso do sistema, biblioteca global, mídia pendente, cobrança Pix mockada e saúde técnica.
- Professor: alunos, vencimentos, inadimplentes, dados Pix mascarados, frequência, faltas, progresso, perfil completo, biblioteca, clonagem e rascunhos de voz/texto.
- Aluno: plano atual, vencimento, QR Code Pix demonstrativo, treino da semana, treino do dia, timer, registro local, fila offline, evolução e feedback pós-treino.

## Cache e Service Worker

O service worker usa o cache `personalops-v1-cache-006`.

Para limpar estado local em testes:

1. Abrir DevTools.
2. Application > Service Workers > Unregister.
3. Application > Storage > Clear site data.
4. Recarregar com `Ctrl+F5`.

## Teste Local

```bash
node --check assets/js/app.js
node --check assets/js/data-store.js
git diff --check
```

Também validar manualmente memorial, login dos três perfis, dashboard Admin desktop-only, Pix mockado, frequência, perfil completo do aluno, clonagem, treino do dia, timer, registro de série, feedback pós-treino, fila offline e viewport mobile sem overflow horizontal para Professor/Aluno.

## Documentação

- `docs/data/TEST_FIXTURES.md`
- `docs/product/ADMIN_BILLING_REQUIREMENTS.md`
- `docs/product/PIX_BILLING_REQUIREMENTS.md`
- `docs/product/WORKOUT_LIBRARY_REQUIREMENTS.md`
- `docs/product/PROGRESS_AND_FEEDBACK_REQUIREMENTS.md`
- `docs/product/PLATFORM_ADMIN_REQUIREMENTS.md`
- `docs/product/STUDENT_PROFILE_REQUIREMENTS.md`
- `docs/qa/V1_3_TEST_PLAN.md`
