# PersonalOps - Escopo congelado do MVP vendavel

Data do congelamento: 2026-06-21
Branch de fundacao: `feature/sellable-mvp-foundation`

## Verdade operacional

O produto atual e um prototipo estatico demonstravel, nao um SaaS operacional. Login, RBAC, pagamentos, dados, persistencia e sincronizacao sao simulados no cliente. A venda possivel nesta sprint e de uma demonstracao validada do fluxo, nao de uma plataforma pronta para receber alunos reais.

## Problema real

Personal trainers operam alunos, treinos, frequencia, feedback e cobranca em ferramentas fragmentadas. O aluno recebe pouca orientacao durante a execucao e o professor perde sinais importantes entre atendimentos.

## Publico-alvo

- Primario: personal trainers independentes e pequenos times.
- Secundario: alunos que executam treino sem o professor presente.
- Operacional: administrador da plataforma, apenas para demonstrar governanca e saude do produto.

## Promessa comercial do MVP

Demonstrar em um unico cockpit como o personal identifica prioridades, organiza e entrega treinos e recebe sinais de execucao; o aluno consulta a semana, executa o treino e envia feedback. Nao prometer autenticacao, pagamento, armazenamento, IA, voz ou sincronizacao reais.

## Fluxo principal vendavel

1. Visitante abre o memorial e entra na demonstracao.
2. Professor seleciona o perfil demo e identifica alunos que exigem atencao.
3. Professor abre o perfil do aluno, consulta frequencia, progresso, financeiro mockado e feedback.
4. Professor monta ou clona um treino usando a biblioteca de fixtures.
5. Aluno seleciona o perfil demo, consulta a semana e abre o treino do dia.
6. Aluno registra series, usa o timer, finaliza e envia feedback.
7. Professor retorna ao cockpit e demonstra como o sinal orientaria a proxima decisao.
8. Admin demonstra metricas e cobrancas exclusivamente sinteticas.

## Telas obrigatorias

- `/`: memorial publico, limites e entrada da demo.
- `/shell/`: console com troca controlada entre Admin, Professor e Aluno.
- Visao Admin: metricas, cobrancas mockadas, biblioteca e saude tecnica.
- Visao Professor: prioridades, alunos, perfil, agenda e criacao/clonagem de treino.
- Visao Aluno: semana, treino do dia, execucao, timer e feedback.
- Estados mobile da shell para Professor e Aluno sem overflow horizontal.

## Entidades essenciais de banco

Nao existe banco no estado atual. As entidades abaixo existem como contratos e fixtures JSON ou estao documentadas para uma fase posterior:

- `User` e atribuicoes de papel.
- `AdminProfile`, `StaffProfile`, `ProfessorProfile` e `StudentProfile`.
- Vinculo exclusivo Professor-Aluno.
- `Exercise`, templates de treino/cardio e treinos do professor.
- Plano semanal, atribuicao por dia e prescricao.
- Sessao/execucao, presenca, progresso e feedback.
- `Payment`, `Subscription`, `Invoice` e eventos, apenas mockados nesta sprint.
- Convite, recuperacao e log de suporte, apenas simulados.

Escolher banco, ORM, migrations e hospedagem dinamica antes da implementacao real e obrigatorio. Não consigo confirmar isso.

## O que esta comprovado localmente

- Build Astro estatico gera duas paginas.
- `build:local` gera `dist-local/index.html` autocontido e sem referencias externas.
- Validacao de fixtures passa com um aviso esperado para aluno arquivado.
- Testes de acesso simulados passam em 50 de 50 cenarios.
- Fixtures estruturadas cobrem perfis, alunos, treinos, agenda, execucao, feedback, progresso e financeiro mockado.
- Existe workflow de deploy para GitHub Pages.

## Parcial, quebrado ou nao confirmado

- `astro check` nao esta operacional sem instalar `@astrojs/check` e TypeScript; o comando nao foi confirmado.
- Fluxos visuais e interativos nao foram reexecutados manualmente nesta fase. Não consigo confirmar isso.
- URL publica e deploy atual nao foram verificados nesta fase. Não consigo confirmar isso.
- Nao ha backend, banco, ORM, migrations ou APIs de produto.
- Nao ha autenticacao, sessao, recuperacao ou autorizacao server-side real.
- Persistencia offline e fila sao demonstrativas no cliente; sincronizacao real nao existe.
- Criacao de treino nao persiste em banco.
- Pix, pagamentos, cobrancas e indicadores financeiros sao falsos e demonstrativos.
- IA e voz nao sao servicos funcionais confirmados.
- `PROJECT_CONTROL.md`, `README.md` e mudancas funcionais das sessoes 27-29 estao sem commit no inicio desta fase.

## Criterios de aceite da sprint vendavel

- Memorial declara de forma visivel que tudo e sintetico e demonstrativo.
- Os tres perfis entram sem erro e nunca sugerem seguranca real.
- Professor conclui prioridade -> aluno -> treino -> acompanhamento sem tela morta.
- Aluno conclui semana -> treino -> serie -> finalizacao -> feedback.
- Admin mostra somente dados sinteticos e pagamento mockado.
- Troca de perfil nao vaza estado indevido entre papeis na demonstracao.
- Reload e abertura local produzem comportamento conhecido e documentado.
- Desktop e mobile nao apresentam overflow, sobreposicao ou CTA inacessivel.
- Estados de loading, vazio, erro e sucesso possuem tratamento visual.
- Fixtures e teste de acesso passam; build estatico e local passam.
- `astro check` passa sem prompt interativo.
- Capturas de referencia sao congeladas no inicio da Fase 2 e comparadas antes de cada fechamento.

## Fora de escopo desta sprint

- Backend, banco real, migrations e sincronizacao cloud.
- Autenticacao, autorizacao e recuperacao reais.
- Pagamento, Pix, gateway, Open Finance, split ou recorrencia reais.
- WhatsApp, email ou push reais.
- IA generativa, prescricao autonoma ou voz em producao.
- Dados, fotos, documentos ou credenciais de pessoas reais.
- Marketplace, nutricao, comunidade, ranking, wearable e white label.
- Biblioteca proprietaria de midia ou conteudo sem licenca comprovada.

## Riscos

- Critico: vender o prototipo como SaaS funcional cria expectativa falsa e risco contratual.
- Critico: qualquer dado real ficaria exposto a controles somente client-side.
- Alto: working tree inicial mistura documentacao e mudancas funcionais nao commitadas.
- Alto: documentacao antiga ainda descreve produto, stack e estado anteriores.
- Alto: ausencia de decisao de banco, auth e hosting bloqueia piloto real.
- Medio: dois frontends convivem no repositorio (`index.html` legado e Astro), elevando risco de demonstrar a versao errada.
- Medio: o gate de typecheck depende de pacote ausente.
- Medio: financeiro mockado pode ser confundido com integracao real se a copy falhar.

## Checklist de demonstracao

- [ ] Usar somente fixtures sinteticas.
- [ ] Limpar cache/service worker e estado local antes da sessao.
- [ ] Abrir memorial e declarar limites do prototipo.
- [ ] Entrar nos perfis Admin, Professor e Aluno.
- [ ] Mostrar uma decisao operacional do Professor antes de abrir historico.
- [ ] Abrir perfil, frequencia, progresso e feedback do aluno.
- [ ] Montar ou clonar um treino e declarar que nao ha persistencia real.
- [ ] Executar serie, timer, finalizacao e feedback no perfil Aluno.
- [ ] Mostrar financeiro apenas como mock.
- [ ] Validar desktop e viewport mobile sem overflow.
- [ ] Manter `dist-local/index.html` como contingencia offline da demonstracao.
- [ ] Nao inserir dado real durante a apresentacao.

## Quando pode ser chamado de vendavel

Nesta sprint, somente quando for vendido como prototipo de validacao comercial com limites explicitos, roteiro repetivel e zero tela quebrada. Para ser vendido como software operacional, precisa no minimo de banco persistente, autenticacao server-side, isolamento de dados, backup, politica de dados, hosting validado e fluxo real de publicacao. Esses itens nao pertencem a esta sprint.
