/* =========================================================================
   PersonalOps — Data Store Layer V1.2
   Static synthetic fixtures with inline fallback for GitHub Pages/file usage.
   ========================================================================= */

'use strict';

window.DataStore = {
  data: {
    users: {},
    professionals: [],
    students: [],
    plans: [],
    subscriptions: [],
    invoices: [],
    paymentEvents: [],
    notificationRules: [],
    notificationEvents: [],
    exercises: [],
    workoutLibrary: [],
    workoutTemplates: [],
    weeklySchedules: [],
    prescribedWorkouts: [],
    workoutEvents: [],
    feedbacks: [],
    assessments: [],
    voiceDrafts: []
  },

  loadedFromNetwork: false,

  fallbacks: {
    users: {
      'admin@personalops.test': {
        id: 'usr-admin-01',
        name: 'Admin PersonalOps',
        email: 'admin@personalops.test',
        password: 'admin123',
        role: 'admin',
        roleLabel: 'Administrativo',
        avatar: 'A',
        admin: true
      },
      'professor@personalops.test': {
        id: 'usr-prof-01',
        name: 'Prof. Silva',
        email: 'professor@personalops.test',
        password: 'prof123',
        role: 'professor',
        roleLabel: 'Professor',
        avatar: 'S',
        professionalId: 'prof-01'
      },
      'aluno@personalops.test': {
        id: 'usr-student-01',
        name: 'Carlos Mendes',
        email: 'aluno@personalops.test',
        password: 'aluno123',
        role: 'aluno',
        roleLabel: 'Aluno',
        avatar: 'C',
        studentId: 'std-01'
      }
    },
    professionals: [
      {
        id: 'prof-01',
        name: 'Prof. Silva',
        displayName: 'Prof. Silva',
        financialProfile: {
          documentType: 'cpf',
          documentMasked: '***.***.123-**',
          pixKeyType: 'email',
          pixKeyMasked: 'prof***@email.com',
          bankName: 'Banco Exemplo',
          accountHolderName: 'Professor Demo Silva',
          defaultBillingFrequency: 'monthly',
          defaultReminderDays: [7, 3, 1, 0, -1, -3, -7],
          paymentProvider: 'pix-manual-mock',
          futureProviders: ['future-asaas', 'future-mercadopago', 'future-pagarme', 'future-open-finance']
        }
      }
    ],
    students: [
      {
        id: 'std-01',
        professionalId: 'prof-01',
        name: 'Carlos Mendes',
        goal: 'Hipertrofia muscular',
        trainingMode: 'hibrido',
        level: 'intermediario',
        adherenceStatus: 'Alta',
        riskLevel: 'low',
        restrictions: ['Leve desconforto no ombro esquerdo'],
        planId: 'plan-01',
        subscriptionId: 'sub-01',
        billingFrequency: 'monthly',
        nextDueDate: '2026-06-18',
        paymentStatus: 'active',
        reminderOptIn: true,
        preferredReminderChannel: 'whatsapp-mock',
        weeklyScheduleId: 'ws-01',
        notes: 'Fallback sintético.'
      }
    ],
    plans: [
      {
        id: 'plan-01',
        professionalId: 'prof-01',
        name: 'Consultoria mensal',
        description: 'Treino mensal com check-in semanal',
        frequency: 'monthly',
        amount: 249.9,
        currency: 'BRL',
        includes: ['Treino mensal', 'Check-in semanal'],
        isActive: true
      }
    ],
    invoices: [
      {
        id: 'inv-0001',
        subscriptionId: 'sub-01',
        studentId: 'std-01',
        professionalId: 'prof-01',
        dueDate: '2026-06-18',
        amount: 249.9,
        status: 'open',
        paymentMethod: 'pix',
        paymentMethods: ['pix', 'manual'],
        pixQrCodeMock: 'PIX-QR-DEMO-0001',
        pixCopyPasteMock: 'personalops-demo-pix-copy-paste-invoice-0001',
        paymentLinkMock: 'https://personalops.test/pay/mock/invoice-0001',
        createdAt: '2026-06-01T09:00:00-03:00',
        paidAt: null,
        reminderStatus: 'scheduled'
      }
    ],
    exercises: [
      {
        id: 'ex-01',
        name: 'Supino Reto com Barra',
        category: 'peito',
        primaryMuscle: 'peito',
        secondaryMuscles: ['triceps', 'ombros'],
        equipment: 'Barra e banco',
        difficulty: 'intermediario',
        movementPattern: 'empurrar',
        defaultRestSeconds: 90,
        defaultTempo: '3-0-1-0',
        coachingCues: ['Controle a descida.', 'Mantenha as escapulas firmes.'],
        commonMistakes: ['Usar carga acima da tecnica.'],
        safetyNotes: 'Exercicio demonstrativo.',
        substitutionIds: [],
        visualType: 'css-mannequin',
        visualStatus: 'placeholder'
      }
    ],
    prescribedWorkouts: [
      {
        id: 'pw-01-wednesday',
        sourceLibraryWorkoutId: 'lib-01',
        studentId: 'std-01',
        professionalId: 'prof-01',
        title: 'Peito + Biceps',
        scheduledDay: 'wednesday',
        scheduledDate: '2026-06-10',
        status: 'active',
        estimatedDurationMinutes: 60,
        exercises: [
          { exerciseId: 'ex-01', order: 1, sets: 4, reps: '8-10', loadSuggestion: 'Carga moderada', restSeconds: 90, notes: 'Fallback sintético.' }
        ]
      }
    ],
    weeklySchedules: [
      {
        id: 'ws-01',
        studentId: 'std-01',
        professionalId: 'prof-01',
        weekStartsOn: '2026-06-08',
        days: {
          sunday: { type: 'rest', title: 'Descanso', notes: 'Fallback.' },
          monday: { type: 'workout', workoutId: 'pw-01-monday', title: 'Peito + Biceps', notes: 'Fallback.' },
          tuesday: { type: 'cardio', title: 'Cardio leve', notes: 'Fallback.' },
          wednesday: { type: 'workout', workoutId: 'pw-01-wednesday', title: 'Peito + Biceps', notes: 'Fallback.' },
          thursday: { type: 'checkin', title: 'Check-in', notes: 'Fallback.' },
          friday: { type: 'workout', workoutId: 'pw-01-friday', title: 'Costas + Triceps', notes: 'Fallback.' },
          saturday: { type: 'assessment', title: 'Mobilidade', notes: 'Fallback.' }
        }
      }
    ]
  },

  datasets: [
    ['users', 'users.json'],
    ['professionals', 'professionals.json'],
    ['students', 'students.json'],
    ['plans', 'plans.json'],
    ['subscriptions', 'subscriptions.json'],
    ['invoices', 'invoices.json'],
    ['paymentEvents', 'payment-events.json'],
    ['notificationRules', 'notification-rules.json'],
    ['notificationEvents', 'notification-events.json'],
    ['exercises', 'exercises.json'],
    ['workoutLibrary', 'workout-library.json'],
    ['workoutTemplates', 'workout-templates.json'],
    ['weeklySchedules', 'weekly-schedules.json'],
    ['prescribedWorkouts', 'prescribed-workouts.json'],
    ['workoutEvents', 'workout-events.json'],
    ['feedbacks', 'feedbacks.json'],
    ['assessments', 'assessments.json'],
    ['voiceDrafts', 'voice-drafts.json']
  ],

  async loadData() {
    let allLoaded = true;

    for (const [key, file] of this.datasets) {
      try {
        const response = await fetch(`./assets/data/${file}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        this.data[key] = key === 'users' ? this.normalizeUsers(result) : result;
      } catch (error) {
        allLoaded = false;
        console.warn(`[DataStore] Failed to load ${file}; using fallback/default.`, error);
        this.data[key] = this.fallbacks[key] || (key === 'users' ? {} : []);
      }
    }

    this.loadedFromNetwork = allLoaded;
    return this.data;
  },

  normalizeUsers(users) {
    if (!Array.isArray(users)) return users || {};
    return users.reduce((acc, user) => {
      acc[user.email] = user;
      return acc;
    }, {});
  },

  getCurrentUser() {
    try {
      const saved = sessionStorage.getItem('personalops_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  getUsers() {
    return Object.values(this.data.users || {});
  },

  getProfessionals() {
    return this.data.professionals;
  },

  getProfessionalById(professionalId) {
    return this.data.professionals.find(professional => professional.id === professionalId) || null;
  },

  getStudentsByProfessional(professionalId) {
    return this.data.students.filter(student => student.professionalId === professionalId);
  },

  getStudentById(studentId) {
    return this.data.students.find(student => student.id === studentId) || null;
  },

  getPlansByProfessional(professionalId) {
    return this.data.plans.filter(plan => plan.professionalId === professionalId);
  },

  getSubscriptionsByProfessional(professionalId) {
    return this.data.subscriptions.filter(subscription => subscription.professionalId === professionalId);
  },

  getInvoicesByProfessional(professionalId) {
    return this.data.invoices.filter(invoice => invoice.professionalId === professionalId);
  },

  getInvoicesByStudent(studentId) {
    return this.data.invoices.filter(invoice => invoice.studentId === studentId);
  },

  getOverdueInvoices(professionalId) {
    return this.getInvoicesByProfessional(professionalId).filter(invoice => invoice.status === 'overdue');
  },

  getUpcomingInvoices(professionalId) {
    return this.getInvoicesByProfessional(professionalId).filter(invoice => ['scheduled', 'open', 'due_soon'].includes(invoice.status));
  },

  getNotificationRules() {
    return this.data.notificationRules;
  },

  getNotificationEvents(professionalId) {
    const studentIds = this.getStudentsByProfessional(professionalId).map(student => student.id);
    return this.data.notificationEvents.filter(event => studentIds.includes(event.studentId));
  },

  getWorkoutLibrary(professionalId) {
    return this.data.workoutLibrary.filter(workout => workout.professionalId === professionalId || workout.isSystemTemplate);
  },

  getWeeklyScheduleByStudent(studentId) {
    return this.data.weeklySchedules.find(schedule => schedule.studentId === studentId) || null;
  },

  getWorkoutsByStudent(studentId) {
    return this.data.prescribedWorkouts.filter(workout => workout.studentId === studentId);
  },

  getTodayWorkout(studentId) {
    const today = new Date().toISOString().split('T')[0];
    const workouts = this.getWorkoutsByStudent(studentId);
    return workouts.find(workout => workout.scheduledDate === today && ['active', 'published'].includes(workout.status))
      || workouts.find(workout => ['active', 'published'].includes(workout.status))
      || workouts[0]
      || null;
  },

  getExercises() {
    return this.data.exercises;
  },

  getExerciseById(exerciseId) {
    return this.data.exercises.find(exercise => exercise.id === exerciseId) || null;
  },

  getFeedbacksByProfessional(professionalId) {
    const studentIds = this.getStudentsByProfessional(professionalId).map(student => student.id);
    return this.data.feedbacks.filter(feedback => studentIds.includes(feedback.studentId));
  },

  getAssessmentsByStudent(studentId) {
    return this.data.assessments.filter(assessment => assessment.studentId === studentId);
  },

  cloneWorkoutMock(sourceWorkoutId, targetStudentId) {
    const targetStudent = this.getStudentById(targetStudentId);
    if (!targetStudent) throw new Error('Aluno de destino não encontrado.');

    const sourcePrescribed = this.data.prescribedWorkouts.find(workout => workout.id === sourceWorkoutId);
    const sourceLibrary = this.data.workoutLibrary.find(workout => workout.id === sourceWorkoutId);
    if (!sourcePrescribed && !sourceLibrary) throw new Error('Treino de origem não encontrado.');

    const sourceExercises = sourcePrescribed
      ? sourcePrescribed.exercises
      : (sourceLibrary.exerciseBlocks[0] ? sourceLibrary.exerciseBlocks[0].exercises : []);

    const cloned = {
      id: `pw-clone-${Date.now()}`,
      sourceLibraryWorkoutId: sourcePrescribed ? sourcePrescribed.sourceLibraryWorkoutId : sourceLibrary.id,
      clonedFromStudentId: sourcePrescribed ? sourcePrescribed.studentId : null,
      studentId: targetStudentId,
      professionalId: targetStudent.professionalId,
      title: `${sourcePrescribed ? sourcePrescribed.title : sourceLibrary.name} (clone mock)`,
      scheduledDay: 'friday',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      estimatedDurationMinutes: sourcePrescribed ? sourcePrescribed.estimatedDurationMinutes : sourceLibrary.estimatedDurationMinutes,
      exercises: sourceExercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        order: index + 1,
        sets: exercise.sets,
        reps: exercise.reps,
        loadSuggestion: exercise.loadSuggestion,
        restSeconds: exercise.restSeconds,
        notes: exercise.notes || 'Clone local demonstrativo.'
      }))
    };

    this.data.prescribedWorkouts.unshift(cloned);
    this.saveOfflineEvent({
      type: 'workout_cloned_mock',
      studentId: targetStudentId,
      workoutId: cloned.id,
      payload: { sourceWorkoutId, targetStudentId },
      syncStatus: 'sync_pending',
      offline: !navigator.onLine
    });

    return cloned;
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
        id: event.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: event.createdAt || new Date().toISOString()
      });
      localStorage.setItem('personalops_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('[DataStore] Failed to save offline event.', error);
    }
  }
};
