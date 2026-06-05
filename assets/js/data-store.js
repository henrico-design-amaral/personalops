/* =========================================================================
   PersonalOps — Data Store Layer V1.2
   Handles dynamic loading of synthetic JSON fixtures with inline fallbacks.
   ========================================================================= */

'use strict';

window.DataStore = {
  // Loaded datasets (either from JSON fetch or inline fallbacks)
  data: {
    users: {},
    professionals: [],
    students: [],
    exercises: [],
    workoutTemplates: [],
    prescribedWorkouts: [],
    workoutEvents: [],
    feedbacks: [],
    assessments: [],
    payments: []
  },

  // State to check if data was loaded from network or fallback
  loadedFromNetwork: false,

  // Fallbacks used when fetching fails (e.g. offline, file:// protocol)
  fallbacks: {
    users: {
      "admin@personalops.test": {
        "password": "admin123",
        "role": "admin",
        "name": "Admin",
        "avatar": "A",
        "admin": true
      },
      "professor@personalops.test": {
        "password": "prof123",
        "role": "professor",
        "name": "Prof. Silva",
        "avatar": "S",
        "professionalId": "prof-01"
      },
      "aluno@personalops.test": {
        "password": "aluno123",
        "role": "aluno",
        "name": "Carlos Mendes",
        "avatar": "C",
        "studentId": "std-01"
      }
    },
    professionals: [
      {
        "id": "prof-01",
        "name": "Prof. Silva",
        "specialty": "Hipertrofia & Reabilitação",
        "methodSummary": "Método híbrido focado em progressão de carga, consistência diária e biomecânica precisa.",
        "communicationTone": "Direto, técnico e motivador",
        "activeStudentsCount": 6,
        "weeklyCheckinDay": "Sexta-feira",
        "defaultWorkoutSplit": "ABC",
        "aiRules": "Evitar exercícios de impacto articular alto nos dias seguintes a treinos de perna. Priorizar RPE entre 7 e 9."
      },
      {
        "id": "prof-02",
        "name": "Profa. Camila",
        "specialty": "Emagrecimento & Condicionamento",
        "methodSummary": "Acompanhamento online diário com foco em queima calórica e rotinas sustentáveis para home gym e condomínio.",
        "communicationTone": "Acolhedor, atencioso e empático",
        "activeStudentsCount": 10,
        "weeklyCheckinDay": "Segunda-feira",
        "defaultWorkoutSplit": "Fullbody / HIIT",
        "aiRules": "Monitorar hidratação e fadiga semanal. Sugerir exercícios com peso corporal em caso de falta de equipamento."
      }
    ],
    students: [
      {
        "id": "std-01",
        "professionalId": "prof-01",
        "name": "Carlos Mendes",
        "goal": "Hipertrofia muscular",
        "trainingMode": "Híbrido",
        "level": "Intermediário",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T07:22:00Z",
        "nextWorkoutAt": "2026-06-05T07:00:00Z",
        "restrictions": ["Leve dor no ombro esquerdo"],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": true,
        "internetQuality": "boa",
        "notes": "Focar em progressão de carga no supino mantendo técnica estrita."
      },
      {
        "id": "std-02",
        "professionalId": "prof-01",
        "name": "Ana Rodrigues",
        "goal": "Emagrecimento",
        "trainingMode": "Online",
        "level": "Intermediário",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T06:55:00Z",
        "nextWorkoutAt": "2026-06-05T08:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Condomínio",
        "usesBluetooth": false,
        "internetQuality": "excelente",
        "notes": "Sentiu RPE 9 no supino reto na última sessão."
      },
      {
        "id": "std-03",
        "professionalId": "prof-01",
        "name": "Pedro Lima",
        "goal": "Força máxima",
        "trainingMode": "Presencial",
        "level": "Avançado",
        "adherenceStatus": "Baixa",
        "riskLevel": "Médio",
        "lastWorkoutAt": "2026-06-02T18:30:00Z",
        "nextWorkoutAt": "2026-06-06T18:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Academia de powerlifting",
        "usesBluetooth": true,
        "internetQuality": "instável",
        "notes": "Ausente ontem. Apresenta dificuldades de conciliar horários de trabalho."
      },
      {
        "id": "std-04",
        "professionalId": "prof-01",
        "name": "Mariana Costa",
        "goal": "Condicionamento físico",
        "trainingMode": "Híbrido",
        "level": "Iniciante",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-03T19:00:00Z",
        "nextWorkoutAt": "2026-06-05T19:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Início recente. Muito motivada. Excelente resposta na adaptação anatômica."
      },
      {
        "id": "std-05",
        "professionalId": "prof-02",
        "name": "Luiza Santos",
        "goal": "Emagrecimento",
        "trainingMode": "Online",
        "level": "Iniciante",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T10:00:00Z",
        "nextWorkoutAt": "2026-06-06T10:00:00Z",
        "restrictions": ["Condromalácia patelar grau I"],
        "preferredGymContext": "Home gym",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Evitar agachamentos profundos. Focar em controle de amplitude."
      },
      {
        "id": "std-06",
        "professionalId": "prof-01",
        "name": "Julio Cesar",
        "goal": "Hipertrofia",
        "trainingMode": "Presencial",
        "level": "Avançado",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T12:00:00Z",
        "nextWorkoutAt": "2026-06-05T12:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": true,
        "internetQuality": "excelente",
        "notes": "Evolução de cargas consistente nos exercícios multiarticulares."
      },
      {
        "id": "std-07",
        "professionalId": "prof-02",
        "name": "Gabriela Dias",
        "goal": "Definição muscular",
        "trainingMode": "Híbrido",
        "level": "Intermediário",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-03T08:00:00Z",
        "nextWorkoutAt": "2026-06-05T08:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Condomínio",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Fazer treinos mais metabólicos com descansos curtos."
      },
      {
        "id": "std-08",
        "professionalId": "prof-02",
        "name": "Roberto Alves",
        "goal": "Saúde cardiovascular",
        "trainingMode": "Online",
        "level": "Intermediário",
        "adherenceStatus": "Média",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-01T07:00:00Z",
        "nextWorkoutAt": "2026-06-05T07:00:00Z",
        "restrictions": ["Hipertensão sob controle"],
        "preferredGymContext": "Home gym",
        "usesBluetooth": true,
        "internetQuality": "boa",
        "notes": "Monitorar frequência cardíaca no descanso."
      },
      {
        "id": "std-09",
        "professionalId": "prof-02",
        "name": "Felipe Neto",
        "goal": "Condicionamento físico",
        "trainingMode": "Presencial",
        "level": "Iniciante",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T15:00:00Z",
        "nextWorkoutAt": "2026-06-06T15:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Trabalhar consciência corporal e padrão de movimento."
      },
      {
        "id": "std-10",
        "professionalId": "prof-01",
        "name": "Lucas Sousa",
        "goal": "Hipertrofia",
        "trainingMode": "Híbrido",
        "level": "Intermediário",
        "adherenceStatus": "Baixa",
        "riskLevel": "Alto",
        "lastWorkoutAt": "2026-05-25T19:00:00Z",
        "nextWorkoutAt": "2026-06-06T19:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Sem treinar há mais de 10 dias. Alto risco de evasão."
      },
      {
        "id": "std-11",
        "professionalId": "prof-02",
        "name": "Patricia Lima",
        "goal": "Emagrecimento",
        "trainingMode": "Online",
        "level": "Avançado",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T18:00:00Z",
        "nextWorkoutAt": "2026-06-05T18:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Condomínio",
        "usesBluetooth": true,
        "internetQuality": "excelente",
        "notes": "Feedback pendente de análise sobre volume de treino."
      },
      {
        "id": "std-12",
        "professionalId": "prof-01",
        "name": "Ricardo Santos",
        "goal": "Condicionamento físico",
        "trainingMode": "Presencial",
        "level": "Intermediário",
        "adherenceStatus": "Média",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-03T10:00:00Z",
        "nextWorkoutAt": "2026-06-05T10:00:00Z",
        "restrictions": ["Hérnia discal L4-L5 inativa"],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Limitação na flexão da coluna. Focar em estabilidade lombo-pélvica."
      },
      {
        "id": "std-13",
        "professionalId": "prof-02",
        "name": "Fernanda Melo",
        "goal": "Massa muscular",
        "trainingMode": "Híbrido",
        "level": "Iniciante",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T20:00:00Z",
        "nextWorkoutAt": "2026-06-06T20:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Home gym",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Evolução excelente nas primeiras 4 semanas de treino estruturado."
      },
      {
        "id": "std-14",
        "professionalId": "prof-01",
        "name": "Thiago Rocha",
        "goal": "Hipertrofia",
        "trainingMode": "Online",
        "level": "Avançado",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-04T06:00:00Z",
        "nextWorkoutAt": "2026-06-05T06:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Academia comercial",
        "usesBluetooth": true,
        "internetQuality": "boa",
        "notes": "Treinos densos com cargas altas. Muito focado."
      },
      {
        "id": "std-15",
        "professionalId": "prof-02",
        "name": "Camila Nogueira",
        "goal": "Emagrecimento",
        "trainingMode": "Híbrido",
        "level": "Intermediário",
        "adherenceStatus": "Alta",
        "riskLevel": "Baixo",
        "lastWorkoutAt": "2026-06-03T11:00:00Z",
        "nextWorkoutAt": "2026-06-05T11:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Condomínio",
        "usesBluetooth": false,
        "internetQuality": "excelente",
        "notes": "Acompanhamento alimentar e físico em ótima sinergia."
      },
      {
        "id": "std-16",
        "professionalId": "prof-02",
        "name": "Bruno Fonseca",
        "goal": "Condicionamento físico",
        "trainingMode": "Online",
        "level": "Iniciante",
        "adherenceStatus": "Baixa",
        "riskLevel": "Médio",
        "lastWorkoutAt": "2026-05-30T07:00:00Z",
        "nextWorkoutAt": "2026-06-06T07:00:00Z",
        "restrictions": [],
        "preferredGymContext": "Home gym",
        "usesBluetooth": false,
        "internetQuality": "boa",
        "notes": "Falta de adesão recorrente por viagens. Reestruturar split para 2x/semana."
      }
    ],
    exercises: [
      {
        "id": "ex-01",
        "name": "Supino Reto com Barra",
        "category": "Peito",
        "primaryMuscle": "Peitoral Maior",
        "secondaryMuscles": ["Tríceps Braquial", "Deltoide Anterior"],
        "equipment": "Barra & Banco",
        "difficulty": "Intermediário",
        "movementPattern": "Empurrar",
        "defaultRestSeconds": 120,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-02",
        "name": "Supino Inclinado com Halteres",
        "category": "Peito",
        "primaryMuscle": "Peitoral Superior",
        "secondaryMuscles": ["Tríceps Braquial", "Deltoide Anterior"],
        "equipment": "Halteres & Banco Inclinado",
        "difficulty": "Intermediário",
        "movementPattern": "Empurrar",
        "defaultRestSeconds": 90,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-04",
        "name": "Tríceps Pulley com Corda",
        "category": "Braços",
        "primaryMuscle": "Tríceps Braquial",
        "secondaryMuscles": [],
        "equipment": "Polia",
        "difficulty": "Iniciante",
        "movementPattern": "Empurrar",
        "defaultRestSeconds": 45,
        "defaultTempo": "2-0-1-1",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-06",
        "name": "Desenvolvimento com Halteres",
        "category": "Ombros",
        "primaryMuscle": "Deltoide Anterior",
        "secondaryMuscles": ["Tríceps Braquial", "Deltoide Lateral", "Trapézio"],
        "equipment": "Halteres & Banco",
        "difficulty": "Intermediário",
        "movementPattern": "Empurrar",
        "defaultRestSeconds": 90,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-07",
        "name": "Elevação Lateral com Halteres",
        "category": "Ombros",
        "primaryMuscle": "Deltoide Lateral",
        "secondaryMuscles": ["Trapézio", "Deltoide Anterior"],
        "equipment": "Halteres",
        "difficulty": "Iniciante",
        "movementPattern": "Empurrar",
        "defaultRestSeconds": 60,
        "defaultTempo": "2-0-1-1",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-08",
        "name": "Agachamento Livre com Barra",
        "category": "Pernas",
        "primaryMuscle": "Quadríceps",
        "secondaryMuscles": ["Glúteo Máximo", "Isquiotibiais", "Eretores da Espinha"],
        "equipment": "Barra & Rack de Agachamento",
        "difficulty": "Avançado",
        "movementPattern": "Agachar",
        "defaultRestSeconds": 120,
        "defaultTempo": "4-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-10",
        "name": "Cadeira Extensora",
        "category": "Pernas",
        "primaryMuscle": "Quadríceps",
        "secondaryMuscles": [],
        "equipment": "Cadeira Extensora",
        "difficulty": "Iniciante",
        "movementPattern": "Agachar",
        "defaultRestSeconds": 60,
        "defaultTempo": "2-0-1-1",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-11",
        "name": "Mesa Flexora",
        "category": "Pernas",
        "primaryMuscle": "Isquiotibiais",
        "secondaryMuscles": ["Gastrocnêmio"],
        "equipment": "Mesa Flexora",
        "difficulty": "Iniciante",
        "movementPattern": "Dobradiça Quadril",
        "defaultRestSeconds": 60,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-13",
        "name": "Remada Curvada com Barra",
        "category": "Costas",
        "primaryMuscle": "Latíssimo do Dorso",
        "secondaryMuscles": ["Trapézio", "Romboides", "Deltoide Posterior", "Bíceps Braquial"],
        "equipment": "Barra",
        "difficulty": "Avançado",
        "movementPattern": "Puxar",
        "defaultRestSeconds": 90,
        "defaultTempo": "3-0-1-1",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-14",
        "name": "Puxada Alta no Pulley",
        "category": "Costas",
        "primaryMuscle": "Latíssimo do Dorso",
        "secondaryMuscles": ["Bíceps Braquial", "Deltoide Posterior", "Romboides"],
        "equipment": "Polia Alta",
        "difficulty": "Iniciante",
        "movementPattern": "Puxar",
        "defaultRestSeconds": 75,
        "defaultTempo": "3-0-1-1",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-15",
        "name": "Rosca Direta com Barra",
        "category": "Braços",
        "primaryMuscle": "Bíceps Braquial",
        "secondaryMuscles": ["Braquiorradial", "Antebraço"],
        "equipment": "Barra W ou Reta",
        "difficulty": "Iniciante",
        "movementPattern": "Puxar",
        "defaultRestSeconds": 60,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-20",
        "name": "Abdominal Supra (Crunch)",
        "category": "Core",
        "primaryMuscle": "Reto do Abdômen",
        "secondaryMuscles": ["Oblíquos"],
        "equipment": "Colchonete",
        "difficulty": "Iniciante",
        "movementPattern": "Core",
        "defaultRestSeconds": 45,
        "defaultTempo": "2-0-1-1",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-21",
        "name": "Prancha Isometrica Frontal",
        "category": "Core",
        "primaryMuscle": "Reto do Abdômen",
        "secondaryMuscles": ["Transverso do Abdômen", "Oblíquos", "Eretores da Espinha"],
        "equipment": "Colchonete",
        "difficulty": "Iniciante",
        "movementPattern": "Core",
        "defaultRestSeconds": 60,
        "defaultTempo": "Isometrico",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-22",
        "name": "Flexão de Braço no Solo",
        "category": "Peito",
        "primaryMuscle": "Peitoral Maior",
        "secondaryMuscles": ["Tríceps Braquial", "Deltoide Anterior", "Core"],
        "equipment": "Peso Corporal",
        "difficulty": "Iniciante",
        "movementPattern": "Empurrar",
        "defaultRestSeconds": 60,
        "defaultTempo": "2-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-23",
        "name": "Afundo com Halteres",
        "category": "Pernas",
        "primaryMuscle": "Quadríceps",
        "secondaryMuscles": ["Glúteo Máximo", "Isquiotibiais"],
        "equipment": "Halteres",
        "difficulty": "Intermediário",
        "movementPattern": "Estocada",
        "defaultRestSeconds": 90,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      },
      {
        "id": "ex-24",
        "name": "Levantamento Terra Stiff",
        "category": "Pernas",
        "primaryMuscle": "Isquiotibiais",
        "secondaryMuscles": ["Glúteo Máximo", "Eretores da Espinha"],
        "equipment": "Barra ou Halteres",
        "difficulty": "Intermediário",
        "movementPattern": "Dobradiça Quadril",
        "defaultRestSeconds": 90,
        "defaultTempo": "3-0-1-0",
        "visualType": "css-mannequin",
        "visualStatus": "placeholder"
      }
    ],
    workoutTemplates: [
      {
        "id": "temp-01",
        "professionalId": "prof-01",
        "name": "Peito + Bíceps",
        "goal": "Hipertrofia de tronco superior",
        "level": "Intermediário",
        "estimatedDurationMinutes": 60
      },
      {
        "id": "temp-02",
        "professionalId": "prof-01",
        "name": "Costas + Tríceps",
        "goal": "Foco em largura de costas e força de tríceps",
        "level": "Intermediário",
        "estimatedDurationMinutes": 60
      }
    ],
    prescribedWorkouts: [
      {
        "id": "pw-01",
        "studentId": "std-01",
        "professionalId": "prof-01",
        "title": "Treino A - Peito e Ombro",
        "scheduledDate": "2026-06-05",
        "status": "pending",
        "estimatedDurationMinutes": 60,
        "exercises": [
          { "exerciseId": "ex-01", "order": 1, "sets": 4, "reps": "8-12", "loadSuggestion": "60kg", "restSeconds": 120 },
          { "exerciseId": "ex-02", "order": 2, "sets": 3, "reps": "10-12", "loadSuggestion": "22kg cada halter", "restSeconds": 90 },
          { "exerciseId": "ex-07", "order": 3, "sets": 4, "reps": "12-15", "loadSuggestion": "10kg cada halter", "restSeconds": 60 },
          { "exerciseId": "ex-04", "order": 4, "sets": 3, "reps": "12", "loadSuggestion": "20kg", "restSeconds": 60 }
        ]
      },
      {
        "id": "pw-02",
        "studentId": "std-01",
        "professionalId": "prof-01",
        "title": "Treino B - Costas e Bíceps",
        "scheduledDate": "2026-06-04",
        "status": "completed",
        "estimatedDurationMinutes": 60,
        "exercises": [
          { "exerciseId": "ex-14", "order": 1, "sets": 4, "reps": "10-12", "loadSuggestion": "50kg", "restSeconds": 75 },
          { "exerciseId": "ex-13", "order": 2, "sets": 3, "reps": "8-10", "loadSuggestion": "40kg", "restSeconds": 90 },
          { "exerciseId": "ex-15", "order": 3, "sets": 4, "reps": "10", "loadSuggestion": "25kg", "restSeconds": 60 }
        ]
      }
    ],
    workoutEvents: [],
    feedbacks: [],
    assessments: [],
    payments: []
  },

  async loadData() {
    const fetchJson = async (filename) => {
      const response = await fetch(`./assets/data/${filename}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    };

    const datasets = [
      { key: 'users', file: 'users.json' },
      { key: 'professionals', file: 'professionals.json' },
      { key: 'students', file: 'students.json' },
      { key: 'exercises', file: 'exercises.json' },
      { key: 'workoutTemplates', file: 'workout-templates.json' },
      { key: 'prescribedWorkouts', file: 'prescribed-workouts.json' },
      { key: 'workoutEvents', file: 'workout-events.json' },
      { key: 'feedbacks', file: 'feedbacks.json' },
      { key: 'assessments', file: 'assessments.json' },
      { key: 'payments', file: 'payments.json' }
    ];

    console.log('[DataStore] Loading synthetic fixtures...');

    for (const item of datasets) {
      try {
        const result = await fetchJson(item.file);
        this.data[item.key] = result;
        console.log(`[DataStore] Loaded ${item.key} from network/disk.`);
      } catch (err) {
        console.warn(`[DataStore] Failed to load ${item.file} via fetch, utilizing inline fallback.`, err);
        // If users or exercises or others are not loaded, we keep the inline fallback
        if (!this.data[item.key] || (Array.isArray(this.data[item.key]) && this.data[item.key].length === 0)) {
          this.data[item.key] = this.fallbacks[item.key] || [];
        }
      }
    }

    this.loadedFromNetwork = true;
    return this.data;
  },

  getCurrentUser() {
    const saved = sessionStorage.getItem('personalops_session');
    return saved ? JSON.parse(saved) : null;
  },

  getStudentsByProfessional(profId) {
    return this.data.students.filter(s => s.professionalId === profId);
  },

  getWorkoutsByStudent(studentId) {
    return this.data.prescribedWorkouts.filter(w => w.studentId === studentId);
  },

  getTodayWorkout(studentId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const workouts = this.getWorkoutsByStudent(studentId);

    // 1. Try to find a pending workout scheduled for today
    let w = workouts.find(work => work.scheduledDate === todayStr && work.status === 'pending');
    if (w) return w;

    // 2. Try to find any pending workout
    w = workouts.find(work => work.status === 'pending');
    if (w) return w;

    // 3. Fallback to the last workout
    return workouts[workouts.length - 1] || null;
  },

  getFeedbacksByProfessional(profId) {
    const students = this.getStudentsByProfessional(profId);
    const studentIds = students.map(s => s.id);
    return this.data.feedbacks.filter(f => studentIds.includes(f.studentId));
  },

  getOfflineQueue() {
    try {
      return JSON.parse(localStorage.getItem('personalops_queue') || '[]');
    } catch {
      return [];
    }
  },

  saveOfflineEvent(event) {
    try {
      const queue = this.getOfflineQueue();
      queue.push({
        ...event,
        id: event.id || `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: event.createdAt || new Date().toISOString()
      });
      localStorage.setItem('personalops_queue', JSON.stringify(queue));
      console.log('[DataStore] Offline event saved locally.', event);
    } catch (err) {
      console.error('[DataStore] Failed to save offline event.', err);
    }
  }
};
