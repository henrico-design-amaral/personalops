/* ═══════════════════════════════════════════════════════════
   PersonalOps — App Logic V1
   Static prototype — auth and data are fully mocked
═══════════════════════════════════════════════════════════ */

'use strict';

// ── Data Store Integration ────────────────────────────────
// Credentials and Exercises are now managed by window.DataStore

// Helper to map exercise categories to body-figure SVG elements
const getBodyPartsForCategory = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('peito')) return ['fig-chest'];
  if (cat.includes('braço') || cat.includes('ombro') || cat.includes('tríceps') || cat.includes('bíceps')) {
    return ['fig-arm-l', 'fig-arm-r', 'fig-forearm-l', 'fig-forearm-r'];
  }
  if (cat.includes('costas')) return ['fig-chest']; // highlight back/torso
  if (cat.includes('perna') || cat.includes('panturrilha') || cat.includes('glúteo')) return ['fig-body']; // generic limbs
  return [];
};

// Helper to format ISO date strings for dashboard displays
const formatEventTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}h${pad(d.getMinutes())}`;
};

// ── Nav structure per role ────────────────────────────────
const NAV = {
  admin: [
    { id: 'admin-overview',    icon: '◈', label: 'Visão Geral' },
    { id: 'admin-users',       icon: '◉', label: 'Usuários' },
    { id: 'admin-hypotheses',  icon: '◎', label: 'Hipóteses' },
    { id: 'admin-settings',    icon: '⊕', label: 'Configurações' },
  ],
  professor: [
    { id: 'prof-overview',       icon: '◈', label: 'Visão Geral' },
    { id: 'prof-alunos',         icon: '◉', label: 'Alunos' },
    { id: 'prof-criar-treino',   icon: '✦', label: 'Criar Treino' },
    { id: 'prof-feedbacks',      icon: '◎', label: 'Feedbacks' },
  ],
  aluno: [
    { id: 'aluno-overview',     icon: '◈', label: 'Visão Geral' },
    { id: 'aluno-treino',       icon: '▶', label: 'Treino de Hoje' },
    { id: 'aluno-evolucao',     icon: '↑', label: 'Evolução' },
    { id: 'aluno-perfil',       icon: '◉', label: 'Perfil' },
  ],
};

// ── App state ─────────────────────────────────────────────
const state = {
  user: null,
  currentView: null,
  workout: {
    exerciseIndex: 0,
    currentSet: 1,
    registeredSets: [],
    exercises: [],
  },
  timer: {
    id: null,
    remaining: 0,
    total: 0,
  },
};

// ── DOM refs (resolved once on boot) ─────────────────────
const $ = id => document.getElementById(id);

const DOM = {
  screenLogin: $('screen-login'),
  screenApp:   $('screen-app'),
  formLogin:   $('form-login'),
  loginEmail:  $('login-email'),
  loginPass:   $('login-password'),
  loginError:  $('login-error'),
  btnLogout:   $('btn-logout'),
  btnMenu:     $('btn-menu'),
  sidebar:     $('sidebar'),
  overlay:     $('sidebar-overlay'),
  navList:     $('nav-list'),
  navAvatar:   $('nav-avatar'),
  navName:     $('nav-name'),
  navRole:     $('nav-role'),
  statusDot:   $('status-indicator'),
};

// ── Offline queue ─────────────────────────────────────────
const OfflineQueue = {
  KEY: 'personalops_queue',

  load() {
    return DataStore.getOfflineQueue();
  },

  save(queue) {
    localStorage.setItem(this.KEY, JSON.stringify(queue));
  },

  push(event) {
    const isOffline = !navigator.onLine;
    const enrichedEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentId: state.user ? (state.user.studentId || 'std-01') : 'std-01',
      workoutId: state.workout.exerciseIndex !== undefined && state.workout.exercises[state.workout.exerciseIndex]
        ? `pw-01` // Mocking link to current active workout id
        : null,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      offline: isOffline,
      syncStatus: isOffline ? 'sync_pending' : 'sync_completed'
    };
    
    DataStore.saveOfflineEvent(enrichedEvent);
    DataStore.data.workoutEvents.push(enrichedEvent);
    App.updateOfflineUI();
  },

  flush() {
    const queue = this.load();
    const pending = queue.filter(e => e.offline || e.syncStatus === 'sync_pending');
    if (pending.length === 0) return;
    
    const synced = queue.map(e => {
      if (e.offline || e.syncStatus === 'sync_pending') {
        return { ...e, offline: false, syncStatus: 'sync_completed' };
      }
      return e;
    });
    this.save(synced);
    
    DataStore.data.workoutEvents.forEach(e => {
      if (e.syncStatus === 'sync_pending') {
        e.syncStatus = 'sync_completed';
        e.offline = false;
      }
    });

    App.updateOfflineUI();
    console.info(`[PersonalOps] Synced ${pending.length} offline event(s)`);
  },

  pendingCount() {
    return this.load().filter(e => e.offline || e.syncStatus === 'sync_pending').length;
  },
};

// ── App ───────────────────────────────────────────────────
const App = {

  // ── Boot ──────────────────────────────────────────────
  async init() {
    // Load dynamic synthetic fixtures
    await DataStore.loadData();

    this.bindLogin();
    this.bindDemoPills();
    this.bindLogout();
    this.bindMenu();
    this.bindOnlineStatus();
    this.bindWorkoutMode();
    this.bindTreinoCreator();

    // Trigger initial offline queue sync if online
    if (navigator.onLine) {
      OfflineQueue.flush();
    }

    const saved = sessionStorage.getItem('personalops_session');
    if (saved) {
      try {
        state.user = JSON.parse(saved);
        this.enterApp();
      } catch {
        sessionStorage.removeItem('personalops_session');
      }
    }
  },

  // ── Auth ───────────────────────────────────────────────
  bindLogin() {
    DOM.formLogin.addEventListener('submit', e => {
      e.preventDefault();
      const email = DOM.loginEmail.value.trim().toLowerCase();
      const pass  = DOM.loginPass.value;
      const user  = DataStore.data.users[email];

      if (!user || user.password !== pass) {
        DOM.loginError.classList.remove('hidden');
        DOM.loginEmail.focus();
        return;
      }

      DOM.loginError.classList.add('hidden');
      state.user = { 
        email, 
        role: user.role, 
        name: user.name, 
        avatar: user.avatar,
        admin: user.admin || false,
        professionalId: user.professionalId || null,
        studentId: user.studentId || null
      };
      sessionStorage.setItem('personalops_session', JSON.stringify(state.user));
      this.enterApp();
    });
  },

  bindDemoPills() {
    document.querySelectorAll('.demo-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.loginEmail.value = pill.dataset.email;
        DOM.loginPass.value  = pill.dataset.pass;
        DOM.loginError.classList.add('hidden');
        DOM.formLogin.dispatchEvent(new Event('submit'));
      });
    });
  },

  bindLogout() {
    DOM.btnLogout.addEventListener('click', () => this.logout());
  },

  logout() {
    this.stopTimer();
    state.user = null;
    sessionStorage.removeItem('personalops_session');
    DOM.screenApp.classList.add('hidden');
    DOM.screenLogin.classList.remove('hidden');
    DOM.loginEmail.value = '';
    DOM.loginPass.value  = '';
  },

  // ── App enter ─────────────────────────────────────────
  enterApp() {
    const { role, name, avatar, studentId } = state.user;

    DOM.navAvatar.textContent = avatar;
    DOM.navName.textContent   = name;
    DOM.navRole.textContent   = role.charAt(0).toUpperCase() + role.slice(1);

    this.buildNav(role);

    // Preload student exercises for workout tracking
    if (role === 'aluno' && studentId) {
      const todayWorkout = DataStore.getTodayWorkout(studentId);
      if (todayWorkout) {
        state.workout.exercises = todayWorkout.exercises.map(we => {
          const originalEx = DataStore.data.exercises.find(e => e.id === we.exerciseId);
          return {
            id: we.exerciseId,
            name: originalEx ? originalEx.name : 'Exercício',
            sets: we.sets,
            reps: we.reps,
            rest: we.restSeconds || (originalEx ? originalEx.defaultRestSeconds : 60),
            loadSuggestion: we.loadSuggestion || 'Ajustável',
            muscle: originalEx ? originalEx.primaryMuscle : 'Geral',
            active: originalEx ? getBodyPartsForCategory(originalEx.category) : [],
            tempo: originalEx ? originalEx.defaultTempo : '3-0-1-0',
            notes: we.notes || ''
          };
        });
      } else {
        state.workout.exercises = [];
      }
    }

    DOM.screenLogin.classList.add('hidden');
    DOM.screenApp.classList.remove('hidden');

    const defaultView = NAV[role][0].id;
    this.navigate(defaultView);
    this.updateOfflineUI();
  },

  // ── Navigation ────────────────────────────────────────
  buildNav(role) {
    DOM.navList.innerHTML = '';
    NAV[role].forEach(item => {
      const li = document.createElement('li');
      li.className = 'nav-item';
      li.dataset.view = item.id;
      li.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
      li.addEventListener('click', () => {
        this.navigate(item.id);
        this.closeSidebar();
      });
      DOM.navList.appendChild(li);
    });
  },

  navigate(viewId) {
    // Deactivate all views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    // Activate target view
    const target = $(`view-${viewId}`);
    if (target) {
      target.classList.add('active');
      state.currentView = viewId;
    }

    // Update nav highlight
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    // Render dynamic dashboard view
    this.renderView(viewId);
  },

  renderView(viewId) {
    if (!state.user) return;
    try {
      switch (viewId) {
        case 'admin-overview':
          this.renderAdminOverview();
          break;
        case 'admin-users':
          this.renderAdminUsers();
          break;
        case 'prof-overview':
          this.renderProfOverview();
          break;
        case 'prof-alunos':
          this.renderProfAlunos();
          break;
        case 'prof-feedbacks':
          this.renderProfFeedbacks();
          break;
        case 'aluno-overview':
          this.renderAlunoOverview();
          break;
        case 'aluno-treino':
          this.renderAlunoTreino();
          break;
        case 'aluno-perfil':
          this.renderAlunoPerfil();
          break;
        case 'aluno-evolucao':
          this.renderAlunoEvolucao();
          break;
      }
    } catch (e) {
      console.error('[PersonalOps] Error rendering view:', viewId, e);
    }
  },

  renderAdminOverview() {
    const stats = $('view-admin-overview').querySelectorAll('.stat-value');
    if (stats.length >= 4) {
      stats[0].textContent = Object.keys(DataStore.data.users).length;
      stats[1].textContent = DataStore.data.professionals.length;
      stats[2].textContent = DataStore.data.students.length;
      stats[3].textContent = DataStore.data.workoutEvents.filter(e => e.type === 'workout_finished').length;
    }
  },

  renderAdminUsers() {
    const tbody = $('view-admin-users').querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = Object.entries(DataStore.data.users).map(([email, user]) => {
        return `<tr>
          <td>${email}</td>
          <td><span class="role-badge ${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
          <td><span class="status-active">Ativo</span></td>
        </tr>`;
      }).join('');
    }
  },

  renderProfOverview() {
    const profId = state.user.professionalId;
    const students = DataStore.getStudentsByProfessional(profId);
    const studentIds = students.map(s => s.id);
    
    const subEl = $('view-prof-overview').querySelector('.page-sub');
    if (subEl) subEl.textContent = `Olá, ${state.user.name}. Resumo de hoje.`;

    const stats = $('view-prof-overview').querySelectorAll('.stat-value');
    if (stats.length >= 4) {
      const workoutsThisWeek = DataStore.data.prescribedWorkouts.filter(w => studentIds.includes(w.studentId)).length;
      const pendingFeedbacks = DataStore.getFeedbacksByProfessional(profId).filter(f => f.requiresReview).length;
      const highAdherence = students.filter(s => s.adherenceStatus === 'Alta').length;
      const totalStudents = students.length || 1;
      const adherencePct = Math.round((highAdherence / totalStudents) * 100);

      stats[0].textContent = students.length;
      stats[1].textContent = workoutsThisWeek;
      stats[2].textContent = pendingFeedbacks;
      stats[3].textContent = `${adherencePct}%`;
    }

    const activityList = $('view-prof-overview').querySelector('.activity-list');
    if (activityList) {
      const profEvents = DataStore.data.workoutEvents
        .filter(e => studentIds.includes(e.studentId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      if (profEvents.length === 0) {
        activityList.innerHTML = '<div class="activity-item">Sem atividades recentes.</div>';
      } else {
        const getActivityText = (event) => {
          const student = DataStore.data.students.find(s => s.id === event.studentId);
          const studentName = student ? student.name : 'Aluno';
          const workout = DataStore.data.prescribedWorkouts.find(w => w.id === event.workoutId);
          const workoutTitle = workout ? workout.title : 'Treino';

          switch (event.type) {
            case 'workout_started':
              return `${studentName} iniciou o ${workoutTitle}`;
            case 'workout_finished':
              return `${studentName} concluiu o ${workoutTitle}`;
            case 'set_completed':
              const ex = DataStore.data.exercises.find(x => x.id === event.payload.exerciseId);
              const exName = ex ? ex.name : (event.payload.exercise || 'Exercício');
              return `${studentName} realizou Série ${event.payload.setIndex} de ${exName} (${event.payload.load}kg)`;
            case 'load_changed':
              return `${studentName} alterou a carga de ${event.payload.oldLoad} para ${event.payload.newLoad}`;
            case 'exercise_skipped':
              return `${studentName} pulou um exercício`;
            case 'feedback_submitted':
              return `${studentName} enviou um feedback de treino`;
            default:
              return `${studentName} registrou evento: ${event.type}`;
          }
        };

        activityList.innerHTML = profEvents.map(e => {
          return `<div class="activity-item">
            <span class="activity-time">${formatEventTime(e.createdAt)}</span>
            <span>${getActivityText(e)}</span>
          </div>`;
        }).join('');
      }
    }
  },

  renderProfAlunos() {
    const studentListEl = $('view-prof-alunos').querySelector('.student-list');
    if (studentListEl) {
      const profId = state.user.professionalId;
      const myStudents = DataStore.getStudentsByProfessional(profId);
      
      studentListEl.innerHTML = myStudents.map(s => {
        const avatar = s.name.charAt(0);
        let statusClass = 'active';
        let statusLabel = 'Ativo';
        if (s.riskLevel === 'Médio') {
          statusClass = 'warning';
          statusLabel = 'Atenção';
        } else if (s.riskLevel === 'Alto') {
          statusClass = 'danger';
          statusLabel = 'Alto Risco';
        }
        
        return `
          <div class="student-card" data-id="${s.id}">
            <div class="student-avatar">${avatar}</div>
            <div class="student-info">
              <div class="student-name">${s.name}</div>
              <div class="student-meta">${s.goal} · ${s.trainingMode} · ${s.level}</div>
              <div class="student-notes" style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">${s.notes || ''}</div>
            </div>
            <span class="student-status ${statusClass}">${statusLabel}</span>
          </div>
        `;
      }).join('');
    }
  },

  renderProfFeedbacks() {
    const feedbackListEl = $('view-prof-feedbacks').querySelector('.feedback-list');
    if (feedbackListEl) {
      const profId = state.user.professionalId;
      const myFeedbacks = DataStore.getFeedbacksByProfessional(profId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (myFeedbacks.length === 0) {
        feedbackListEl.innerHTML = '<div class="feedback-card">Nenhum feedback recebido ainda.</div>';
      } else {
        feedbackListEl.innerHTML = myFeedbacks.map(f => {
          const student = DataStore.data.students.find(s => s.id === f.studentId);
          const studentName = student ? student.name : 'Aluno';
          
          const ex = DataStore.data.exercises.find(e => e.id === f.exerciseId);
          const exName = ex ? ex.name : '';
          const contextText = exName ? `${exName}` : 'Geral';

          const tagClass = f.requiresReview ? 'tag-warn' : 'tag-success';
          const tagText = f.requiresReview ? 'Revisão pendente' : 'Revisado';

          return `
            <div class="feedback-card">
              <div class="fb-header">
                <span class="fb-student">${studentName}</span>
                <span class="fb-date">${formatEventTime(f.createdAt)}</span>
              </div>
              <div class="fb-exercise">Contexto: ${contextText}</div>
              <div class="fb-content">"${f.message}"</div>
              <div class="fb-tags">
                <span class="tag ${tagClass}">${tagText}</span>
                <span class="tag">Intensidade: ${f.intensity}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  renderAlunoOverview() {
    const studentId = state.user.studentId;
    const studentObj = DataStore.data.students.find(s => s.id === studentId);
    const studentName = studentObj ? studentObj.name.split(' ')[0] : state.user.name;

    const subEl = $('view-aluno-overview').querySelector('.page-sub');
    if (subEl) subEl.textContent = `Olá, ${studentName}. Bom treino hoje.`;

    const todayWorkout = DataStore.getTodayWorkout(studentId);

    const workoutPreviewWrap = $('view-aluno-overview').querySelector('.today-workout-preview');
    if (workoutPreviewWrap) {
      if (todayWorkout) {
        const numExercises = todayWorkout.exercises.length;
        const duration = todayWorkout.estimatedDurationMinutes;
        workoutPreviewWrap.innerHTML = `
          <h3 class="section-title">Treino de hoje</h3>
          <div class="workout-preview-name">${todayWorkout.title}</div>
          <div class="workout-preview-meta">${numExercises} exercício${numExercises !== 1 ? 's' : ''} · ~${duration} min</div>
          <button class="btn btn-primary" onclick="App.navigate('aluno-treino')">Iniciar treino</button>
        `;
      } else {
        workoutPreviewWrap.innerHTML = `
          <h3 class="section-title">Treino de hoje</h3>
          <div class="workout-preview-name">Nenhum treino agendado para hoje.</div>
          <div class="workout-preview-meta">Descanse ou converse com seu professor.</div>
        `;
      }
    }

    const stats = $('view-aluno-overview').querySelectorAll('.stat-value');
    if (stats.length >= 4) {
      const studentEvents = DataStore.data.workoutEvents.filter(e => e.studentId === studentId);
      const completedCount = studentEvents.filter(e => e.type === 'workout_finished').length;
      
      stats[0].textContent = completedCount + 10;
      stats[1].textContent = studentObj ? (studentObj.adherenceStatus === 'Alta' ? '94%' : '65%') : '94%';
      stats[2].textContent = studentObj && studentObj.level === 'Avançado' ? '+5.0kg' : '+2.5kg';
      stats[3].textContent = todayWorkout ? todayWorkout.exercises.reduce((sum, ex) => sum + parseInt(ex.sets), 0) : '0';
    }
  },

  renderAlunoTreino() {
    const studentId = state.user.studentId;
    const todayWorkout = DataStore.getTodayWorkout(studentId);
    
    const viewHeaderSub = $('view-aluno-treino').querySelector('.page-sub');
    if (viewHeaderSub && todayWorkout) {
      viewHeaderSub.textContent = todayWorkout.title;
    }

    const listEl = $('view-aluno-treino').querySelector('.workout-exercise-list');
    if (!listEl) return;

    if (!todayWorkout || !state.workout.exercises || state.workout.exercises.length === 0) {
      listEl.innerHTML = '<div class="exercise-item">Nenhum exercício prescrito para hoje.</div>';
      return;
    }

    listEl.innerHTML = state.workout.exercises.map((ex, idx) => {
      const restText = ex.rest >= 60 ? `${Math.floor(ex.rest / 60)} min` : `${ex.rest} seg`;
      return `
        <div class="exercise-item" data-index="${idx}">
          <div class="ex-number">${String(idx + 1).padStart(2, '0')}</div>
          <div class="ex-info">
            <div class="ex-name">${ex.name}</div>
            <div class="ex-meta">${ex.sets} séries · ${ex.reps} reps · ${restText} desc · Sugestão: ${ex.loadSuggestion}</div>
            ${ex.notes ? `<div class="ex-notes" style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">Obs: ${ex.notes}</div>` : ''}
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.startWorkout(${idx})">Executar</button>
        </div>
      `;
    }).join('');
  },

  renderAlunoPerfil() {
    const studentId = state.user.studentId;
    const studentObj = DataStore.data.students.find(s => s.id === studentId);
    const assessment = DataStore.data.assessments.find(a => a.studentId === studentId);
    const professional = DataStore.data.professionals.find(p => p.id === (studentObj ? studentObj.professionalId : ''));

    const avatarEl = $('view-aluno-perfil').querySelector('.profile-avatar-large');
    if (avatarEl) avatarEl.textContent = state.user.avatar;

    const nameEl = $('view-aluno-perfil').querySelector('.profile-name-large');
    if (nameEl) nameEl.textContent = studentObj ? studentObj.name : state.user.name;

    const emailEl = $('view-aluno-perfil').querySelector('.profile-email');
    if (emailEl) emailEl.textContent = state.user.email;

    const anamneseList = $('view-aluno-perfil').querySelector('.anamnese-list');
    if (anamneseList) {
      anamneseList.innerHTML = `
        <div class="anamnese-row"><span class="an-label">Objetivo</span><span class="an-value">${studentObj ? studentObj.goal : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Nível</span><span class="an-value">${studentObj ? studentObj.level : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Modo</span><span class="an-value">${studentObj ? studentObj.trainingMode : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Frequência</span><span class="an-value">${assessment ? assessment.weeklyFrequency + 'x por semana' : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Disponibilidade</span><span class="an-value">${assessment ? assessment.availability : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Restrições</span><span class="an-value">${studentObj && studentObj.restrictions.length > 0 ? studentObj.restrictions.join(', ') : 'Nenhuma'}</span></div>
        <div class="anamnese-row"><span class="an-label">Professor</span><span class="an-value">${professional ? professional.name : 'Sem professor'}</span></div>
        <div class="anamnese-row"><span class="an-label">Conexão BT</span><span class="an-value">${studentObj && studentObj.usesBluetooth ? 'Habilitado' : 'Desativado'}</span></div>
        <div class="anamnese-row"><span class="an-label">Notas do Prof</span><span class="an-value">${studentObj ? studentObj.notes : '—'}</span></div>
      `;
    }
  },

  renderAlunoEvolucao() {
    const studentId = state.user.studentId;
    const listEl = $('view-aluno-evolucao').querySelector('.evolution-list');
    if (listEl) {
      const setEvents = DataStore.data.workoutEvents.filter(e => e.studentId === studentId && e.type === 'set_completed');
      const loadsByEx = {};
      setEvents.forEach(e => {
        const exId = e.payload.exerciseId;
        const ex = DataStore.data.exercises.find(x => x.id === exId);
        const exName = ex ? ex.name : (e.payload.exercise || 'Exercício');
        const loadVal = parseFloat(e.payload.load) || 0;
        if (loadVal > 0) {
          if (!loadsByEx[exName] || loadVal > loadsByEx[exName]) {
            loadsByEx[exName] = loadVal;
          }
        }
      });

      const items = Object.entries(loadsByEx);
      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="evo-card">
            <div class="evo-exercise">Supino Reto com Barra</div>
            <div class="evo-stats"><span class="evo-value">60 kg (Sugerido)</span><span class="evo-trend flat">→ Estável</span></div>
            <div class="evo-bar-wrap"><div class="evo-bar" style="width: 45%"></div></div>
          </div>
          <div class="evo-card">
            <div class="evo-exercise">Supino Inclinado com Halteres</div>
            <div class="evo-stats"><span class="evo-value">22 kg (Sugerido)</span><span class="evo-trend flat">→ Estável</span></div>
            <div class="evo-bar-wrap"><div class="evo-bar" style="width: 35%"></div></div>
          </div>
        `;
      } else {
        listEl.innerHTML = items.map(([name, maxLoad]) => {
          const pct = Math.min(100, Math.round((maxLoad / 150) * 100));
          return `
            <div class="evo-card">
              <div class="evo-exercise">${name}</div>
              <div class="evo-stats">
                <span class="evo-value">${maxLoad} kg</span>
                <span class="evo-trend up">↑ Carga máxima registrada</span>
              </div>
              <div class="evo-bar-wrap">
                <div class="evo-bar" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  // ── Sidebar mobile ────────────────────────────────────
  bindMenu() {
    DOM.btnMenu.addEventListener('click', () => this.toggleSidebar());
    DOM.overlay.addEventListener('click',  () => this.closeSidebar());
  },

  toggleSidebar() {
    DOM.sidebar.classList.toggle('open');
    DOM.overlay.classList.toggle('hidden');
  },

  closeSidebar() {
    DOM.sidebar.classList.remove('open');
    DOM.overlay.classList.add('hidden');
  },

  // ── Online/offline ────────────────────────────────────
  bindOnlineStatus() {
    window.addEventListener('online',  () => { this.updateStatusDot(); OfflineQueue.flush(); });
    window.addEventListener('offline', () => this.updateStatusDot());
    this.updateStatusDot();
  },

  updateStatusDot() {
    const online = navigator.onLine;
    DOM.statusDot.className = `status-dot ${online ? 'online' : 'offline'}`;
    DOM.statusDot.title = online ? 'Online' : 'Offline';
  },

  updateOfflineUI() {
    const count = OfflineQueue.pendingCount();
    const el = $('offline-queue-indicator');
    const countEl = $('offline-queue-count');
    if (!el) return;
    if (count > 0) {
      el.classList.remove('hidden');
      countEl.textContent = `${count} evento${count !== 1 ? 's' : ''} na fila offline`;
    } else {
      el.classList.add('hidden');
    }
  },

  // ── Treino Creator (Professor) ────────────────────────
  bindTreinoCreator() {
    const btnOrganizar = $('btn-organizar-treino');
    const btnLimpar    = $('btn-limpar-treino');
    const btnSalvar    = $('btn-salvar-treino');
    const btnEditar    = $('btn-editar-treino');

    if (!btnOrganizar) return;

    btnOrganizar.addEventListener('click', () => this.parseTreino());
    btnLimpar.addEventListener('click',    () => this.clearTreino());
    btnSalvar.addEventListener('click',    () => this.saveTreino());
    btnEditar.addEventListener('click',    () => this.editTreino());
  },

  parseTreino() {
    const text = $('treino-text-input').value.trim();
    if (!text) return;

    const parsed = this.parseExercisesFromText(text);
    if (parsed.length === 0) {
      alert('Nenhum exercício identificado. Tente: "Supino 4x8 2min descanso"');
      return;
    }

    const draftArea    = $('treino-draft-area');
    const draftContent = $('treino-draft-content');

    draftContent.innerHTML = parsed.map((ex, i) => `
      <div class="draft-exercise">
        <div class="draft-ex-name">${String(i + 1).padStart(2, '0')}. ${ex.name}</div>
        <div class="draft-ex-params">
          <span class="draft-ex-param"><span class="draft-ex-param-label">Séries:</span><span class="draft-ex-param-value">${ex.sets}</span></span>
          <span class="draft-ex-param"><span class="draft-ex-param-label">Reps:</span><span class="draft-ex-param-value">${ex.reps}</span></span>
          <span class="draft-ex-param"><span class="draft-ex-param-label">Descanso:</span><span class="draft-ex-param-value">${ex.rest}</span></span>
        </div>
      </div>
    `).join('');

    draftArea.classList.remove('hidden');
    draftArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  parseExercisesFromText(text) {
    const lines = text.split(/[,\n]+/).map(l => l.trim()).filter(Boolean);
    const results = [];

    lines.forEach(line => {
      // Try to extract sets x reps pattern (e.g. 4x8, 4x8-10, 4 x 8)
      const setsRepsMatch = line.match(/(\d+)\s*[xX×]\s*([\d\-–]+)/);
      // Try to extract rest time (e.g. 2min, 90seg, 1min, 45s)
      const restMatch = line.match(/(\d+)\s*(min|seg|s)\b/i);

      if (!setsRepsMatch) return;

      const sets = setsRepsMatch[1];
      const reps = setsRepsMatch[2];

      let rest = '—';
      if (restMatch) {
        const val  = parseInt(restMatch[1]);
        const unit = restMatch[2].toLowerCase();
        if (unit === 'min') rest = `${val} min`;
        else rest = `${val} seg`;
      }

      // Exercise name = everything before the sets x reps pattern
      const nameRaw = line.slice(0, line.search(/\d+\s*[xX×]/)).trim();
      const name = nameRaw || `Exercício ${results.length + 1}`;

      results.push({ name, sets, reps, rest });
    });

    return results;
  },

  clearTreino() {
    $('treino-text-input').value = '';
    $('treino-draft-area').classList.add('hidden');
    $('treino-draft-content').innerHTML = '';
  },

  saveTreino() {
    const content = $('treino-draft-content').innerHTML;
    const saved = {
      id: Date.now(),
      content,
      createdAt: new Date().toISOString(),
    };
    const all = JSON.parse(localStorage.getItem('personalops_treinos') || '[]');
    all.push(saved);
    localStorage.setItem('personalops_treinos', JSON.stringify(all));
    alert('Treino salvo com sucesso! (localStorage)');
  },

  editTreino() {
    $('treino-draft-area').classList.add('hidden');
    $('treino-text-input').focus();
  },

  // ── Workout Mode (Aluno) ──────────────────────────────
  startWorkout(exerciseIndex) {
    state.workout.exerciseIndex = exerciseIndex;
    state.workout.currentSet    = 1;
    state.workout.registeredSets = [];

    this.renderWorkoutMode();
    this.navigate('aluno-modo-treino');
  },

  bindWorkoutMode() {
    const btnRegister = $('btn-register-set');
    const btnSkip     = $('btn-skip-rest');
    const btnNext     = $('btn-next-exercise');

    if (btnRegister) btnRegister.addEventListener('click', () => this.registerSet());
    if (btnSkip)     btnSkip.addEventListener('click', ()     => this.skipRest());
    if (btnNext)     btnNext.addEventListener('click', ()     => this.nextExercise());
  },

  renderWorkoutMode() {
    const ex = state.workout.exercises[state.workout.exerciseIndex];
    if (!ex) return;

    $('wm-ex-name').textContent  = ex.name;
    $('wm-ex-meta').textContent  = `${ex.sets} séries · ${ex.reps} reps`;
    $('wm-set-current').textContent = state.workout.currentSet;
    $('wm-set-total').textContent   = ex.sets;

    $('wm-load').value = '';
    $('wm-reps').value = '';
    $('wm-rpe').value  = '';

    $('wm-load').focus();

    $('rest-timer-wrap').classList.add('hidden');
    $('btn-next-exercise').classList.add('hidden');
    $('btn-register-set').classList.remove('hidden');

    this.highlightMuscle(ex.active || []);
    $('wm-muscle-label').textContent = ex.muscle;

    // Render coaching tips and cues if available
    const tipsEl = $('wm-coaching-tips');
    if (tipsEl) {
      const originalEx = DataStore.data.exercises.find(e => e.id === ex.id);
      if (originalEx) {
        const cuesHtml = originalEx.coachingCues && originalEx.coachingCues.length > 0
          ? `<strong style="color: var(--primary);">Dicas:</strong><ul style="margin: 4px 0 0 16px; padding: 0;">${originalEx.coachingCues.map(c => `<li>${c}</li>`).join('')}</ul>`
          : '';
        const safetyHtml = originalEx.safetyNotes
          ? `<div style="margin-top: 6px; color: #ffbc00;"><strong>Segurança:</strong> ${originalEx.safetyNotes}</div>`
          : '';
        const mistakesHtml = originalEx.commonMistakes && originalEx.commonMistakes.length > 0
          ? `<div style="margin-top: 6px; color: #ff4a4a;"><strong>Evite:</strong> ${originalEx.commonMistakes.join(', ')}</div>`
          : '';
        tipsEl.innerHTML = `${cuesHtml}${safetyHtml}${mistakesHtml}`;
      } else {
        tipsEl.innerHTML = 'Mantenha foco na postura e técnica de execução.';
      }
    }

    this.renderSetsLog();
    this.updateOfflineUI();
  },

  highlightMuscle(activeIds) {
    document.querySelectorAll('#body-figure .fig-body').forEach(el => {
      el.classList.remove('fig-active');
    });

    activeIds.forEach(idOrClass => {
      let elements = document.querySelectorAll(`.${idOrClass}`);
      if (elements.length === 0) {
        const el = document.getElementById(idOrClass);
        if (el) elements = [el];
      }
      elements.forEach(el => {
        el.classList.add('fig-active');
      });
    });
  },

  registerSet() {
    const load = parseFloat($('wm-load').value) || 0;
    const reps = parseInt($('wm-reps').value)   || 0;
    const rpe  = parseFloat($('wm-rpe').value)  || null;

    if (reps === 0) {
      $('wm-reps').focus();
      return;
    }

    const ex = state.workout.exercises[state.workout.exerciseIndex];

    const setData = {
      type:     'set_completed',
      exerciseId: ex.id,
      exercise: ex.name,
      set:      state.workout.currentSet,
      load:     load,
      reps,
      rpe,
      online:   navigator.onLine,
    };

    OfflineQueue.push(setData);
    state.workout.registeredSets.push({ ...setData, offline: !navigator.onLine });

    this.renderSetsLog();

    const isLastSet = state.workout.currentSet >= ex.sets;
    const isLastEx  = state.workout.exerciseIndex >= state.workout.exercises.length - 1;

    if (isLastSet) {
      $('btn-register-set').classList.add('hidden');
      if (!isLastEx) {
        $('btn-next-exercise').classList.remove('hidden');
      } else {
        this.finishWorkout();
        return;
      }
      const nextEx = state.workout.exercises[state.workout.exerciseIndex + 1];
      this.startTimer(nextEx ? nextEx.rest : ex.rest);
    } else {
      state.workout.currentSet++;
      $('wm-set-current').textContent = state.workout.currentSet;
      $('wm-load').value = '';
      $('wm-reps').value = '';
      $('wm-rpe').value  = '';
      $('wm-load').focus();
      this.startTimer(ex.rest);
    }
  },

  renderSetsLog() {
    const log = $('sets-log');
    if (!log) return;

    log.innerHTML = state.workout.registeredSets.map((s, i) => `
      <div class="set-log-item">
        <span class="set-log-num">S${s.set}</span>
        <span class="set-log-data">${s.load}kg · ${s.reps} reps${s.rpe ? ` · RPE ${s.rpe}` : ''}</span>
        ${s.offline ? '<span class="set-log-offline">offline</span>' : ''}
      </div>
    `).join('');
  },

  nextExercise() {
    this.stopTimer();
    state.workout.exerciseIndex++;
    state.workout.currentSet    = 1;
    state.workout.registeredSets = [];
    this.renderWorkoutMode();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  finishWorkout() {
    $('rest-timer-wrap').classList.add('hidden');
    $('btn-next-exercise').classList.add('hidden');
    
    OfflineQueue.push({
      type: 'workout_finished',
      online: navigator.onLine
    });

    alert('Treino concluído! Todos os eventos foram registrados.');
    this.navigate('aluno-overview');
  },

  skipRest() {
    this.stopTimer();
    $('rest-timer-wrap').classList.add('hidden');
  },

  // ── Timer (no re-render of app — isolated DOM updates) ──
  startTimer(seconds) {
    this.stopTimer();

    state.timer.total     = seconds;
    state.timer.remaining = seconds;

    const wrap    = $('rest-timer-wrap');
    const display = $('rest-timer-display');
    const bar     = $('rest-timer-bar');

    wrap.classList.remove('hidden');
    this.updateTimerDisplay(display, bar, seconds, seconds);

    state.timer.id = setInterval(() => {
      state.timer.remaining--;

      if (state.timer.remaining <= 0) {
        this.stopTimer();
        wrap.classList.add('hidden');
        return;
      }

      this.updateTimerDisplay(display, bar, state.timer.remaining, state.timer.total);
    }, 1000);
  },

  updateTimerDisplay(displayEl, barEl, remaining, total) {
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');
    displayEl.textContent = `${m}:${s}`;
    const pct = total > 0 ? (remaining / total) * 100 : 0;
    barEl.style.width = `${pct}%`;
  },

  stopTimer() {
    if (state.timer.id) {
      clearInterval(state.timer.id);
      state.timer.id = null;
    }
  },
};

// ── Service Worker registration ───────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {
      // SW registration failure is non-fatal for the prototype
    });
  });
}

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
