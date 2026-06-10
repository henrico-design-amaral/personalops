# PersonalOps — V1.2 Data-Rich Prototype

Protótipo estático de validação operacional para o cockpit do personal trainer: alunos, treinos, recebimentos e sinais importantes em um só fluxo.

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
- Login, perfis, treinos, cobranças, lembretes e eventos são simulados no cliente.
- Pix é mockado com QR Code demonstrativo e copia e cola falso.
- Não há pagamento real, gateway real, Open Finance real ou WhatsApp real.
- Não há backend, banco real, autenticação real ou coleta de dados reais.
- Não usar CPF, chave Pix, dados bancários, fotos, documentos, alunos ou professores reais.

## Fluxos Validados

- Admin: receita prevista, cobranças Pix em aberto, vencidas, notificações e gateway mockado.
- Professor: alunos, vencimentos, inadimplentes, dados Pix mascarados, biblioteca, clonagem de treino e rascunhos de voz/texto.
- Aluno: plano atual, vencimento, QR Code Pix demonstrativo, Pix copia e cola, treino da semana, treino do dia, timer, registro local e fila offline.

## Cache e Service Worker

O service worker usa o cache `personalops-v1-cache-005`.

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

Também validar manualmente memorial, login dos três perfis, Pix mockado, clonagem, treino do dia, timer, registro de série, fila offline e viewport mobile sem overflow horizontal.

## Documentação

- `docs/data/TEST_FIXTURES.md`
- `docs/product/ADMIN_BILLING_REQUIREMENTS.md`
- `docs/product/PIX_BILLING_REQUIREMENTS.md`
- `docs/product/WORKOUT_LIBRARY_REQUIREMENTS.md`
- `docs/qa/V1_2_TEST_PLAN.md`
