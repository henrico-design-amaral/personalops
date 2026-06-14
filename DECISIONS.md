# Decisions — PersonalOps

## 2026-06-01

- Nome correto do produto: PersonalOps.
- Produto será tratado como cockpit operacional do personal trainer.
- Benchmark deve cobrir apps de personal trainer, apps de musculação e bibliotecas visuais.
- Offline-first é pilar técnico central.
- Biblioteca visual deve priorizar GIFs/animações/bonecos neutros licenciáveis.
- IA deve ser contextual e assistiva, não substitutiva.
- Voz deve começar de forma pragmática: ditado para personal e push-to-talk para aluno.
- Pesquisa com usuário deve ser simples e separada do benchmark.
- LGPD e responsabilidade profissional entram desde o MVP.

## 2026-06-14

### Exercise System — Operational Model

- Exercícios no PersonalOps são **objetos operacionais completos**, não apenas vídeos.
- Schema de exercício inclui: identificação, classificação, execução, progressão, instruções, visual e meta.
- Prescrição de exercício é vínculo entre exercício abstrato e aluno com séries, reps, carga, descanso e modalidade.
- Execução registra: reps realizadas, RPE, dor, humor e desvios da prescrição por série.
- Histórico agregado rastreia: execuções, completude, progressão de carga/RPE, trends.
- Biblioteca organiza 50+ exercícios base por grupo muscular, padrão motor, equipamento, dificuldade.
- Card de exercício tem 4 contextos: biblioteca (seleção), prescrição (review), execução (registro), histórico (performance).
- Body-figure SVG dinâmico com `data-muscles` para destaque de grupos musculares envolvidos.
- Progressão automática: sugerir carga/próximo exercício se RPE ≤ 6 em 3+ séries.
- Substituição manual: personal evolui exercício; sistema filtra contra-indicações e sugere regressões.
- Vídeos são apenas referência visual (Pinterest/YouTube); não são assets. Placeholders CSS/SVG até futuro 3D.
- Documentação em `docs/product/exercise-system.md` (especificação v1.0 estável).
