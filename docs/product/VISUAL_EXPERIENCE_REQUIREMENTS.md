# Visual Experience Requirements — PersonalOps V1.4

## Problemas identificados

- O Professor estava linear demais para uma rotina de decisão rápida.
- O Admin era bloqueado no mobile, mesmo quando uma consulta compacta era suficiente.
- Novo/Editar aluno dependia de inputs genéricos para escolhas conhecidas.
- A criação de treino destacava texto livre antes da biblioteca e da clonagem.
- A experiência do Aluno precisava deixar a semana e a sessão do dia mais explícitas.

## Decisões de UI

- Manter visual dark premium, com cards hierarquizados, badges de status, barras de progresso, tabs e grids.
- Mostrar prioridades antes de histórico.
- Usar selects, segmented controls e checkboxes para campos estruturados.
- Manter voz/texto como alternativa de rascunho, não como caminho principal.
- Preservar dados sintéticos, Pix mockado, fila offline e GitHub Pages.

## Hierarquia por perfil

## Admin

- Desktop: dashboard completo de plataforma.
- Mobile: versão compacta com métricas essenciais, alertas, saúde do sistema, pagamentos mockados e biblioteca/mídia resumida.

## Professor

- Hero operacional com métricas críticas.
- Atenção agora com alunos que exigem ação.
- Cards de alunos com adesão, risco, status financeiro e CTA.
- Blocos de progresso, cobranças, biblioteca, clonagem e feedbacks pós-treino.

## Aluno

- Minha semana de domingo a sábado.
- Treino de hoje com CTA claro.
- Sessão por blocos: aquecimento, principal e complementar.
- Feedback final com nota, esforço, dor, humor e comentário.

## Componentes

- StatCard
- AlertCard
- StudentCard
- BillingCard
- WorkoutTemplateCard
- WeeklyScheduleStrip
- ProgressBar
- RiskBadge
- PaymentStatusBadge
- FeedbackRating
- WorkoutStepCard
- EmptyState
- MobileCompactAdminCard
- Modal mockado
- SegmentedControl
- CheckboxGroup
- SmartSelect

## Critérios de aceite visual

- Admin mobile não deve mostrar bloqueio absoluto.
- Professor deve mostrar prioridades logo no primeiro viewport.
- Novo/Editar aluno deve usar controles estruturados.
- Criar treino deve oferecer biblioteca, clonagem e voz/texto.
- Perfil do aluno deve ter tabs.
- Aluno deve entender a semana e o treino do dia sem depender de texto corrido.
- Mobile Admin, Professor e Aluno não devem ter overflow horizontal.
- Nenhum dado real ou pagamento real deve ser usado.
