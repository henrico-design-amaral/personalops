const fs = require('fs');
const path = require('path');

const root = process.cwd();
const dataDir = path.join(root, 'assets', 'data');

const readJson = name => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
const writeJson = (name, value) => {
  fs.writeFileSync(path.join(dataDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const pad = value => String(value).padStart(2, '0');

const students = readJson('students.json');
const professionals = readJson('professionals.json');
const prescribedWorkouts = readJson('prescribed-workouts.json');
const exercises = readJson('exercises.json');
const workoutLibrary = readJson('workout-library.json');
const invoices = readJson('invoices.json');
const notificationEvents = readJson('notification-events.json');
const workoutEvents = readJson('workout-events.json');
const feedbacks = readJson('feedbacks.json');

const eventCycle = [
  'workout_scheduled',
  'workout_started',
  'workout_completed',
  'workout_missed',
  'workout_rescheduled',
  'checkin_submitted',
  'no_show',
  'late_start'
];

const attendanceEvents = students.flatMap((student, studentIndex) => {
  const workouts = prescribedWorkouts.filter(workout => workout.studentId === student.id).slice(0, 3);
  return workouts.flatMap((workout, workoutIndex) => {
    const baseDate = workout.scheduledDate || `2026-06-${pad(8 + workoutIndex)}`;
    const eventType = eventCycle[(studentIndex + workoutIndex) % eventCycle.length];
    const events = [{
      id: `att-${pad(studentIndex + 1)}-${pad(workoutIndex + 1)}-scheduled`,
      studentId: student.id,
      professionalId: student.professionalId,
      workoutId: workout.id,
      scheduledDate: baseDate,
      eventType: 'workout_scheduled',
      createdAt: `${baseDate}T06:30:00-03:00`,
      source: 'fixture',
      notes: 'Agenda sintetica para validacao de frequencia.'
    }];

    events.push({
      id: `att-${pad(studentIndex + 1)}-${pad(workoutIndex + 1)}-${eventType}`,
      studentId: student.id,
      professionalId: student.professionalId,
      workoutId: workout.id,
      scheduledDate: baseDate,
      eventType,
      createdAt: `${baseDate}T07:${pad(10 + studentIndex)}:00-03:00`,
      source: eventType === 'workout_completed' || eventType === 'workout_started' ? 'student-app-mock' : 'system-mock',
      notes: eventType === 'workout_missed' || eventType === 'no_show'
        ? 'Falta sintetica para alerta de adesao.'
        : 'Evento sintetico de acompanhamento quase em tempo real.'
    });

    return events;
  });
});

const progressSnapshots = students.map((student, index) => {
  const completed = 6 + (index % 7);
  const missed = index % 4;
  const adherenceRate = Math.round((completed / Math.max(1, completed + missed)) * 100);
  const ratingBase = Math.max(2.4, 4.8 - (missed * 0.4) - (student.riskLevel === 'high' ? 0.7 : 0));
  return {
    id: `prog-${pad(index + 1)}`,
    studentId: student.id,
    professionalId: student.professionalId,
    date: '2026-06-10',
    adherenceRate,
    completedWorkouts: completed,
    missedWorkouts: missed,
    averageWorkoutRating: Number(ratingBase.toFixed(1)),
    averageRpe: Number((6.4 + (index % 4) * 0.5).toFixed(1)),
    totalVolumeMock: 8200 + index * 740,
    weightMock: Number((62 + index * 1.8).toFixed(1)),
    bodyFatPercentageMock: Number((28 - (index % 8) * 1.1).toFixed(1)),
    leanMassMock: Number((42 + index * 1.15).toFixed(1)),
    fatMassMock: Number((18 - (index % 6) * 0.7).toFixed(1)),
    bodyWaterPercentageMock: Number((48 + (index % 7) * 1.2).toFixed(1)),
    bmiMock: Number((22 + (index % 6) * 0.7).toFixed(1)),
    bodyTrend: index % 3 === 0 ? 'descendo' : index % 3 === 1 ? 'estavel' : 'subindo',
    strengthTrend: index % 4 === 0 ? 'precisa de ajuste' : 'evoluindo bem',
    notes: 'Snapshot sintetico. Bioimpedancia e progresso sao demonstrativos.'
  };
});

const feedbackScenarios = [
  ['Treino excelente, consegui aumentar a carga mantendo tecnica.', 5, 'moderado', 'completo', false, '', 'bem'],
  ['Treino mediano, senti dificuldade no ultimo exercicio.', 3, 'pesado', 'parcial', false, '', 'cansado'],
  ['Treino ruim, senti dor leve no joelho.', 2, 'muito_pesado', 'parcial', true, 'joelho', 'cansado'],
  ['Equipamento indisponivel, precisei adaptar.', 3, 'moderado', 'parcial', false, '', 'normal'],
  ['Treino muito longo para hoje.', 2, 'pesado', 'parcial', false, '', 'desmotivado'],
  ['Estou evoluindo bem e o descanso ajudou.', 5, 'moderado', 'completo', false, '', 'bem'],
  ['Fiquei em duvida sobre a carga do supino.', 3, 'moderado', 'completo', false, '', 'normal'],
  ['Quero substituir a remada porque a maquina estava ocupada.', 3, 'moderado', 'parcial', false, '', 'normal'],
  ['Nao consegui completar por cansaco.', 2, 'muito_pesado', 'nao_consegui', false, '', 'cansado'],
  ['Senti dor leve no ombro e parei antes do fim.', 1, 'pesado', 'nao_consegui', true, 'ombro', 'cansado']
];

const postWorkoutFeedbacks = Array.from({ length: 30 }, (_, index) => {
  const student = students[index % students.length];
  const workout = prescribedWorkouts.find(item => item.studentId === student.id) || prescribedWorkouts[0];
  const scenario = feedbackScenarios[index % feedbackScenarios.length];
  const [comment, workoutRating, perceivedEffort, completionStatus, painReported, painLocation, mood] = scenario;
  const requiresReview = workoutRating <= 2 || painReported || completionStatus !== 'completo' || comment.toLowerCase().includes('duvida');
  return {
    id: `pwfb-${pad(index + 1)}`,
    studentId: student.id,
    professionalId: student.professionalId,
    workoutId: workout.id,
    workoutRating,
    perceivedEffort,
    completionStatus,
    painReported,
    painLocation: painLocation || null,
    mood,
    comment,
    requiresReview,
    createdAt: `2026-06-${pad(1 + (index % 10))}T${pad(8 + (index % 10))}:45:00-03:00`,
    professorNoteMock: requiresReview ? 'Professor deve revisar carga, dor ou aderencia antes do proximo treino.' : 'Sem acao imediata.'
  };
});

const criticalFeedbacks = postWorkoutFeedbacks.filter(item => item.requiresReview);
const completedWorkoutsThisWeek = attendanceEvents.filter(item => item.eventType === 'workout_completed').length;
const missedWorkoutsThisWeek = attendanceEvents.filter(item => ['workout_missed', 'no_show'].includes(item.eventType)).length;
const offlineEventsPending = workoutEvents.filter(item => item.syncStatus === 'sync_pending').length;
const platformMetrics = {
  totalProfessionals: professionals.length,
  activeProfessionals: professionals.filter(item => item.activeStudentsCount > 0).length,
  totalStudents: students.length,
  activeStudents: students.filter(item => !['paused', 'canceled'].includes(item.paymentStatus)).length,
  lowAdherenceStudents: progressSnapshots.filter(item => item.adherenceRate < 70).length,
  workoutsThisWeek: attendanceEvents.filter(item => item.eventType === 'workout_scheduled').length,
  completedWorkoutsThisWeek,
  missedWorkoutsThisWeek,
  feedbacksThisWeek: postWorkoutFeedbacks.length,
  criticalFeedbacks: criticalFeedbacks.length,
  openInvoices: invoices.filter(item => ['open', 'due_soon'].includes(item.status)).length,
  overdueInvoices: invoices.filter(item => item.status === 'overdue').length,
  scheduledNotifications: notificationEvents.filter(item => item.status === 'scheduled').length,
  offlineEventsPending,
  exercisesRegistered: exercises.length,
  workoutsInLibrary: workoutLibrary.length,
  mediaAssetsPending: exercises.filter(item => item.visualStatus !== 'placeholder').length,
  mostUsedExercises: exercises.slice(0, 6).map((exercise, index) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    usesThisWeek: 42 - index * 4
  })),
  mostClonedWorkouts: workoutLibrary.slice(0, 6).map((workout, index) => ({
    workoutId: workout.id,
    name: workout.name,
    clonesThisWeek: 18 - index * 2
  })),
  systemHealthMock: {
    staticHosting: 'ok',
    serviceWorkerCache: 'personalops-v1-cache-006',
    jsonFixtures: 'ok',
    auth: 'mocked-client-only',
    paymentGateway: 'pix-manual-mock',
    whatsapp: 'not-implemented',
    openFinance: 'not-implemented'
  },
  logsMock: [
    { id: 'log-001', level: 'info', message: 'Service worker cache atualizado para fixtures V1.3.', createdAt: '2026-06-10T09:00:00-03:00' },
    { id: 'log-002', level: 'warn', message: '5 midias de exercicio aguardam ativo proprio ou licenca.', createdAt: '2026-06-10T09:15:00-03:00' },
    { id: 'log-003', level: 'info', message: 'Feedback pos-treino salvo em fila local mockada.', createdAt: '2026-06-10T09:40:00-03:00' }
  ]
};

const enrichedAssessments = readJson('assessments.json').map((assessment, index) => ({
  ...assessment,
  physicalEvaluationMock: {
    heightCmMock: 164 + (index % 12),
    weightKgMock: progressSnapshots[index] ? progressSnapshots[index].weightMock : 72,
    bmiMock: progressSnapshots[index] ? progressSnapshots[index].bmiMock : 24.1,
    measuresMock: {
      chestCm: 88 + index,
      waistCm: 74 + index,
      hipCm: 96 + index,
      thighCm: 52 + (index % 6)
    },
    professorNotes: 'Avaliacao fisica demonstrativa. Nao usar como dado clinico real.'
  },
  bioimpedanceMock: {
    bodyFatPercentageMock: progressSnapshots[index] ? progressSnapshots[index].bodyFatPercentageMock : 22,
    leanMassMock: progressSnapshots[index] ? progressSnapshots[index].leanMassMock : 48,
    fatMassMock: progressSnapshots[index] ? progressSnapshots[index].fatMassMock : 16,
    bodyWaterPercentageMock: progressSnapshots[index] ? progressSnapshots[index].bodyWaterPercentageMock : 52,
    lastAssessmentDate: '2026-06-01',
    trend: progressSnapshots[index] ? progressSnapshots[index].bodyTrend : 'estavel'
  }
}));

writeJson('attendance-events.json', attendanceEvents);
writeJson('progress-snapshots.json', progressSnapshots);
writeJson('post-workout-feedbacks.json', postWorkoutFeedbacks);
writeJson('platform-metrics.json', platformMetrics);
writeJson('assessments.json', enrichedAssessments);

console.log(JSON.stringify({
  attendanceEvents: attendanceEvents.length,
  progressSnapshots: progressSnapshots.length,
  postWorkoutFeedbacks: postWorkoutFeedbacks.length,
  criticalFeedbacks: criticalFeedbacks.length
}, null, 2));
