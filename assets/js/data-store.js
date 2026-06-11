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
    voiceDrafts: [],
    attendanceEvents: [],
    progressSnapshots: [],
    postWorkoutFeedbacks: [],
    platformMetrics: {}
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
    ],
    attendanceEvents: [],
    progressSnapshots: [],
    postWorkoutFeedbacks: [],
    platformMetrics: {
      totalProfessionals: 1,
      activeProfessionals: 1,
      totalStudents: 1,
      activeStudents: 1,
      lowAdherenceStudents: 0,
      workoutsThisWeek: 1,
      completedWorkoutsThisWeek: 0,
      missedWorkoutsThisWeek: 0,
      feedbacksThisWeek: 0,
      criticalFeedbacks: 0,
      openInvoices: 1,
      overdueInvoices: 0,
      scheduledNotifications: 0,
      offlineEventsPending: 0,
      exercisesRegistered: 1,
      workoutsInLibrary: 0,
      mediaAssetsPending: 0,
      mostUsedExercises: [],
      mostClonedWorkouts: [],
      systemHealthMock: {
        staticHosting: 'ok',
        serviceWorkerCache: 'personalops-v1-cache-006',
        auth: 'mocked-client-only',
        paymentGateway: 'pix-manual-mock'
      },
      logsMock: []
    }
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
    ['voiceDrafts', 'voice-drafts.json'],
    ['attendanceEvents', 'attendance-events.json'],
    ['progressSnapshots', 'progress-snapshots.json'],
    ['postWorkoutFeedbacks', 'post-workout-feedbacks.json'],
    ['platformMetrics', 'platform-metrics.json']
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

  getAttendanceByStudent(studentId) {
    return this.data.attendanceEvents.filter(event => event.studentId === studentId);
  },

  getAttendanceByProfessional(professionalId) {
    return this.data.attendanceEvents.filter(event => event.professionalId === professionalId);
  },

  getProgressSnapshotsByStudent(studentId) {
    return this.data.progressSnapshots
      .filter(snapshot => snapshot.studentId === studentId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getProgressSummaryByStudent(studentId) {
    const snapshots = this.getProgressSnapshotsByStudent(studentId);
    const latest = snapshots[0] || null;
    const attendance = this.getAttendanceByStudent(studentId);
    const postFeedbacks = this.getPostWorkoutFeedbacksByStudent(studentId);
    const ratings = postFeedbacks.map(feedback => Number(feedback.workoutRating || 0)).filter(Boolean);
    const averageRating = ratings.length
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : latest ? latest.averageWorkoutRating : 0;

    return {
      latest,
      adherenceRate: latest ? latest.adherenceRate : this.getWorkoutCompletionRate(studentId),
      completedWorkouts: latest ? latest.completedWorkouts : attendance.filter(event => event.eventType === 'workout_completed').length,
      missedWorkouts: latest ? latest.missedWorkouts : attendance.filter(event => ['workout_missed', 'no_show'].includes(event.eventType)).length,
      averageWorkoutRating: Number(averageRating.toFixed(1)),
      lastActivity: attendance.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null,
      lastFeedback: postFeedbacks[0] || null
    };
  },

  getPostWorkoutFeedbacksByStudent(studentId) {
    return this.data.postWorkoutFeedbacks
      .filter(feedback => feedback.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getCriticalFeedbacksByProfessional(professionalId) {
    return this.data.postWorkoutFeedbacks
      .filter(feedback => feedback.professionalId === professionalId && feedback.requiresReview)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getWorkoutCompletionRate(studentId) {
    const attendance = this.getAttendanceByStudent(studentId);
    const scheduled = attendance.filter(event => event.eventType === 'workout_scheduled').length;
    const completed = attendance.filter(event => event.eventType === 'workout_completed').length;
    if (!scheduled) return 0;
    return Math.round((completed / scheduled) * 100);
  },

  getStudentsAtRisk(professionalId) {
    return this.getStudentsByProfessional(professionalId).filter(student => {
      const summary = this.getProgressSummaryByStudent(student.id);
      const criticalFeedback = this.getPostWorkoutFeedbacksByStudent(student.id).some(feedback => feedback.requiresReview);
      return student.riskLevel === 'high'
        || summary.adherenceRate < 70
        || summary.missedWorkouts >= 2
        || criticalFeedback;
    });
  },

  getPlatformUsageMetrics() {
    const metrics = this.data.platformMetrics || {};
    return {
      ...metrics,
      totalProfessionals: metrics.totalProfessionals ?? this.data.professionals.length,
      totalStudents: metrics.totalStudents ?? this.data.students.length,
      activeStudents: metrics.activeStudents ?? this.data.students.filter(student => !['paused', 'canceled'].includes(student.paymentStatus)).length,
      exercisesRegistered: metrics.exercisesRegistered ?? this.data.exercises.length,
      workoutsInLibrary: metrics.workoutsInLibrary ?? this.data.workoutLibrary.length,
      offlineEventsPending: metrics.offlineEventsPending ?? this.getOfflineQueue().filter(event => event.syncStatus === 'sync_pending').length
    };
  },

  savePostWorkoutFeedback(feedback) {
    const enriched = {
      id: feedback.id || `pwfb-local-${Date.now()}`,
      ...feedback,
      requiresReview: feedback.requiresReview
        ?? (Number(feedback.workoutRating) <= 2
          || feedback.painReported
          || feedback.completionStatus !== 'completo'
          || String(feedback.comment || '').toLowerCase().includes('duvida')
          || String(feedback.comment || '').toLowerCase().includes('dúvida')),
      createdAt: feedback.createdAt || new Date().toISOString()
    };

    this.data.postWorkoutFeedbacks.unshift(enriched);
    this.saveOfflineEvent({
      type: 'post_workout_feedback_saved',
      studentId: enriched.studentId,
      workoutId: enriched.workoutId,
      payload: enriched,
      syncStatus: 'sync_pending',
      offline: !navigator.onLine
    });
    return enriched;
  },

  saveStudentFormMock(student) {
    const enriched = {
      id: student.id || `std-local-${Date.now()}`,
      professionalId: student.professionalId,
      name: student.name || 'Novo aluno mockado',
      goal: student.goal || 'Objetivo a definir',
      trainingMode: student.trainingMode || 'online',
      level: student.level || 'iniciante',
      adherenceStatus: 'Nova inscrição',
      riskLevel: 'low',
      lastWorkoutAt: null,
      nextWorkoutAt: null,
      restrictions: student.restrictions ? String(student.restrictions).split(',').map(item => item.trim()).filter(Boolean) : [],
      preferredGymContext: student.preferredGymContext || 'A definir',
      usesBluetooth: false,
      internetQuality: 'boa',
      notes: student.notes || 'Cadastro simulado em protótipo estático.',
      planId: student.planId || 'plan-01',
      subscriptionId: `sub-local-${Date.now()}`,
      billingFrequency: student.billingFrequency || 'monthly',
      nextDueDate: student.nextDueDate || new Date().toISOString().split('T')[0],
      paymentStatus: 'active',
      reminderOptIn: true,
      preferredReminderChannel: student.preferredReminderChannel || 'whatsapp-mock',
      weeklyScheduleId: `ws-local-${Date.now()}`
    };

    this.data.students.unshift(enriched);
    this.saveOfflineEvent({
      type: 'student_created_mock',
      studentId: enriched.id,
      payload: enriched,
      syncStatus: 'sync_pending',
      offline: !navigator.onLine
    });
    return enriched;
  },

  updateStudentFormMock(studentId, patch) {
    const index = this.data.students.findIndex(student => student.id === studentId);
    if (index < 0) throw new Error('Aluno não encontrado.');
    const updated = {
      ...this.data.students[index],
      ...patch,
      restrictions: patch.restrictions
        ? String(patch.restrictions).split(',').map(item => item.trim()).filter(Boolean)
        : this.data.students[index].restrictions
    };
    this.data.students[index] = updated;
    this.saveOfflineEvent({
      type: 'student_updated_mock',
      studentId,
      payload: patch,
      syncStatus: 'sync_pending',
      offline: !navigator.onLine
    });
    return updated;
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
