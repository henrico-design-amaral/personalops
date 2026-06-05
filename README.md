# PersonalOps — V1.2 (Data-Rich Prototype)

> **AVISO:** Autenticação e banco de dados são completamente simulados (mockados) no lado do cliente. Nenhuma credencial ou informação pessoal real deve ser utilizada.

Protótipo estático de validação operacional — V1.2 publicado no GitHub Pages.

**URL:** https://henrico-design-amaral.github.io/personalops/

## Acessos Demo (Credenciais Sintéticas)

| Perfil | E-mail | Senha | Detalhes do Perfil |
|---|---|---|---|
| **Administrativo** | `admin@personalops.test` | `admin123` | Visão geral de métricas agregadas e controle de hipóteses |
| **Professor** | `professor@personalops.test` | `prof123` | Vinculado ao *Prof. Silva* (`prof-01`) gerenciando 8 alunos e feedbacks |
| **Aluno** | `aluno@personalops.test` | `aluno123` | Vinculado a *Carlos Mendes* (`std-01`) com planilhas e histórico ativo |

## Funcionalidades V1.2 (Evolução Operacional)

- **Camada de Dados Sintéticos**: Migração dos arrays estáticos inline para 10 arquivos JSON (`assets/data/*.json`) relacionais, modelando 16 alunos com perfis reais de adesão, risco de evasão, limitações físicas e feedbacks.
- **Data Store Layer (`data-store.js`)**: Gerenciador de requisições assíncronas via `fetch` local com **fallbacks inline redundantes** caso o aplicativo seja executado offline ou através do protocolo `file://` (duplo clique local).
- **Orientações & Segurança**: Exibição de coaching cues, erros comuns e notas de segurança contextuais de cada um dos 40 exercícios cadastrados na tela de execução do aluno.
- **Fila Offline & Sincronização**: Registro local de séries completadas e eventos (`set_completed`, `workout_finished`, etc.) via `localStorage` com reconexão automática e sincronização transparente ao recuperar sinal de rede.
- **Service Worker Avançado**: Precaching offline configurado para englobar toda a nova arquitetura de dados e lógica (`service-worker.js`).

## Documentação Técnica

- [Especificação de Dados e Cenários (TEST_FIXTURES.md)](file:///C:/Users/henri/Documents/04_PROJETOS_CONTEÚDO/01_ACTIVE/PersonalOps/docs/data/TEST_FIXTURES.md)
- [Plano de Teste e Validação (V1_2_TEST_PLAN.md)](file:///C:/Users/henri/Documents/04_PROJETOS_CONTEÚDO/01_ACTIVE/PersonalOps/docs/qa/V1_2_TEST_PLAN.md)

## Stack Tecnológica

HTML5 + CSS3 + Vanilla JavaScript (ES6) estruturado de forma estática pura, sem frameworks ou build tools complexas.