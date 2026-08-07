# Exercise System — PersonalOps Operational Model

**Data de criação**: 2026-06-14  
**Versão**: 1.0  
**Status**: Especificação Funcional  
**Escopo**: Definir como exercícios são representados como objetos operacionais de treino (não apenas como vídeos).

---

## 1. VISÃO GERAL

Exercícios no PersonalOps evoluem de simples IDs em prescrições para **objetos operacionais completos** que suportam:
- Prescrição com dicas de execução e progressões
- Execução assistida com registro de séries
- Histórico de performance do aluno
- Substituições e adaptações automáticas
- Análise anatômica visual (body-figure com destaque de grupos)

Exercícios **não são vídeos**. Vídeos são referência de linguagem visual futura; atualmente usam placeholders CSS ou SVG.

---

## 2. ESTRUTURA DE DADOS DO EXERCÍCIO

### 2.1 Schema Base

```javascript
{
  // Identificação
  "id": "ex-01",                               // ID semântico único
  "name": "Supino Reto com Barra",            // Nome legível
  "aliases": ["Barbell Bench Press"],         // Nomes alternativos
  
  // Classificação
  "category": "peito",                        // Categoria primária
  "primaryMuscle": "peito",                   // Grupo muscular principal
  "secondaryMuscles": ["triceps", "ombros"], // Grupos secundários
  "jointAction": "horizontal-adduction",      // Ação articular biomecânica
  
  // Execução
  "equipment": "Barra e banco",               // Equipamento necessário
  "difficulty": "intermediario",              // Nível de dificuldade
  "movementPattern": "empurrar",              // Padrão motor
  "defaultTempo": "3-0-1-0",                  // Tempo padrão (excêntrico-pausa1-concêntrico-pausa2)
  "defaultRestSeconds": 75,                   // Descanso padrão entre séries
  "rangeOfMotion": "completa",                // Amplitude esperada
  
  // Progressão
  "progressionTier": 1,                       // Nível na hierarquia
  "progressionPath": ["ex-02", "ex-03"],     // Exercícios para progredir
  "substitutionIds": ["ex-02", "ex-04"],     // Variações/substituições
  "regressionIds": ["ex-05"],                 // Versões mais fáceis
  
  // Instruções
  "coachingCues": [
    "Controle a fase de descida.",
    "Mantenha postura estável.",
    "Pare se houver dor aguda."
  ],
  "commonMistakes": [
    "Usar carga acima da técnica.",
    "Perder amplitude controlada.",
    "Prender a respiração sem necessidade."
  ],
  "safetyNotes": "Exercício demonstrativo. Ajustes reais exigem avaliação de profissional habilitado.",
  "contraindications": ["lesao_ombro", "tendinite_triceps"],  // Contra-indicações
  
  // Visual
  "visualType": "css-body-figure",            // "css-body-figure", "css-mannequin", "placeholder", "future-3d"
  "visualStatus": "owned-asset",              // "owned-asset", "placeholder", "needs-license", "future"
  "videoReference": null,                     // URL referencial (não asset)
  "videoLanguage": "visual-cues",             // "visual-cues", "verbal-cues", "both"
  
  // Meta
  "createdBy": "prof-01",                     // ID do criador
  "isSystemLibrary": true,                    // Sistema vs. personalizado
  "accessibility": ["knee-friendly"],         // Acessibilidades
  "tags": ["funcional", "composto"],          // Tags operacionais
  "notes": "Exercício base para força de peito e estabilidade."
}
```

### 2.2 Entidades Relacionadas

#### Prescrição de Exercício (Exercise Prescription)
Vínculo entre exercício abstrato e aluno específico em uma sessão.

```javascript
{
  "id": "pex-01",                      // ID único
  "exerciseId": "ex-01",               // Referência para exercício
  "prescribedBy": "prof-01",           // Personal que prescreveu
  "studentId": "std-01",               // Aluno alvo
  "prescribedDate": "2026-06-10",      // Data da prescrição
  
  "sets": 4,                           // Séries
  "reps": "8-10",                      // Repetições
  "restSeconds": 90,                   // Descanso prescrito
  "tempo": "3-0-1-0",                  // Tempo (se diferente do default)
  "loadSuggestion": "Carga moderada",  // Dica de carga
  "loadValue": 80,                     // Kg (opcional, para rastreamento)
  
  "priority": "primary",               // "primary", "secondary", "warm-up", "cool-down"
  "modality": "strength",              // "strength", "hypertrophy", "endurance", "power"
  "progressionRule": "auto-increase",  // "auto-increase", "manual", "fixed", "rpe-based"
  "rpeTarget": 8,                      // Rate of Perceived Exertion target
  
  "instructionOverrides": {            // Instruções personalizadas
    "coachingCues": ["Controle bem a descida"],
    "safetyNotes": "Cuidado com ombro inflamado."
  },
  
  "isSubstitution": false,             // Substituição da prescrição original
  "substitutesExerciseId": null,       // Qual exercício substitui (se aplicável)
  "reason": null,                      // Razão da substituição
  
  "workoutBlockId": "block-1",         // Bloco do treino a que pertence
  "order": 1,                          // Ordem dentro do bloco
  "status": "active"                   // "active", "archived", "modified"
}
```

#### Execução de Exercício (Exercise Execution)
Registro real do que o aluno realizou.

```javascript
{
  "id": "ex-exec-01",                  // ID único
  "exerciseId": "ex-01",               // Qual exercício
  "prescribedExerciseId": "pex-01",    // Qual prescrição foi executada
  "studentId": "std-01",               // Quem realizou
  "workoutEventId": "we-01",           // Qual treino/sessão
  
  "executedDate": "2026-06-11",        // Quando
  "executionStartTime": "14:30",       // Horário início
  "executionEndTime": "14:45",         // Horário fim
  
  "setsCompleted": [                   // Registro de cada série
    {
      "setNumber": 1,
      "repsCompleted": 10,
      "repsTarget": 10,
      "loadUsed": 80,                  // kg ou % de 1RM
      "rpe": 7,                        // Rate of Perceived Exertion (1-10)
      "notes": "Fácil",
      "videoUrl": null                 // Link para vídeo de reparo (futuro)
    },
    {
      "setNumber": 2,
      "repsCompleted": 9,
      "repsTarget": 10,
      "loadUsed": 80,
      "rpe": 8,
      "notes": "Última rep custo"
    },
    {
      "setNumber": 3,
      "repsCompleted": 8,
      "repsTarget": 10,
      "loadUsed": 80,
      "rpe": 9,
      "notes": "Dificuldade na ROM"
    },
    {
      "setNumber": 4,
      "repsCompleted": 6,
      "repsTarget": 10,
      "loadUsed": 80,
      "rpe": 9,
      "notes": ""
    }
  ],
  
  "completionStatus": "partial",       // "completed", "partial", "not-started"
  "workoutRating": 4,                  // Satisfação geral (1-5)
  "perceivedEffort": 8,                // Esforço percebido (1-10)
  "painLevel": 0,                      // Dor (0-10)
  "mood": "bom",                       // "ótimo", "bom", "normal", "ruim"
  "feedback": "Senti formigamento no braço na 3ª série.",  // Comentário livre
  
  "deviationsFromPlan": {              // Desvios da prescrição
    "skippedSets": 0,                  // Séries puladas
    "modifiedReps": 1,                 // Reps modificadas vs. prescrição
    "loadModification": 0,             // Alteração de carga (kg)
    "restModification": -10,           // Alteração de descanso (segundos)
    "reasonsForDeviation": ["Tontura"]
  },
  
  "postWorkoutNotes": "Treino bom, continuar acompanhando.",
  "coachRecommendation": null,         // Recomendação do personal (pós-execução)
  "progressionSuggestion": "increase-load", // "no-change", "increase-load", "decrease-load", "substitute"
  
  "synced": false,                     // Se foi sincronizado com backend
  "lastModified": "2026-06-11T14:45:00Z"
}
```

#### Histórico de Performance (Performance History)
Agregação de múltiplas execuções para análise de progressão.

```javascript
{
  "id": "ph-ex-01-std-01",             // ID único
  "exerciseId": "ex-01",               // Qual exercício
  "studentId": "std-01",               // Qual aluno
  "professionalId": "prof-01",         // Qual personal
  
  "executionHistory": [                // Array de execuções (últimas 20)
    {
      "date": "2026-06-11",
      "totalSetsTarget": 4,
      "totalSetsCompleted": 4,
      "completionRate": 100,
      "avgRepsPerSet": [10, 9, 8, 6],
      "avgLoadUsed": 80,
      "avgRpe": 8.25,
      "avgRom": 95,
      "painReported": false,
      "coachRating": "good"
    }
  ],
  
  "metrics": {
    "totalExecutions": 12,             // Vezes executado
    "completionRate": 83,              // % de completude média
    "rpeProgression": "stable",        // "improving", "stable", "declining"
    "loadProgression": "increasing",   // "increasing", "stable", "decreasing"
    "strengthTrend": "positive",       // "positive", "neutral", "negative"
    
    "bestPerformance": {
      "date": "2026-06-04",
      "setsTarget": 4,
      "setsCompleted": 4,
      "reps": [10, 10, 10, 9],
      "load": 80
    },
    
    "currentPerformance": {
      "load": 80,
      "avgReps": 8.25,
      "rpe": 8.25
    }
  },
  
  "projections": {
    "nextRecommendedLoad": 85,         // Sugestão de carga próxima
    "estimatedProgressionDate": "2026-06-25", // Quando progredir
    "similarExercises": ["ex-02", "ex-03"]    // Para variação
  },
  
  "lastUpdated": "2026-06-11T14:45:00Z"
}
```

---

## 3. BIBLIOTECA DE EXERCÍCIOS

### 3.1 Organização

**Estrutura hierárquica:**
- **Sistema** (50 exercícios base)
  - Por grupo muscular: peito, costas, ombro, braço, antebraço, perna, glúteo, core
  - Dentro de cada: movimentos compostos → isolados
  - Variações por equipamento

- **Personalizado** (criado por personal)
  - Exercícios custom per trainer
  - Adaptações e progressões específicas

### 3.2 Atributos de Busca/Filtro

```
- Categoria (grupo muscular)
- Padrão motor (empurrar, puxar, carregar, saltar)
- Equipamento disponível
- Nível de dificuldade
- Disponibilidade (sistema vs. custom)
- Tags (funcional, composto, isométrico, pliométrico)
- Acessibilidade (sem impacto, sem peso, adaptado)
```

### 3.3 Endpoints de Dados

```javascript
// Busca completa
DataStore.getExerciseLibrary()

// Busca por critério
DataStore.getExercisesByMuscle(muscleGroup)
DataStore.getExercisesByEquipment(equipmentId)
DataStore.getExercisesByDifficulty(level)
DataStore.getExercisesByPattern(pattern)
DataStore.getProgressionPath(exerciseId)
DataStore.getSubstitutions(exerciseId)
```

---

## 4. CARD DE EXERCÍCIO

### 4.1 Contextos de Exibição

#### A. Card em Biblioteca (Exercise Browser)
**Uso**: Seleção de exercício para prescrição.  
**Local**: Tela de criação/edição de treino.  
**Densidade**: Média (ler rápido, selecionar).

```html
<article class="exercise-card library">
  <div class="card-header">
    <span class="exercise-name">Supino Reto com Barra</span>
    <span class="difficulty-badge intermediario">Intermediário</span>
  </div>
  
  <div class="card-visual">
    <!-- Body-figure SVG: peito e triceps destacados -->
    <svg class="body-figure" data-muscles="peito,triceps">...</svg>
  </div>
  
  <div class="card-details">
    <div class="detail-row">
      <span class="label">Grupo</span>
      <span class="value">Peito</span>
    </div>
    <div class="detail-row">
      <span class="label">Equipamento</span>
      <span class="value">Barra e banco</span>
    </div>
    <div class="detail-row">
      <span class="label">Padrão</span>
      <span class="value">Empurrar</span>
    </div>
  </div>
  
  <footer class="card-footer">
    <button class="btn-primary">Usar</button>
    <button class="btn-secondary" aria-label="Detalhes">ℹ️</button>
  </footer>
</article>
```

#### B. Card em Prescrição (Workout Builder)
**Uso**: Review de exercício prescrito; mostra séries/reps.  
**Local**: Visão do workout montado.  
**Densidade**: Alta (sets, reps, load, rest).

```html
<article class="exercise-card prescription">
  <div class="card-header">
    <span class="order-badge">1</span>
    <span class="exercise-name">Supino Reto com Barra</span>
    <span class="priority-tag primary">Principal</span>
  </div>
  
  <div class="prescription-specs">
    <div class="spec-group">
      <span class="spec-label">Séries × Reps</span>
      <span class="spec-value">4 × 8-10</span>
    </div>
    <div class="spec-group">
      <span class="spec-label">Carga</span>
      <span class="spec-value">Moderada</span>
    </div>
    <div class="spec-group">
      <span class="spec-label">Descanso</span>
      <span class="spec-value">90s</span>
    </div>
  </div>
  
  <div class="coaching-snippet">
    <strong>Dica:</strong> Controle a fase de descida.
  </div>
  
  <div class="card-actions">
    <button class="btn-edit">Editar</button>
    <button class="btn-delete" aria-label="Remover">✕</button>
  </div>
</article>
```

#### C. Card em Execução (Workout Session)
**Uso**: Guia durante a execução; registro de série.  
**Local**: Tela do aluno executando treino.  
**Densidade**: Baixa (foco em registro; distrações mínimas).

```html
<article class="exercise-card execution active">
  <header class="card-header">
    <span class="exercise-order">1 de 4</span>
    <h3 class="exercise-name">Supino Reto com Barra</h3>
  </header>
  
  <section class="coaching-focus">
    <div class="coaching-cue-highlight">
      <strong>💡 Dica:</strong> Controle a fase de descida.
    </div>
  </section>
  
  <section class="sets-registry">
    <div class="sets-header">
      <span class="label">Séries prescritas: 4 × 8-10 reps</span>
    </div>
    
    <div class="set-row completed">
      <span class="set-number">Série 1</span>
      <input type="number" placeholder="Reps" value="10" class="rep-input" />
      <input type="number" placeholder="RPE" min="1" max="10" class="rpe-input" />
      <span class="timer">2:14 ⏱️</span>
    </div>
    
    <div class="set-row current">
      <span class="set-number">Série 2</span>
      <input type="number" placeholder="Reps" class="rep-input focus" />
      <input type="number" placeholder="RPE" min="1" max="10" class="rpe-input" />
      <span class="timer">0:00 ⏱️</span>
    </div>
    
    <div class="set-row pending">
      <span class="set-number">Série 3</span>
      <input type="number" placeholder="Reps" class="rep-input" disabled />
      <input type="number" placeholder="RPE" min="1" max="10" class="rpe-input" disabled />
      <span class="timer">— ⏱️</span>
    </div>
    
    <div class="set-row pending">
      <span class="set-number">Série 4</span>
      <input type="number" placeholder="Reps" class="rep-input" disabled />
      <input type="number" placeholder="RPE" min="1" max="10" class="rpe-input" disabled />
      <span class="timer">— ⏱️</span>
    </div>
  </section>
  
  <footer class="card-footer">
    <button class="btn-secondary">Pular série</button>
    <button class="btn-primary" disabled>Próximo exercício</button>
  </footer>
</article>
```

#### D. Card em Histórico (Student Progress)
**Uso**: Review de performance anterior.  
**Local**: Perfil do aluno / histórico.  
**Densidade**: Média (última performance; trends).

```html
<article class="exercise-card history">
  <header class="card-header">
    <span class="exercise-name">Supino Reto com Barra</span>
    <span class="last-date">Última: 11 jun</span>
  </header>
  
  <div class="history-summary">
    <div class="summary-row">
      <span class="label">Execuções</span>
      <span class="value">12 vezes</span>
    </div>
    <div class="summary-row">
      <span class="label">Completude média</span>
      <span class="value">83%</span>
    </div>
    <div class="summary-row">
      <span class="label">Carga atual</span>
      <span class="value">80 kg</span>
    </div>
    <div class="summary-row">
      <span class="label">Trend</span>
      <span class="value trend positive">↗️ Aumentando</span>
    </div>
  </div>
  
  <div class="mini-chart">
    <!-- Sparkline: carga ao longo do tempo -->
  </div>
  
  <div class="card-actions">
    <button class="btn-secondary">Ver detalhes</button>
  </div>
</article>
```

### 4.2 Estados de Card

```css
/* Estados visuais */
.exercise-card.active { /* Durante execução */ }
.exercise-card.completed { /* Séries completas */ }
.exercise-card.pending { /* Fila de execução */ }
.exercise-card.substituted { /* Substituído */ }
.exercise-card.modified { /* Prescrição alterada */ }
```

---

## 5. TELA DE DETALHE

### 5.1 Informações Exibidas

**Header**
- Nome do exercício
- Grupo muscular primário
- Nível de dificuldade
- Equipamento necessário

**Seção Visual**
- Body-figure SVG com músculos destacados
- Anotação de padrão motor
- Status do asset visual (placeholder, próprio, etc.)

**Instruções de Execução**
- Dicas de coaching (3-5 bullets)
- Erros comuns (3-5 bullets)
- Notas de segurança
- Contra-indicações

**Biomecânica**
- Ação articular (ex: adução horizontal)
- Amplitude de movimento esperada
- Tempo de movimento sugerido (3-0-1-0)

**Progressão e Variações**
- Exercícios mais fáceis (regressão)
- Próximos exercícios (progressão)
- Substituições laterais (variações)

**Histórico Agregado** (se aluno autenticado)
- Últimas 5 execuções
- Carga média
- RPE médio
- Taxa de completude

---

## 6. TELA DE EXECUÇÃO

### 6.1 Fluxo de Execução

**Pré-execução (1 min antes)**
- Card do exercício com dicas principais
- Opção de warm-up/prévia
- Botão "Iniciar série 1"

**Durante Série (0-5 min)**
- Contador de reps em tempo real
- Input de RPE (1-10)
- Timer de descanso automático após série
- Botões: "Série completa" / "Parar" / "Ajuda"

**Entre Séries (descanso)**
- Countdown de descanso
- Mostrar próxima série
- Botão "Série completa, próxima"

**Pós-Execução (após última série)**
- Resumo de séries (target vs. realizado)
- Input de feedback: dor (0-10), esforço (1-10), humor
- Textarea para notas livres
- Botão "Próximo exercício"

### 6.2 Captura de Dados

```javascript
{
  exerciseId,      // ID do exercício
  setsCompleted: [
    { reps, rpe, notes, duration },
    ...
  ],
  totalTime,       // Tempo total de execução
  painLevel,       // Dor (0-10)
  perceivedEffort, // Esforço (1-10)
  mood,            // Humor
  feedback,        // Notas livres
  deviations       // Séries puladas, carga modificada, etc.
}
```

### 6.3 Resposta Contextual

Se o aluno termina com:
- **RPE > 9 em 2+ séries**: Sugerir manter carga ou reduzir reps
- **Completude < 70%**: Sinalizar para revisão pelo personal
- **Dor > 5**: Alertar "consulte seu personal"
- **RPE progressivo (7→9→9→9)**: Normal; considerar progressão na próxima

---

## 7. CAMADA ANATÔMICA (Body-Figure)

### 7.1 Grupos Musculares e Destaque

**Definição por grupo**: Lista de músculos inclusos.

```javascript
{
  "grupo": {
    "id": "peito",
    "label": "Peito",
    "muscles": ["pectoralis-major", "pectoralis-minor"],
    "color": "hsl(10, 80%, 50%)"  // Cor primária
  }
}
```

**Sistema de cores:**
- Primário (músculo alvo): Saturado, brilhante
- Secundário (sinergista): Moderado
- Passivo (estabilizador): Pálido/cinza
- Não envolvido: Cinza escuro (fundo)

### 7.2 Renderização

- **Formato**: SVG inline (sem bloat de assets)
- **Dinâmico**: Classes CSS ativadas por `data-muscles="peito,triceps"`
- **Responsivo**: Redimensiona sem distorção
- **Acessível**: Descrição `aria-label` com nomes dos grupos

### 7.3 Aplicação em Cards

```html
<svg class="body-figure" data-muscles="peito,triceps" aria-label="Músculos envolvidos: peito, tríceps">
  <!-- Paths SVG com classes .muscle-peito, .muscle-triceps, etc. -->
  <!-- CSS aplica cores baseado em data-muscles -->
</svg>
```

---

## 8. PRESCRIÇÃO DO PERSONAL

### 8.1 Fluxo de Prescrição

**1. Seleção de Exercício**
- Browser de biblioteca com filtros
- Preview de card com anatomia
- Clique para selecionar

**2. Configuração de Prescrição**
- Séries
- Reps (range: "8-10" ou "3-5")
- Carga sugerida (numérica ou descritiva)
- Descanso (padrão ou customizado)
- Tempo (padrão ou customizado)
- Notas de prescrição

**3. Instruções Customizadas**
- Overrides de coaching cues
- Notas de segurança específicas do aluno
- Progressão esperada

**4. Bloco de Treino**
- Atribuir a um bloco (warm-up, principal, cool-down)
- Definir ordem

**5. Review**
- Card de prescrição final
- Editar ou confirmar

### 8.2 Endpoints

```javascript
DataStore.prescribeExercise({
  exerciseId,
  studentId,
  sets,
  reps,
  loadSuggestion,
  restSeconds,
  notes,
  blockId,
  order,
  ...
})

DataStore.modifyPrescription(prescriptionId, { sets, reps, ... })
DataStore.replacePrescription(prescriptionId, newExerciseId)
```

---

## 9. HISTÓRICO DO ALUNO

### 9.1 Visualizações de Histórico

#### Página: Exercício Específico
- Últimas 10 execuções
- Gráfico de carga (trend line)
- Gráfico de reps/RPE
- Melhor performance
- Performance média

#### Página: Histórico do Treino (por data)
- Todos os exercícios executados naquele dia
- Completude por exercício
- Feedback geral do treino

#### Página: Performance (agregado)
- Todos os exercícios já executados
- Ranking por frequência
- Ranking por progresso
- Recomendações de progressão

### 9.2 Métricas Rastreadas

- **Execuções**: Quantas vezes completou
- **Completude**: % de séries realizadas vs. prescritas
- **Carga**: Evolução (kg ou % 1RM)
- **RPE**: Taxa de percepção de esforço
- **ROM**: Amplitude de movimento observada
- **Dor**: Reportada pelo aluno
- **Tempo**: Duração total da execução

### 9.3 Endpoints

```javascript
DataStore.getExerciseHistory(exerciseId, studentId)
DataStore.getPerformanceMetrics(exerciseId, studentId)
DataStore.getProgressionSuggestions(exerciseId, studentId)
```

---

## 10. SUBSTITUIÇÕES E PROGRESSÕES

### 10.1 Tipos de Relação

**Progressão (Harder)**
- Ex: Supino com barra → Supino com halteres → Supino em pé
- Campo: `progressionPath: [ex-02, ex-03, ...]`

**Regressão (Easier)**
- Ex: Supino → Supino Smith → Máquina de peito
- Campo: `regressionIds: [ex-05, ex-06]`

**Substituição Lateral (Variação)**
- Ex: Supino com barra → Supino com halteres (mesma dificuldade, estímulo similar)
- Campo: `substitutionIds: [ex-02, ex-04]`

### 10.2 Regras de Substituição

**Automática** (se lesão/contra-indicação):
- Aluno relata dor no ombro
- Sistema filtra exercícios com `contraindications: ["lesao_ombro"]`
- Apresenta: regressões ou laterais sem impacto

**Manual** (sugestão do personal):
- Personal vê histórico (carga não progrediu em 4 semanas)
- Clica "Progredir" em um card de detalhe
- Sistema sugere próximo exercício na progressão
- Personal confirma e ajusta séries/reps

**Regra de Progressão**:
- Se 3+ séries em RPE ≤ 6 nas últimas 2 execuções
- Sugerir: +5kg ou +2-3 reps ou próximo exercício
- Se 2+ séries em RPE > 9
- Sugerir: manter carga ou -1-2 reps

### 10.3 Endpoints

```javascript
DataStore.getProgressionPath(exerciseId)
DataStore.getRegressions(exerciseId)
DataStore.getSubstitutions(exerciseId)
DataStore.getProgressionSuggestion(exerciseId, studentId)
DataStore.substituteExercise(prescriptionId, newExerciseId, reason)
```

---

## 11. PADRÃO VISUAL DOS VÍDEOS/LOOPS

### 11.1 Referência (Não Asset)

Vídeos do Pinterest/YouTube servem apenas como **referência de linguagem visual** para futuros assets. **Não são baixados, não são servidos, não são assets.**

**Exemplos de referência** (URLs mantidas em comentário ou wiki):
- https://pinterest.com/pin/supino-reto-barra-home-gym (referência de cinemática)
- https://youtube.com/watch?v=exercise-cue-demo (referência de coaching)

### 11.2 Estratégia de Asset Visual

Hoje:
- **Placeholder**: CSS mannequin, SVG genérico, body-figure
- **Status**: `visualStatus: "placeholder"` ou `"owned-asset"`

Futuro (não implementar agora):
- **3D Model**: Figura humanoide em WebGL/Three.js
- **Video Loop**: GIF próprio de 5-10 segundos (sem áudio)
- **SVG Animado**: Sequência de poses em SVG

### 11.3 Padrão de Assetização

```javascript
{
  "visualType": "css-body-figure",    // Tipo atual
  "visualStatus": "placeholder",      // Status atual
  "futureAssetType": "3d-model",      // Planejado
  "futureAssetUrl": null,             // URL real (quando pronto)
  "videoReferences": [                // Links de referência apenas
    {
      "source": "pinterest",
      "url": "...",
      "note": "Cinemática de peito"
    }
  ]
}
```

---

## 12. INTEGRAÇÃO E FLUXOS

### 12.1 Criação de Workout

```
Personal → Biblioteca → Seleciona "Supino Reto" 
  → Configura 4x8-10 + 90s descanso 
  → Bloco: Principal, ordem: 1 
  → Salva prescrição 
  → Atribui a aluno "João" para segunda-feira 
  → Sistema cria `prescribed-workout.json` entry
```

### 12.2 Execução de Treino

```
Aluno → Abre "Treino de segunda" 
  → Vê card de Supino com dicas 
  → Realiza série 1: 10 reps, RPE 7 
  → Descanso 90s (countdown automático) 
  → Série 2, 3, 4... 
  → Ao fim: seleciona "Completei treino" 
  → Feedback: "Dor: 0, Esforço: 8, Humor: bom" 
  → Sistema registra execution event
```

### 12.3 Review de Progresso

```
Personal → Perfil do aluno → "Supino Reto" 
  → Vê histórico: 12 execuções, carga crescente (70→80 kg) 
  → RPE estável (~8) → "Pronto para progredir" 
  → Clica "Evoluir" → Sistema sugere "Supino Halteres" 
  → Personal confirma e nova prescrição é criada
```

---

## 13. ESTRUTURA DE PASTAS E DOCUMENTAÇÃO

```
docs/product/
├── exercise-system.md          ← Você está aqui
├── exercise-library-schema.md  ← Schema detalhado (futuro)
├── exercise-ux-flows.md        ← Wireframes/flows (futuro)
├── exercise-visual-spec.md     ← Body-figure SVG (futuro)

assets/data/
├── exercises.json              ← Biblioteca (50 exercícios)
├── exercise-prescriptions.json ← Prescrições ativas (futuro)
├── exercise-executions.json    ← Histórico de execuções (futuro)

assets/js/
├── exercise-system.js          ← Lógica de exercícios (futuro)
├── body-figure.js              ← Renderização de anatomy (futuro)
```

---

## 14. RESTRIÇÕES E FUTURO

### 14.1 Escopo V1 (Atual)

✅ Exercícios como objetos JSON com dicas, erros, segurança  
✅ Prescrição com séries, reps, carga, descanso  
✅ Execução com registro de reps/RPE por série  
✅ Body-figure estático com destaque de músculos  
✅ Histórico de performance agregado  
✅ Sugestões de progressão baseadas em RPE

❌ Vídeos ou GIFs de execução  
❌ Análise de biomecânica em tempo real  
❌ Seleção automática de exercício por IA  
❌ Relatórios de postura via câmera  
❌ Integração com wearables (sensor de movimento)

### 14.2 Possíveis Evoluções

**V2**:
- 3D mannequin interativo
- Video loop próprio (GIF/WebP)
- Recomendações de progressão com IA
- Relatórios PDF de evolução

**V3**:
- Análise de vídeo do aluno (postura, ROM, velocidade)
- Biblioteca de exercícios customizada por estúdio/academia
- Sincronização com smartwatches (RPE automático)

---

## 15. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Schema de `exercises.json` expandido com `progressionPath`, `regressionIds`, etc.
- [ ] Data store: funções de prescrição, execução, histórico
- [ ] UI de biblioteca com filtros
- [ ] Card de exercício (4 contextos: library, prescription, execution, history)
- [ ] Tela de detalhe de exercício
- [ ] Tela de execução com registro de séries
- [ ] Body-figure SVG dinâmico
- [ ] Geração de sugestões de progressão
- [ ] Sistema de substituição (manual + automática)
- [ ] Histórico e gráficos de performance
- [ ] QA e validação completa

---

## 16. REFERÊNCIAS E LINKS

- `PROJECT_CONTROL.md` — Histórico de sessões
- `WORKOUT_LIBRARY_REQUIREMENTS.md` — Biblioteca de treinos
- `PROGRESS_AND_FEEDBACK_REQUIREMENTS.md` — Histórico e feedback
- `ai-memory/` — Decisões anteriores e memória do projeto

---

**Próximas ações:**
1. Validar este documento com o usuário
2. Registrar decisão no HenricoOPS
3. Criar branch `docs/exercise-system-spec` para expansão
4. Iniciar implementação em ordem de prioridade (schema → UI → lógica)

**Última atualização**: 2026-06-14  
**Versão estável**: Sim
