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

const formatDateBR = (isoDate) => {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const formatCurrencyBR = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const billingFrequencyLabel = (frequency) => ({
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  single: 'Avulso'
}[frequency] || frequency || '—');

const paymentStatusLabel = (status) => ({
  active: 'Em dia',
  due_soon: 'A vencer',
  overdue: 'Inadimplente',
  paused: 'Pausado',
  canceled: 'Cancelado',
  scheduled: 'Agendada',
  open: 'Aberta',
  paid: 'Paga',
  failed: 'Falhou'
}[status] || status || '—');

const statusTone = (status) => ({
  active: 'active',
  paid: 'active',
  open: 'warning',
  due_soon: 'warning',
  scheduled: 'warning',
  overdue: 'danger',
  failed: 'danger',
  paused: 'warning',
  canceled: 'danger'
}[status] || 'warning');

const getDayLabel = (day) => ({
  sunday: 'Dom',
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sab'
}[day] || day);

const perceivedEffortLabel = (effort) => ({
  leve: 'Leve',
  moderado: 'Moderado',
  pesado: 'Pesado',
  muito_pesado: 'Muito pesado'
}[effort] || effort || '—');

const completionStatusLabel = (status) => ({
  completo: 'Completo',
  parcial: 'Parcial',
  nao_consegui: 'Não consegui'
}[status] || status || '—');

const riskLabel = (student, summary) => {
  if (!student) return '—';
  if (student.riskLevel === 'high' || (summary && summary.adherenceRate < 60)) return 'risco alto';
  if (student.riskLevel === 'medium' || (summary && summary.adherenceRate < 75)) return 'atenção';
  if (summary && summary.latest && summary.latest.strengthTrend === 'evoluindo bem') return 'evoluindo bem';
  return 'em dia';
};

const riskTone = (student, summary) => {
  const label = riskLabel(student, summary);
  if (label === 'risco alto') return 'danger';
  if (label === 'atenção') return 'warning';
  return 'active';
};

const renderStatusBadge = (label, tone = 'active') => `<span class="status-badge ${tone}">${label}</span>`;

const renderProgressBar = (value, label = '') => {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return `
    <div class="progress-row" aria-label="${label || 'Progresso'} ${pct}%">
      <div class="progress-row-top"><span>${label}</span><strong>${pct}%</strong></div>
      <div class="progress-track"><span style="width:${pct}%"></span></div>
    </div>
  `;
};

const renderStatCard = (label, value, tone = '') => `
  <div class="stat-card ${tone ? `tone-${tone}` : ''}">
    <div class="stat-value">${value}</div>
    <div class="stat-label">${label}</div>
  </div>
`;

const renderWeeklyScheduleStrip = (weeklyPlan, compact = false) => `
  <div class="${compact ? 'week-strip compact' : 'week-strip'}">
    ${weeklyPlan.map(item => `
      <div class="week-strip-day ${item.type}">
        <strong>${compact ? getDayLabel(item.day) : item.label}</strong>
        <span>${item.title}</span>
        <small>${item.type}</small>
      </div>
    `).join('')}
  </div>
`;

const renderFeedbackRating = (rating) => {
  const value = Number(rating || 0);
  return `<span class="feedback-rating" aria-label="Nota ${value} de 5">${'●'.repeat(value)}${'○'.repeat(Math.max(0, 5 - value))}</span>`;
};

const getWorkoutTypeLabel = (type) => ({
  workout: 'Treino',
  rest: 'Descanso',
  cardio: 'Cardio',
  checkin: 'Check-in',
  assessment: 'Avaliação'
}[type] || type || 'Treino');

const escapeAttr = (value) => String(value || '').replace(/"/g, '&quot;');

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
    activeWorkoutId: null,
    finishedWorkoutId: null,
  },
  timer: {
    id: null,
    remaining: 0,
    total: 0,
  },
  selectedStudentId: null,
  toastTimer: null,
};

// ── DOM refs (resolved once on boot) ─────────────────────
const $ = id => document.getElementById(id);

let DOM = {};

function initDOM() {
  DOM = {
    screenLanding: $('screen-landing'),
    screenLogin: $('screen-login'),
    screenApp:   $('screen-app'),
    btnEnterApp: $('btn-enter-app'),
    btnHeroEnterApp: $('btn-hero-enter-app'),
    btnProductProposal: $('btn-product-proposal'),
    btnBackLanding: $('btn-back-landing'),
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
}

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
      payload: event.payload || {
        exerciseId: event.exerciseId || null,
        exercise: event.exercise || null,
        setIndex: event.set || null,
        load: event.load || 0,
        reps: event.reps || 0,
        rpe: event.rpe || null
      },
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
    renderApp();
    initDOM();

    this.bindPublicRoutes();
    this.bindLogin();
    this.bindDemoPills();
    this.bindLogout();
    this.bindMenu();
    this.bindOnlineStatus();
    this.bindWorkoutMode();
    this.bindTreinoCreator();
    this.bindOperationalForms();

    // Trigger initial offline queue sync if online
    if (navigator.onLine) {
      OfflineQueue.flush();
    }

    const saved = sessionStorage.getItem('personalops_session');
    if (saved) {
      try {
        state.user = JSON.parse(saved);
        this.enterApp();
        return;
      } catch {
        sessionStorage.removeItem('personalops_session');
      }
    }

    this.handlePublicRoute();
  },

  // ── Public route ─────────────────────────────────────
  bindPublicRoutes() {
    const goToLogin = () => {
      location.hash = '#/entrar';
      this.handlePublicRoute();
    };

    [DOM.btnEnterApp, DOM.btnHeroEnterApp].forEach(btn => {
      if (btn) btn.addEventListener('click', goToLogin);
    });

    if (DOM.btnBackLanding) {
      DOM.btnBackLanding.addEventListener('click', () => {
        location.hash = '#/';
        this.handlePublicRoute();
      });
    }

    if (DOM.btnProductProposal) {
      DOM.btnProductProposal.addEventListener('click', () => {
        const target = $('landing-validation');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    window.addEventListener('hashchange', () => this.handlePublicRoute());
  },

  handlePublicRoute() {
    if (state.user) return;
    const route = location.hash.replace(/^#/, '') || '/';

    if (route === '/entrar') {
      this.showLogin();
      return;
    }

    this.showLanding();
  },

  showLanding() {
    DOM.screenLanding.classList.remove('hidden');
    DOM.screenLogin.classList.add('hidden');
    DOM.screenApp.classList.add('hidden');
  },

  showLogin() {
    DOM.screenLanding.classList.add('hidden');
    DOM.screenLogin.classList.remove('hidden');
    DOM.screenApp.classList.add('hidden');
    DOM.loginEmail.focus();
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
        // Save userId to sessionStorage for shell to read, then redirect
        if (pill.dataset.userid) {
          sessionStorage.setItem('personalops_demo_userId', pill.dataset.userid);
          window.location.href = '/personalops/shell/';
        } else {
          // Fallback: fill form and submit (original behavior)
          DOM.loginEmail.value = pill.dataset.email;
          DOM.loginPass.value  = pill.dataset.pass;
          DOM.loginError.classList.add('hidden');
          DOM.formLogin.dispatchEvent(new Event('submit'));
        }
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
    DOM.screenLogin.classList.add('hidden');
    DOM.screenLanding.classList.remove('hidden');
    DOM.loginEmail.value = '';
    DOM.loginPass.value  = '';
    location.hash = '#/';
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
        state.workout.activeWorkoutId = todayWorkout.id;
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

    DOM.screenLanding.classList.add('hidden');
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
    document.querySelectorAll('.view').forEach(v => {
      v.classList.remove('active');
      v.classList.add('hidden');
    });

    // Activate target view
    const target = $(`view-${viewId}`);
    if (target) {
      target.classList.remove('hidden');
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
        case 'prof-criar-treino':
          this.renderProfCriarTreino();
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
    const view = $('view-admin-overview');
    const metrics = DataStore.getPlatformUsageMetrics();
    const compact = DataStore.getCompactPlatformMetrics();
    const expectedRevenue = DataStore.data.invoices
      .filter(invoice => ['open', 'due_soon', 'scheduled'].includes(invoice.status))
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const mediaPending = DataStore.data.exercises.filter(exercise => exercise.visualStatus !== 'placeholder');

    view.innerHTML = `
      <div class="admin-mobile-compact">
        <div class="compact-admin-hero">
          <span class="landing-card-label">Admin PersonalOps</span>
          <h2>Visão compacta da plataforma</h2>
          <p>Para análise completa, acesse em desktop.</p>
        </div>
        <div class="mobile-compact-grid">
          ${renderStatCard('Professores ativos', compact.activeProfessionals)}
          ${renderStatCard('Alunos totais', compact.totalStudents)}
          ${renderStatCard('Treinos na semana', compact.completedWorkoutsThisWeek)}
          ${renderStatCard('Feedbacks críticos', compact.criticalFeedbacks, compact.criticalFeedbacks ? 'danger' : '')}
          ${renderStatCard('Cobranças vencidas', compact.overdueInvoices, compact.overdueInvoices ? 'danger' : '')}
          ${renderStatCard('Receita prevista', formatCurrencyBR(compact.expectedRevenue))}
        </div>
        <details class="compact-admin-section" open>
          <summary>Alertas e notificações</summary>
          <div class="compact-list">
            <div><span>Notificações pendentes</span><strong>${compact.scheduledNotifications}</strong></div>
            <div><span>Feedbacks para revisão</span><strong>${compact.criticalFeedbacks}</strong></div>
            <div><span>Cobranças vencidas</span><strong>${compact.overdueInvoices}</strong></div>
          </div>
        </details>
        <details class="compact-admin-section">
          <summary>Saúde do sistema</summary>
          <div class="compact-list">
            ${Object.entries(compact.systemHealth).map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join('')}
          </div>
        </details>
        <details class="compact-admin-section">
          <summary>Pagamentos e mídia mockados</summary>
          <div class="compact-list">
            <div><span>Pix mockados gerados</span><strong>${DataStore.data.invoices.length}</strong></div>
            <div><span>Mídias pendentes</span><strong>${metrics.mediaAssetsPending}</strong></div>
            <div><span>Treinos na biblioteca</span><strong>${metrics.workoutsInLibrary}</strong></div>
          </div>
        </details>
        <div class="compact-shortcuts">
          <button class="btn btn-primary" onclick="App.navigate('admin-users')">Ver usuários demo</button>
          <button class="btn btn-ghost" onclick="App.navigate('admin-hypotheses')">Ver hipóteses</button>
        </div>
        <div class="demo-warning">Todos os dados são sintéticos. Pix, QR Code, WhatsApp, Open Finance e pagamentos são demonstrativos.</div>
      </div>
      <div class="platform-dashboard">
        <div class="page-header">
          <h2>Admin PersonalOps</h2>
          <p class="page-sub">Dashboard da plataforma: uso, professores, alunos, cobranças, biblioteca e saúde técnica.</p>
        </div>
        <div class="platform-metric-grid">
          ${[
            ['Professores cadastrados', metrics.totalProfessionals],
            ['Alunos totais da plataforma', metrics.totalStudents],
            ['Alunos ativos', metrics.activeStudents],
            ['Alunos com baixa adesão', metrics.lowAdherenceStudents],
            ['Treinos executados na semana', metrics.completedWorkoutsThisWeek],
            ['Feedbacks pós-treino recebidos', metrics.feedbacksThisWeek],
            ['Cobranças Pix mockadas geradas', DataStore.data.invoices.length],
            ['Cobranças vencidas', metrics.overdueInvoices],
            ['Receita mockada prevista', formatCurrencyBR(expectedRevenue)],
            ['Notificações agendadas', metrics.scheduledNotifications],
            ['Exercícios cadastrados', metrics.exercisesRegistered],
            ['Treinos na biblioteca', metrics.workoutsInLibrary],
            ['Mídias pendentes', metrics.mediaAssetsPending],
            ['Eventos offline registrados', metrics.offlineEventsPending]
          ].map(([label, value]) => `
            <div class="stat-card platform-stat"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>
          `).join('')}
        </div>
        <div class="demo-warning">Todos os indicadores são sintéticos. Pix, QR Code, WhatsApp e Open Finance são demonstrativos e não executam transações reais.</div>
        <div class="admin-section-grid">
          <section class="section-block">
            <h3 class="section-title">Profissionais cadastrados</h3>
            <div class="table-wrap soft-table">
              <table class="data-table">
                <thead><tr><th>Profissional</th><th>Especialidade</th><th>Alunos</th><th>Provider</th></tr></thead>
                <tbody>
                  ${DataStore.data.professionals.map(professional => `
                    <tr>
                      <td>${professional.displayName || professional.name}</td>
                      <td>${professional.specialty || '—'}</td>
                      <td>${professional.activeStudentsCount || DataStore.getStudentsByProfessional(professional.id).length}</td>
                      <td>${professional.financialProfile.paymentProvider}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Uso do sistema</h3>
            <div class="usage-bars">
              <div><span>Treinos concluídos</span><strong>${metrics.completedWorkoutsThisWeek}/${metrics.workoutsThisWeek}</strong></div>
              <div><span>Faltas/no-show</span><strong>${metrics.missedWorkoutsThisWeek}</strong></div>
              <div><span>Feedbacks críticos</span><strong>${metrics.criticalFeedbacks}</strong></div>
              <div><span>Eventos offline pendentes</span><strong>${metrics.offlineEventsPending}</strong></div>
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Frequência agregada dos alunos</h3>
            <div class="invoice-list">
              ${DataStore.data.progressSnapshots.slice(0, 8).map(snapshot => {
                const student = DataStore.getStudentById(snapshot.studentId);
                return `<div class="invoice-row">
                  <div><strong>${student ? student.name : snapshot.studentId}</strong><span>${snapshot.completedWorkouts} concluídos · ${snapshot.missedWorkouts} perdidos</span></div>
                  <span class="student-status ${snapshot.adherenceRate < 70 ? 'danger' : 'active'}">${snapshot.adherenceRate}% adesão</span>
                </div>`;
              }).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Cobranças e Pix mockado</h3>
            <div class="invoice-list">
              ${DataStore.data.invoices.slice(0, 6).map(invoice => {
                const student = DataStore.getStudentById(invoice.studentId);
                return `<div class="invoice-row">
                  <div><strong>${student ? student.name : invoice.studentId}</strong><span>${formatDateBR(invoice.dueDate)} · ${invoice.pixQrCodeMock}</span></div>
                  <div class="invoice-row-right"><strong>${formatCurrencyBR(invoice.amount)}</strong><span class="student-status ${statusTone(invoice.status)}">${paymentStatusLabel(invoice.status)}</span></div>
                </div>`;
              }).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Notificações simuladas</h3>
            <div class="notification-list">
              ${DataStore.data.notificationEvents.slice(0, 6).map(event => {
                const student = DataStore.getStudentById(event.studentId);
                return `<div class="notification-row">
                  <span class="student-status ${event.status === 'sent' ? 'active' : 'warning'}">${event.status}</span>
                  <div><strong>${student ? student.name : event.studentId}</strong><span>${event.channel} · ${formatEventTime(event.scheduledFor)}</span></div>
                </div>`;
              }).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Biblioteca global de exercícios</h3>
            <div class="tag-cloud">
              ${metrics.mostUsedExercises.map(item => `<span class="tag">${item.name} · ${item.usesThisWeek} usos</span>`).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Biblioteca global de treinos</h3>
            <div class="tag-cloud">
              ${metrics.mostClonedWorkouts.map(item => `<span class="tag">${item.name} · ${item.clonesThisWeek} clones</span>`).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Gestão de mídia de exercícios</h3>
            <div class="invoice-list">
              ${mediaPending.slice(0, 6).map(exercise => `<div class="invoice-row">
                <div><strong>${exercise.name}</strong><span>${exercise.visualType}</span></div>
                <span class="student-status warning">${exercise.visualStatus}</span>
              </div>`).join('') || '<div class="activity-item">Sem mídias pendentes.</div>'}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Saúde técnica do sistema</h3>
            <div class="settings-list compact">
              ${Object.entries(metrics.systemHealthMock || {}).map(([key, value]) => `
                <div class="settings-row"><span class="settings-label">${key}</span><span class="settings-value">${value}</span></div>
              `).join('')}
            </div>
          </section>
          <section class="section-block admin-logs-block">
            <h3 class="section-title">Logs mockados</h3>
            <div class="activity-list">
              ${(metrics.logsMock || []).map(log => `<div class="activity-item"><span class="activity-time">${formatEventTime(log.createdAt)}</span><span>${log.level.toUpperCase()} · ${log.message}</span></div>`).join('')}
            </div>
          </section>
        </div>
      </div>
    `;
  },

  renderAdminUsers() {
    const tbody = $('view-admin-users').querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = Object.entries(DataStore.data.users).map(([email, user]) => {
        return `<tr>
          <td>${email}</td>
          <td><span class="role-badge ${user.role}">${user.roleLabel || user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
          <td><span class="status-active">Ativo</span></td>
        </tr>`;
      }).join('');
    }
  },

  renderProfOverview() {
    const view = $('view-prof-overview');
    const profId = state.user.professionalId;
    const students = DataStore.getStudentsByProfessional(profId);
    const summary = DataStore.getProfessorDashboardSummary(profId);
    const upcomingInvoices = DataStore.getUpcomingInvoices(profId);
    const overdueInvoices = DataStore.getOverdueInvoices(profId);
    const library = DataStore.getWorkoutLibrary(profId).slice(0, 4);
    const criticalFeedbacks = DataStore.getCriticalFeedbacksByProfessional(profId);
    const attentionList = DataStore.getStudentAttentionList(profId);
    const progressing = students
      .map(student => ({ student, summary: DataStore.getProgressSummaryByStudent(student.id) }))
      .sort((a, b) => b.summary.adherenceRate - a.summary.adherenceRate);

    view.innerHTML = `
      <div class="prof-dashboard">
        <section class="prof-hero">
          <div>
            <span class="landing-card-label">Cockpit do professor</span>
            <h2>Olá, ${state.user.name}</h2>
            <p>Prioridades, alunos, treino e cobrança no mesmo painel.</p>
          </div>
          <div class="prof-action-bar">
            <button class="btn btn-primary" onclick="App.openStudentForm('new')">Novo aluno</button>
            <button class="btn btn-ghost" onclick="App.navigate('prof-criar-treino')">Criar treino</button>
            <button class="btn btn-ghost" onclick="App.navigate('prof-feedbacks')">Ver feedbacks</button>
          </div>
        </section>

        <div class="stats-grid stats-grid-six">
          ${renderStatCard('Alunos ativos', summary.activeStudents)}
          ${renderStatCard('Em atenção', summary.attentionStudents, summary.attentionStudents ? 'warning' : '')}
          ${renderStatCard('Treinos hoje', summary.workoutsToday)}
          ${renderStatCard('Feedbacks críticos', summary.criticalFeedbacks, summary.criticalFeedbacks ? 'danger' : '')}
          ${renderStatCard('Cobranças vencidas', summary.overdueInvoices, summary.overdueInvoices ? 'danger' : '')}
          ${renderStatCard('Adesão média', `${summary.averageAdherence}%`)}
        </div>

        <section class="section-block priority-band">
          <div class="section-heading-row">
            <h3 class="section-title">Atenção agora</h3>
            <span>${attentionList.length} prioridade${attentionList.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="priority-grid">
            ${attentionList.slice(0, 5).map(item => `
              <article class="alert-card ${item.priority > 2 ? 'danger' : 'warning'}">
                <div>
                  <strong>${item.student.name}</strong>
                  <p>${item.reasons.join(' · ')}</p>
                </div>
                ${renderStatusBadge(riskLabel(item.student, item.summary), riskTone(item.student, item.summary))}
                <button class="btn btn-sm btn-primary" onclick="App.openStudentProfile('${item.student.id}')">Ver aluno</button>
              </article>
            `).join('') || '<div class="empty-state">Nenhum aluno em atenção crítica neste momento.</div>'}
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading-row">
            <h3 class="section-title">Alunos em acompanhamento</h3>
            <button class="btn btn-sm btn-ghost" onclick="App.navigate('prof-alunos')">Ver todos</button>
          </div>
          <div class="student-card-grid">
            ${students.slice(0, 6).map(student => {
              const studentSummary = DataStore.getProgressSummaryByStudent(student.id);
              const invoice = DataStore.getInvoicesByStudent(student.id)[0];
              return `
                <article class="smart-student-card">
                  <div class="smart-student-head">
                    <div class="student-avatar">${student.name.charAt(0)}</div>
                    <div><strong>${student.name}</strong><span>${student.goal}</span></div>
                  </div>
                  ${renderProgressBar(studentSummary.adherenceRate, 'Adesão semanal')}
                  <div class="smart-student-meta">
                    ${renderStatusBadge(paymentStatusLabel(student.paymentStatus), statusTone(student.paymentStatus))}
                    ${renderStatusBadge(riskLabel(student, studentSummary), riskTone(student, studentSummary))}
                  </div>
                  <div class="smart-student-facts">
                    <span>Último treino: ${studentSummary.lastActivity ? formatEventTime(studentSummary.lastActivity.createdAt) : 'sem registro'}</span>
                    <span>Última nota: ${studentSummary.lastFeedback ? `${studentSummary.lastFeedback.workoutRating}/5` : '—'}</span>
                  </div>
                  <button class="btn btn-sm btn-primary" onclick="App.openStudentProfile('${student.id}')">Ver aluno</button>
                </article>
              `;
            }).join('')}
          </div>
        </section>

        <div class="ops-grid">
          <section class="section-block">
            <h3 class="section-title">Progresso recente</h3>
            <div class="progress-stack">
              ${progressing.slice(0, 5).map(({ student, summary: studentSummary }) => `
                <div class="progress-mini-row">
                  <div><strong>${student.name}</strong><span>${studentSummary.latest ? studentSummary.latest.strengthTrend : 'sem snapshot'}</span></div>
                  ${renderProgressBar(studentSummary.adherenceRate, 'Frequência')}
                </div>
              `).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Cobranças e vencimentos</h3>
            <div class="invoice-list">
              ${[...overdueInvoices, ...upcomingInvoices].slice(0, 6).map(invoice => {
                const student = DataStore.getStudentById(invoice.studentId);
                return `<div class="invoice-row">
                  <div><strong>${student ? student.name : invoice.studentId}</strong><span>${formatDateBR(invoice.dueDate)} · ${formatCurrencyBR(invoice.amount)}</span></div>
                  <div class="invoice-row-right">${renderStatusBadge(paymentStatusLabel(invoice.status), statusTone(invoice.status))}<button class="btn btn-sm btn-ghost" onclick="App.showToast('Pix mockado gerado para ${student ? student.name : 'aluno'}. Nenhuma transação real foi criada.')">Gerar Pix mockado</button></div>
                </div>`;
              }).join('') || '<div class="empty-state">Sem cobranças em atenção.</div>'}
            </div>
          </section>
        </div>

        <div class="ops-grid">
          <section class="section-block">
            <div class="section-heading-row">
              <h3 class="section-title">Biblioteca e criação de treino</h3>
              <button class="btn btn-sm btn-primary" onclick="App.navigate('prof-criar-treino')">Abrir criação</button>
            </div>
            <div class="workout-template-grid compact">
              ${library.map(workout => `
                <article class="workout-template-card">
                  <strong>${workout.name}</strong>
                  <span>${workout.goal} · ${workout.level} · ${workout.estimatedDurationMinutes} min</span>
                  <button class="btn btn-sm btn-ghost" onclick="App.openWorkoutBuilder('library', '${workout.id}')">Selecionar</button>
                </article>
              `).join('')}
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Feedbacks pós-treino</h3>
            <div class="voice-list">
              ${criticalFeedbacks.slice(0, 4).map(feedback => {
                const student = DataStore.getStudentById(feedback.studentId);
                return `<div class="voice-card critical">
                  <strong>${student ? student.name : feedback.studentId} · ${renderFeedbackRating(feedback.workoutRating)}</strong>
                  <span>${perceivedEffortLabel(feedback.perceivedEffort)} · ${completionStatusLabel(feedback.completionStatus)}${feedback.painReported ? ' · dor: ' + feedback.painLocation : ''}</span>
                  <p>${feedback.comment}</p>
                </div>`;
              }).join('') || '<div class="empty-state">Sem feedback crítico.</div>'}
            </div>
          </section>
        </div>
      </div>
    `;
  },

  renderProfAlunos() {
    const view = $('view-prof-alunos');
    const profId = state.user.professionalId;
    const myStudents = DataStore.getStudentsByProfessional(profId);
    view.querySelector('.page-header').innerHTML = `
      <h2>Alunos</h2>
      <p class="page-sub">Frequência, faltas, progresso, feedbacks e financeiro dos alunos.</p>
      <div class="prof-action-bar">
        <button class="btn btn-primary" onclick="App.openStudentForm('new')">Novo aluno</button>
        <button class="btn btn-ghost" onclick="App.openStudentForm('edit', '${myStudents[0] ? myStudents[0].id : ''}')">Editar aluno</button>
      </div>
    `;
    const studentListEl = $('view-prof-alunos').querySelector('.student-list');
    if (studentListEl) {
      studentListEl.innerHTML = myStudents.map(s => {
        const avatar = s.name.charAt(0);
        const invoice = DataStore.getInvoicesByStudent(s.id)[0];
        const plan = DataStore.data.plans.find(p => p.id === s.planId);
        const schedule = DataStore.getWeeklyScheduleByStudent(s.id);
        const weekSummary = schedule ? Object.values(schedule.days).filter(day => day.type === 'workout').map(day => day.title).join(' · ') : 'Sem grade';
        const summary = DataStore.getProgressSummaryByStudent(s.id);
        const lastFeedback = summary.lastFeedback;
        const status = riskLabel(s, summary);
        const riskClass = status === 'risco alto' ? 'danger' : (status === 'atenção' ? 'warning' : 'active');
        
        return `
          <div class="student-card" data-id="${s.id}">
            <div class="student-avatar">${avatar}</div>
            <div class="student-info">
              <div class="student-name">${s.name}</div>
              <div class="student-meta">${s.goal} · ${s.trainingMode} · ${s.level} · ${plan ? plan.name : 'Sem plano'}</div>
              <div class="student-meta">Semana: ${summary.completedWorkouts} concluídos · ${summary.missedWorkouts} faltas · ${summary.adherenceRate}% adesão · nota média ${summary.averageWorkoutRating}</div>
              <div class="student-meta">Vencimento: ${formatDateBR(s.nextDueDate)} · ${billingFrequencyLabel(s.billingFrequency)} · ${weekSummary}</div>
              <div class="student-notes">${lastFeedback ? `Último feedback: ${lastFeedback.comment}` : (s.notes || '')}</div>
            </div>
            <div class="student-card-actions">
              <span class="student-status ${statusTone(s.paymentStatus)}">${paymentStatusLabel(s.paymentStatus)}</span>
              <span class="student-status ${riskClass}">${status}</span>
              <button class="btn btn-sm btn-primary" onclick="App.openStudentProfile('${s.id}')">Perfil completo</button>
              <button class="btn btn-sm btn-ghost" onclick="App.openStudentForm('edit', '${s.id}')">Editar aluno</button>
              ${invoice ? `<button class="btn btn-sm btn-ghost" onclick="App.cloneWorkoutMock('lib-01', '${s.id}')">Clonar treino</button>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  },

  renderProfCriarTreino() {
    const view = $('view-prof-criar-treino');
    if (!view) return;
    const profId = state.user.professionalId;
    const students = DataStore.getStudentsForCloneTarget(profId);
    const library = DataStore.getWorkoutTemplatesForLibrary({});
    const systemCount = DataStore.getSystemWorkoutLibrary().length;
    const professionalCount = DataStore.getProfessionalWorkoutLibrary(profId).length;
    const sourceWorkouts = DataStore.data.prescribedWorkouts.filter(workout => workout.professionalId === profId);

    view.innerHTML = `
      <div class="page-header">
        <h2>Criar treino</h2>
        <p class="page-sub">Biblioteca primeiro, clonagem depois, voz/texto como alternativa de rascunho.</p>
      </div>
      <div class="workout-builder">
        <div class="builder-mode-tabs" role="tablist" aria-label="Modos de criação de treino">
          <button class="builder-mode active" data-mode="library" onclick="App.switchWorkoutBuilderMode('library')">Selecionar da biblioteca</button>
          <button class="builder-mode" data-mode="clone" onclick="App.switchWorkoutBuilderMode('clone')">Clonar existente</button>
          <button class="builder-mode" data-mode="voice" onclick="App.switchWorkoutBuilderMode('voice')">Criar por voz/texto</button>
        </div>

        <section class="builder-panel active" data-builder-panel="library">
          <div class="builder-summary-row">
            ${renderStatCard('Treinos do sistema', systemCount)}
            ${renderStatCard('Treinos do professor', professionalCount)}
            ${renderStatCard('Modelos filtráveis', library.length)}
          </div>
          <form class="library-filter-grid" onsubmit="event.preventDefault(); App.applyWorkoutLibraryFilters(this);">
            <label>Objetivo
              <select name="goal">
                <option value="">Todos</option>
                <option value="Hipertrofia">Hipertrofia</option>
                <option value="Emagrecimento">Emagrecimento</option>
                <option value="Forca">Força</option>
                <option value="Condicionamento">Condicionamento</option>
              </select>
            </label>
            <label>Grupo muscular
              <select name="muscle">
                <option value="">Todos</option>
                <option value="peito">Peito</option>
                <option value="costas">Costas</option>
                <option value="perna">Pernas</option>
                <option value="ombro">Ombros</option>
              </select>
            </label>
            <label>Nível
              <select name="level">
                <option value="">Todos</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </label>
            <label>Duração máxima
              <select name="duration">
                <option value="">Todas</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="75">75 min</option>
              </select>
            </label>
            <label>Equipamento
              <select name="equipment">
                <option value="">Todos</option>
                <option value="halter">Halter</option>
                <option value="barra">Barra</option>
                <option value="maquina">Máquina</option>
                <option value="peso corporal">Peso corporal</option>
              </select>
            </label>
            <label>Local
              <select name="location">
                <option value="">Todos</option>
                <option value="academia">Academia</option>
                <option value="casa">Casa</option>
                <option value="condominio">Condomínio</option>
              </select>
            </label>
            <button class="btn btn-primary" type="submit">Filtrar biblioteca</button>
          </form>
          <div id="workout-library-results" class="workout-template-grid">
            ${this.renderWorkoutTemplateCards(library, students)}
          </div>
        </section>

        <section class="builder-panel" data-builder-panel="clone">
          <form class="mock-form clone-form" onsubmit="event.preventDefault(); App.cloneWorkoutFromForm(this);">
            <div class="form-grid">
              <label>Aluno de origem
                <select name="sourceStudentId" onchange="App.refreshCloneWorkoutOptions(this.value)">
                  ${students.map(student => `<option value="${student.id}">${student.name}</option>`).join('')}
                </select>
              </label>
              <label>Treino de origem
                <select name="sourceWorkoutId" id="clone-source-workout">
                  ${sourceWorkouts.filter(workout => workout.studentId === (students[0] ? students[0].id : '')).map(workout => `<option value="${workout.id}">${workout.title}</option>`).join('')}
                </select>
              </label>
              <label>Aluno de destino
                <select name="targetStudentId">
                  ${students.map(student => `<option value="${student.id}">${student.name}</option>`).join('')}
                </select>
              </label>
              <label>Dia da semana
                <select name="targetDay">
                  <option value="monday">Segunda</option>
                  <option value="tuesday">Terça</option>
                  <option value="wednesday">Quarta</option>
                  <option value="thursday">Quinta</option>
                  <option value="friday">Sexta</option>
                  <option value="saturday">Sábado</option>
                  <option value="sunday">Domingo</option>
                </select>
              </label>
            </div>
            <div class="draft-actions">
              <button class="btn btn-primary" type="submit">Confirmar clonagem mockada</button>
              <button class="btn btn-ghost" type="button" onclick="App.showToast('Clonagem cancelada. Nenhum treino foi criado.')">Cancelar</button>
            </div>
          </form>
          <div id="clone-confirmation" class="confirmation-panel hidden"></div>
        </section>

        <section class="builder-panel" data-builder-panel="voice">
          <div class="treino-creator">
            <div class="demo-warning">Voz/texto gera rascunho estruturado. Revise antes de publicar.</div>
            <div class="creator-input-area">
              <textarea id="treino-text-input" class="treino-textarea" placeholder="Ex: Supino reto 4x8 90seg, remada baixa 3x10 60seg, prancha 3x40s"></textarea>
              <div class="creator-actions">
                <button id="btn-organizar-treino" class="btn btn-primary" type="button" onclick="App.parseTreino()">Organizar rascunho</button>
                <button id="btn-limpar-treino" class="btn btn-ghost" type="button" onclick="App.clearTreino()">Limpar</button>
              </div>
            </div>
            <div id="treino-draft-area" class="treino-draft-area hidden">
              <h3 class="section-title">Rascunho estruturado</h3>
              <div id="treino-draft-content" class="treino-draft-content"></div>
              <div class="draft-actions">
                <button id="btn-salvar-treino" class="btn btn-primary" type="button" onclick="App.saveTreino()">Salvar rascunho local</button>
                <button id="btn-editar-treino" class="btn btn-ghost" type="button" onclick="App.editTreino()">Editar texto</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  },

  renderWorkoutTemplateCards(library, students) {
    return library.map(workout => {
      const exercises = (workout.exerciseBlocks || []).flatMap(block => block.exercises || []);
      const firstStudent = students[0];
      return `
        <article class="workout-template-card">
          <div class="template-head">
            <strong>${workout.name}</strong>
            ${renderStatusBadge(workout.isSystemTemplate ? 'Sistema' : 'Professor', workout.isSystemTemplate ? 'active' : 'warning')}
          </div>
          <span>${workout.goal} · ${workout.level} · ${workout.estimatedDurationMinutes} min</span>
          <div class="template-exercises">
            ${exercises.slice(0, 5).map(item => {
              const exercise = DataStore.getExerciseById(item.exerciseId);
              return `<div><span>${exercise ? exercise.name : item.exerciseId}</span><strong>${item.sets}x${item.reps}</strong></div>`;
            }).join('')}
          </div>
          <div class="template-actions">
            <button class="btn btn-sm btn-ghost" onclick="App.previewWorkoutTemplate('${workout.id}')">Visualizar</button>
            <button class="btn btn-sm btn-primary" onclick="App.assignLibraryWorkoutMock('${workout.id}', '${firstStudent ? firstStudent.id : ''}', 'monday')">Atribuir ao aluno</button>
          </div>
        </article>
      `;
    }).join('') || '<div class="empty-state">Nenhum treino encontrado com esses filtros.</div>';
  },

  switchWorkoutBuilderMode(mode) {
    document.querySelectorAll('.builder-mode').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
    document.querySelectorAll('[data-builder-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.builderPanel === mode));
  },

  applyWorkoutLibraryFilters(form) {
    const filters = Object.fromEntries(new FormData(form).entries());
    const profId = state.user.professionalId;
    const students = DataStore.getStudentsForCloneTarget(profId);
    const results = DataStore.getWorkoutTemplatesForLibrary(filters);
    const target = $('workout-library-results');
    if (target) target.innerHTML = this.renderWorkoutTemplateCards(results, students);
  },

  previewWorkoutTemplate(workoutId) {
    const workout = DataStore.data.workoutLibrary.find(item => item.id === workoutId);
    if (!workout) return;
    const modal = this.ensureModal();
    $('ops-modal-content').innerHTML = `
      <h2>${workout.name}</h2>
      <p class="page-sub">${workout.goal} · ${workout.level} · ${workout.estimatedDurationMinutes} min</p>
      <div class="workout-step-list">
        ${(workout.exerciseBlocks || []).map(block => `
          <section class="section-block">
            <h3 class="section-title">${block.blockName}</h3>
            ${(block.exercises || []).map(item => {
              const exercise = DataStore.getExerciseById(item.exerciseId);
              return `<div class="workout-step-card">
                <div><strong>${exercise ? exercise.name : item.exerciseId}</strong><span>${exercise ? exercise.primaryMuscle : 'grupo'} · ${item.notes || ''}</span></div>
                <div class="step-prescription">${item.sets} séries · ${item.reps} reps · ${item.restSeconds}s</div>
              </div>`;
            }).join('')}
          </section>
        `).join('')}
      </div>
    `;
    modal.classList.remove('hidden');
  },

  assignLibraryWorkoutMock(workoutId, targetStudentId, targetDay) {
    if (!targetStudentId) {
      this.showToast('Selecione um aluno antes de atribuir treino.');
      return;
    }
    const cloned = this.cloneWorkoutMock(workoutId, targetStudentId, targetDay);
    if (cloned) this.showToast(`Treino clonado para ${DataStore.getStudentById(targetStudentId).name}. Revise antes de publicar.`);
  },

  refreshCloneWorkoutOptions(sourceStudentId) {
    const select = $('clone-source-workout');
    if (!select) return;
    const workouts = DataStore.getWorkoutsByStudent(sourceStudentId);
    select.innerHTML = workouts.map(workout => `<option value="${workout.id}">${workout.title}</option>`).join('');
  },

  cloneWorkoutFromForm(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const cloned = DataStore.cloneWorkoutMock(data.sourceWorkoutId, data.targetStudentId, data.targetDay);
      const targetStudent = DataStore.getStudentById(data.targetStudentId);
      const confirmation = $('clone-confirmation');
      if (cloned && confirmation) {
        confirmation.classList.remove('hidden');
        confirmation.innerHTML = `Treino clonado para ${targetStudent ? targetStudent.name : 'aluno destino'}. Revise antes de publicar.`;
      }
      this.showToast(`Treino clonado para ${targetStudent ? targetStudent.name : 'aluno destino'}. Revise antes de publicar.`);
    } catch (error) {
      this.showToast(error.message || 'Não foi possível clonar o treino.');
    }
  },

  renderProfFeedbacks() {
    const feedbackListEl = $('view-prof-feedbacks').querySelector('.feedback-list');
    if (feedbackListEl) {
      const profId = state.user.professionalId;
      const postFeedbacks = DataStore.data.postWorkoutFeedbacks
        .filter(feedback => feedback.professionalId === profId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const critical = postFeedbacks.filter(feedback => feedback.requiresReview);
      const averageRating = postFeedbacks.length
        ? (postFeedbacks.reduce((sum, feedback) => sum + Number(feedback.workoutRating || 0), 0) / postFeedbacks.length).toFixed(1)
        : '—';

      $('view-prof-feedbacks').querySelector('.page-header').innerHTML = `
        <h2>Feedbacks pós-treino</h2>
        <p class="page-sub">Notas, esforço percebido, dor, conclusão e comentários livres dos alunos.</p>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">${postFeedbacks.length}</div><div class="stat-label">Feedbacks recebidos</div></div>
          <div class="stat-card"><div class="stat-value">${critical.length}</div><div class="stat-label">Críticos</div></div>
          <div class="stat-card"><div class="stat-value">${averageRating}</div><div class="stat-label">Nota média</div></div>
          <div class="stat-card"><div class="stat-value">${DataStore.getStudentsAtRisk(profId).length}</div><div class="stat-label">Precisam de ajuste</div></div>
        </div>
      `;

      if (postFeedbacks.length === 0) {
        feedbackListEl.innerHTML = '<div class="feedback-card">Nenhum feedback recebido ainda.</div>';
      } else {
        feedbackListEl.innerHTML = postFeedbacks.map(f => {
          const student = DataStore.getStudentById(f.studentId);
          const studentName = student ? student.name : 'Aluno';

          return `
            <div class="feedback-card ${f.requiresReview ? 'critical' : ''}">
              <div class="fb-header">
                <span class="fb-student">${studentName}</span>
                <span class="fb-date">${formatEventTime(f.createdAt)}</span>
              </div>
              <div class="fb-exercise">Nota ${f.workoutRating}/5 · ${perceivedEffortLabel(f.perceivedEffort)} · ${completionStatusLabel(f.completionStatus)}</div>
              <div class="fb-content">"${f.comment}"</div>
              <div class="fb-tags">
                <span class="tag ${f.requiresReview ? 'tag-warn' : 'tag-success'}">${f.requiresReview ? 'Crítico/revisar' : 'Sem alerta'}</span>
                <span class="tag">Humor: ${f.mood}</span>
                ${f.painReported ? `<span class="tag tag-warn">Dor: ${f.painLocation || 'não informado'}</span>` : ''}
                <button class="tag tag-button" onclick="App.openStudentProfile('${f.studentId}')">Abrir perfil</button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  cloneWorkoutMock(sourceWorkoutId, targetStudentId, targetDay = 'friday') {
    try {
      const cloned = DataStore.cloneWorkoutMock(sourceWorkoutId, targetStudentId, targetDay);
      if (state.currentView) this.renderView(state.currentView);
      this.showToast(`Treino clonado para ${DataStore.getStudentById(targetStudentId).name}. Revise antes de publicar.`);
      return cloned;
    } catch (error) {
      this.showToast(error.message || 'Não foi possível clonar o treino.');
      return null;
    }
  },

  showToast(message) {
    let toast = $('clone-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'clone-toast';
      toast.className = 'clone-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.add('hidden'), 2600);
  },

  bindOperationalForms() {
    document.addEventListener('submit', event => {
      if (event.target && event.target.id === 'student-form-mock') {
        event.preventDefault();
        this.saveStudentForm(event.target);
      }
      if (event.target && event.target.id === 'post-workout-feedback-form') {
        event.preventDefault();
        this.savePostWorkoutFeedback(event.target);
      }
    });
  },

  ensureModal() {
    let modal = $('ops-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ops-modal';
      modal.className = 'ops-modal hidden';
      modal.innerHTML = '<div class="ops-modal-panel"><button class="ops-modal-close" onclick="App.closeModal()" aria-label="Fechar">×</button><div id="ops-modal-content"></div></div>';
      document.body.appendChild(modal);
    }
    return modal;
  },

  closeModal() {
    const modal = $('ops-modal');
    if (modal) modal.classList.add('hidden');
  },

  openStudentProfile(studentId) {
    const student = DataStore.getStudentById(studentId);
    if (!student) return;
    const plan = DataStore.data.plans.find(item => item.id === student.planId);
    const invoice = DataStore.getInvoicesByStudent(studentId).find(item => ['open', 'due_soon', 'overdue'].includes(item.status));
    const assessment = DataStore.getAssessmentsByStudent(studentId)[0];
    const schedule = DataStore.getWeeklyScheduleByStudent(studentId);
    const weeklyPlan = DataStore.getStudentWeeklyPlan(studentId);
    const summary = DataStore.getProgressSummaryByStudent(studentId);
    const progress = summary.latest;
    const feedbacks = DataStore.getPostWorkoutFeedbacksByStudent(studentId);
    const workouts = DataStore.getWorkoutsByStudent(studentId);
    const attendance = DataStore.getAttendanceByStudent(studentId).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const modal = this.ensureModal();
    $('ops-modal-content').innerHTML = `
      <div class="student-profile-detail">
        <div class="profile-detail-header">
          <div>
            <span class="landing-card-label">Perfil completo do aluno</span>
            <h2>${student.name}</h2>
            <p>${student.goal} · ${student.level} · ${student.trainingMode}</p>
            <div class="smart-student-meta">
              ${renderStatusBadge(riskLabel(student, summary), riskTone(student, summary))}
              ${renderStatusBadge(paymentStatusLabel(student.paymentStatus), statusTone(student.paymentStatus))}
              ${renderStatusBadge(`${summary.adherenceRate}% adesão`, summary.adherenceRate < 70 ? 'warning' : 'active')}
            </div>
          </div>
          <div class="profile-detail-actions">
            <button class="btn btn-primary" onclick="App.openStudentForm('edit', '${student.id}')">Editar aluno</button>
            <button class="btn btn-ghost" onclick="App.cloneWorkoutMock('lib-01', '${student.id}')">Clonar treino</button>
            <button class="btn btn-ghost" onclick="App.showToast('Cobrança Pix mockada pronta para ${student.name}.')">Gerar cobrança Pix mockada</button>
          </div>
        </div>
        <div class="profile-tabs" role="tablist" aria-label="Seções do perfil do aluno">
          ${[
            ['overview', 'Visão geral'],
            ['workouts', 'Treinos'],
            ['progress', 'Progresso'],
            ['feedbacks', 'Feedbacks'],
            ['assessment', 'Avaliação'],
            ['finance', 'Financeiro']
          ].map(([tab, label], index) => `<button class="profile-tab ${index === 0 ? 'active' : ''}" data-profile-tab="${tab}" onclick="App.switchProfileTab('${tab}')">${label}</button>`).join('')}
        </div>
        <div class="profile-detail-grid">
          <section class="section-block profile-tab-panel active" data-profile-panel="overview"><h3 class="section-title">Dados básicos</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Objetivo</span><span class="settings-value">${student.goal}</span></div>
              <div class="settings-row"><span class="settings-label">Modalidade</span><span class="settings-value">${student.trainingMode}</span></div>
              <div class="settings-row"><span class="settings-label">Restrições</span><span class="settings-value">${student.restrictions.length ? student.restrictions.join(', ') : 'Nenhuma'}</span></div>
              <div class="settings-row"><span class="settings-label">Contexto</span><span class="settings-value">${student.preferredGymContext}</span></div>
            </div>
          </section>
          <section class="section-block profile-tab-panel" data-profile-panel="assessment"><h3 class="section-title">Anamnese</h3>
            <p class="card-body">${assessment ? assessment.notes : 'Sem anamnese mockada.'}</p>
            <div class="tag-cloud"><span class="tag">Disponibilidade: ${assessment ? assessment.weeklyAvailability : '—'}</span><span class="tag">Consentimento mockado: ${assessment && assessment.consentMock ? 'sim' : '—'}</span></div>
          </section>
          <section class="section-block profile-tab-panel" data-profile-panel="assessment"><h3 class="section-title">Avaliação física</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Peso</span><span class="settings-value">${assessment && assessment.physicalEvaluationMock ? assessment.physicalEvaluationMock.weightKgMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Altura</span><span class="settings-value">${assessment && assessment.physicalEvaluationMock ? assessment.physicalEvaluationMock.heightCmMock + ' cm' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">IMC</span><span class="settings-value">${assessment && assessment.physicalEvaluationMock ? assessment.physicalEvaluationMock.bmiMock : '—'}</span></div>
            </div>
          </section>
          <section class="section-block profile-tab-panel" data-profile-panel="assessment"><h3 class="section-title">Bioimpedância demonstrativa</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Gordura</span><span class="settings-value">${progress ? progress.bodyFatPercentageMock + '%' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Massa magra</span><span class="settings-value">${progress ? progress.leanMassMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Água corporal</span><span class="settings-value">${progress ? progress.bodyWaterPercentageMock + '%' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Tendência</span><span class="settings-value">${progress ? progress.bodyTrend : '—'}</span></div>
            </div>
          </section>
          <section class="section-block profile-tab-panel active" data-profile-panel="overview"><h3 class="section-title">Frequência e adesão</h3>
            <div class="stats-grid">
              <div class="stat-card"><div class="stat-value">${summary.completedWorkouts}</div><div class="stat-label">Concluídos</div></div>
              <div class="stat-card"><div class="stat-value">${summary.missedWorkouts}</div><div class="stat-label">Perdidos</div></div>
              <div class="stat-card"><div class="stat-value">${summary.adherenceRate}%</div><div class="stat-label">Adesão</div></div>
              <div class="stat-card"><div class="stat-value">${summary.averageWorkoutRating}</div><div class="stat-label">Nota média</div></div>
            </div>
          </section>
          <section class="section-block profile-tab-panel" data-profile-panel="progress"><h3 class="section-title">Progresso</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Volume mockado</span><span class="settings-value">${progress ? progress.totalVolumeMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">RPE médio</span><span class="settings-value">${progress ? progress.averageRpe : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Força</span><span class="settings-value">${progress ? progress.strengthTrend : '—'}</span></div>
            </div>
          </section>
          <section class="section-block profile-tab-panel" data-profile-panel="workouts"><h3 class="section-title">Treino</h3>
            <div class="week-grid-mini">
              ${schedule ? Object.entries(schedule.days).map(([day, item]) => `<div class="week-day"><strong>${getDayLabel(day)}</strong><span>${item.title}</span></div>`).join('') : ''}
            </div>
            <div class="tag-cloud">${workouts.slice(0, 5).map(workout => `<span class="tag">${workout.title} · ${workout.status}</span>`).join('')}</div>
          </section>
          <section class="section-block profile-tab-panel" data-profile-panel="finance"><h3 class="section-title">Financeiro</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Plano</span><span class="settings-value">${plan ? plan.name : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Periodicidade</span><span class="settings-value">${billingFrequencyLabel(student.billingFrequency)}</span></div>
              <div class="settings-row"><span class="settings-label">Status</span><span class="settings-value">${paymentStatusLabel(student.paymentStatus)}</span></div>
              <div class="settings-row"><span class="settings-label">Pix aberto</span><span class="settings-value">${invoice ? invoice.pixCopyPasteMock : '—'}</span></div>
            </div>
          </section>
          <section class="section-block profile-full-row profile-tab-panel" data-profile-panel="feedbacks"><h3 class="section-title">Feedbacks e faltas recentes</h3>
            <div class="ops-grid">
              <div class="voice-list">${feedbacks.slice(0, 4).map(feedback => `<div class="voice-card ${feedback.requiresReview ? 'critical' : ''}"><strong>Nota ${feedback.workoutRating}/5 · ${perceivedEffortLabel(feedback.perceivedEffort)}</strong><p>${feedback.comment}</p></div>`).join('')}</div>
              <div class="activity-list">${attendance.slice(0, 6).map(event => `<div class="activity-item"><span class="activity-time">${formatEventTime(event.createdAt)}</span><span>${event.eventType} · ${event.notes}</span></div>`).join('')}</div>
            </div>
          </section>
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  },

  switchProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(button => {
      button.classList.toggle('active', button.dataset.profileTab === tab);
    });
    document.querySelectorAll('.profile-tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.profilePanel === tab);
    });
  },

  openStudentForm(mode, studentId = null) {
    const student = studentId ? DataStore.getStudentById(studentId) : null;
    const profId = state.user.professionalId;
    const plans = DataStore.getPlansByProfessional(profId);
    const schedule = student ? DataStore.getWeeklyScheduleByStudent(student.id) : null;
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const selectedDays = schedule ? dayKeys.filter(day => schedule.days[day] && schedule.days[day].type !== 'rest') : ['monday', 'wednesday', 'friday'];
    const objectives = ['hipertrofia', 'emagrecimento', 'força', 'condicionamento', 'saúde/postura', 'retorno aos treinos', 'performance', 'outro'];
    const restrictions = student && student.restrictions ? student.restrictions : [];
    const hasRestriction = value => restrictions.some(item => String(item).toLowerCase().includes(value));
    const modal = this.ensureModal();
    $('ops-modal-content').innerHTML = `
      <h2>${mode === 'edit' ? 'Editar aluno' : 'Novo aluno'}</h2>
      <p class="page-sub">Protótipo: cadastro simulado. Nenhum dado real foi salvo em servidor.</p>
      <form id="student-form-mock" class="mock-form" data-mode="${mode}" data-student-id="${student ? student.id : ''}">
        <div class="form-grid">
          <label>Nome<input name="name" required value="${student ? student.name : ''}"></label>
          <label>Objetivo<select name="goal">
            ${objectives.map(option => `<option value="${option}" ${student && String(student.goal).toLowerCase().includes(option) ? 'selected' : ''}>${option}</option>`).join('')}
          </select></label>
          <label>Frequência semanal<select name="weeklyFrequency">
            ${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}" ${selectedDays.length === n ? 'selected' : ''}>${n}x</option>`).join('')}
          </select></label>
          <label>Plano<select name="planId">${plans.map(plan => `<option value="${plan.id}" ${student && student.planId === plan.id ? 'selected' : ''}>${plan.name}</option>`).join('')}</select></label>
          <label>Periodicidade<select name="billingFrequency">
            ${[
              ['weekly', 'semanal'],
              ['biweekly', 'quinzenal'],
              ['monthly', 'mensal'],
              ['quarterly', 'trimestral'],
              ['semiannual', 'semestral'],
              ['annual', 'anual'],
              ['single', 'avulso']
            ].map(([value, label]) => `<option value="${value}" ${student && student.billingFrequency === value ? 'selected' : ''}>${label}</option>`).join('')}
          </select></label>
          <label>Vencimento<input name="nextDueDate" type="date" value="${student ? student.nextDueDate : '2026-06-25'}"></label>
        </div>
        <div class="smart-form-section">
          <span class="form-section-label">Modalidade</span>
          <div class="segmented-control">
            ${['presencial', 'online', 'hibrido'].map(value => `
              <label><input type="radio" name="trainingMode" value="${value}" ${(student ? student.trainingMode : 'hibrido') === value ? 'checked' : ''}><span>${value === 'hibrido' ? 'híbrido' : value}</span></label>
            `).join('')}
          </div>
        </div>
        <div class="smart-form-section">
          <span class="form-section-label">Nível</span>
          <div class="segmented-control">
            ${['iniciante', 'intermediario', 'avancado'].map(value => `
              <label><input type="radio" name="level" value="${value}" ${(student ? student.level : 'iniciante') === value ? 'checked' : ''}><span>${value === 'avancado' ? 'avançado' : value}</span></label>
            `).join('')}
          </div>
        </div>
        <div class="smart-form-section">
          <span class="form-section-label">Dias de treino e tipo por dia</span>
          <div class="day-picker-grid">
            ${dayKeys.map(day => {
              const item = schedule && schedule.days[day] ? schedule.days[day] : null;
              return `
                <div class="day-picker-item">
                  <label class="checkbox-row"><input type="checkbox" name="weeklyDays" value="${day}" ${selectedDays.includes(day) ? 'checked' : ''}> ${getDayLabel(day)}</label>
                  <select name="dayType_${day}">
                    ${['workout', 'rest', 'cardio', 'checkin', 'assessment'].map(type => `<option value="${type}" ${item && item.type === type ? 'selected' : ''}>${getWorkoutTypeLabel(type)}</option>`).join('')}
                  </select>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        <div class="smart-form-section">
          <span class="form-section-label">Canal de lembrete</span>
          <div class="checkbox-group">
            ${[
              ['whatsapp-mock', 'WhatsApp mockado'],
              ['email-mock', 'e-mail mockado'],
              ['in-app', 'app']
            ].map(([value, label]) => `<label class="checkbox-row"><input type="checkbox" name="reminderChannels" value="${value}" ${(!student && value === 'in-app') || (student && student.preferredReminderChannel === value) ? 'checked' : ''}> ${label}</label>`).join('')}
          </div>
        </div>
        <div class="smart-form-section">
          <span class="form-section-label">Restrições</span>
          <div class="checkbox-group">
            ${[
              ['joelho', 'joelho'],
              ['ombro', 'ombro'],
              ['coluna', 'coluna'],
              ['punho', 'punho'],
              ['nenhuma', 'nenhuma'],
              ['outra', 'outra']
            ].map(([value, label]) => `<label class="checkbox-row"><input type="checkbox" name="restrictions" value="${value}" ${hasRestriction(value) ? 'checked' : ''}> ${label}</label>`).join('')}
          </div>
        </div>
        <label>Observações<textarea name="notes">${student ? student.notes : ''}</textarea></label>
        <div class="draft-actions">
          <button class="btn btn-primary" type="submit">${mode === 'edit' ? 'Salvar edição mockada' : 'Salvar novo aluno mockado'}</button>
          <button class="btn btn-ghost" type="button" onclick="App.closeModal()">Cancelar</button>
        </div>
      </form>
    `;
    modal.classList.remove('hidden');
  },

  saveStudentForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.weeklyDays = formData.getAll('weeklyDays');
    data.restrictions = formData.getAll('restrictions').filter(item => item !== 'nenhuma');
    data.reminderChannels = formData.getAll('reminderChannels');
    data.preferredReminderChannel = data.reminderChannels[0] || 'in-app';
    data.dayTypes = {};
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach(day => {
      data.dayTypes[day] = formData.get(`dayType_${day}`) || 'rest';
      delete data[`dayType_${day}`];
    });
    data.professionalId = state.user.professionalId;
    if (form.dataset.mode === 'edit') {
      DataStore.updateStudentDraftMock(form.dataset.studentId, data);
      this.showToast('Cadastro simulado atualizado. Nenhum dado real foi salvo em servidor.');
    } else {
      DataStore.saveStudentDraftMock(data);
      this.showToast('Cadastro simulado. Nenhum dado real foi salvo em servidor.');
    }
    this.closeModal();
    if (state.currentView) this.renderView(state.currentView);
  },

  renderAlunoOverview() {
    const studentId = state.user.studentId;
    const studentObj = DataStore.getStudentById(studentId);
    const studentName = studentObj ? studentObj.name.split(' ')[0] : state.user.name;
    const plan = studentObj ? DataStore.data.plans.find(p => p.id === studentObj.planId) : null;
    const invoice = DataStore.getInvoicesByStudent(studentId)
      .find(item => ['open', 'due_soon', 'overdue', 'scheduled'].includes(item.status))
      || DataStore.getInvoicesByStudent(studentId)[0];
    const schedule = DataStore.getWeeklyScheduleByStudent(studentId);
    const weeklyPlan = DataStore.getStudentWeeklyPlan(studentId);
    const summary = DataStore.getProgressSummaryByStudent(studentId);
    const progress = summary.latest;
    const postFeedbacks = DataStore.getPostWorkoutFeedbacksByStudent(studentId);

    const subEl = $('view-aluno-overview').querySelector('.page-sub');
    if (subEl) subEl.textContent = `Olá, ${studentName}. Sua semana, treino do dia, cobrança mockada e progresso em blocos.`;

    const todayWorkout = DataStore.getTodayWorkout(studentId);

    const workoutPreviewWrap = $('view-aluno-overview').querySelector('.today-workout-preview');
    if (workoutPreviewWrap) {
      workoutPreviewWrap.innerHTML = `
        <div class="ops-grid">
          <section>
            <h3 class="section-title">Plano atual</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Plano</span><span class="settings-value">${plan ? plan.name : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Periodicidade</span><span class="settings-value">${studentObj ? billingFrequencyLabel(studentObj.billingFrequency) : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Status</span><span class="settings-value">${studentObj ? paymentStatusLabel(studentObj.paymentStatus) : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Próximo vencimento</span><span class="settings-value">${studentObj ? formatDateBR(studentObj.nextDueDate) : '—'}</span></div>
            </div>
          </section>
          <section>
            <h3 class="section-title">Cobrança Pix mockada</h3>
            ${invoice ? `
              <div class="pix-panel">
                <div class="mock-qr" aria-label="QR Code Pix demonstrativo"><span>PIX<br>DEMO</span></div>
                <div class="pix-copy">
                  <strong>${formatCurrencyBR(invoice.amount)}</strong>
                  <span>QR Code Pix demonstrativo. Não realizar pagamento real.</span>
                  <code>${invoice.pixCopyPasteMock}</code>
                </div>
              </div>
            ` : '<div class="activity-item">Nenhuma cobrança mockada disponível.</div>'}
          </section>
        </div>
        <div class="demo-warning">Ambiente de demonstração. Não realizar pagamento real.</div>
        <section class="student-week-section">
          <div class="section-heading-row">
            <h3 class="section-title">Minha semana</h3>
            <span>domingo a sábado</span>
          </div>
          ${weeklyPlan.length ? renderWeeklyScheduleStrip(weeklyPlan) : '<div class="activity-item">Sem grade semanal.</div>'}
        </section>
        <div class="ops-grid">
          <section class="today-focus-card">
            <div class="section-heading-row">
              <h3 class="section-title">Treino de hoje</h3>
              ${todayWorkout ? renderStatusBadge('Pronto para iniciar', 'active') : renderStatusBadge('Sem treino', 'warning')}
            </div>
            ${todayWorkout ? `
              <div class="workout-preview-name">${todayWorkout.title}</div>
              <div class="workout-preview-meta">${todayWorkout.exercises.length} exercício${todayWorkout.exercises.length !== 1 ? 's' : ''} · ~${todayWorkout.estimatedDurationMinutes} min</div>
              <button class="btn btn-primary" onclick="App.navigate('aluno-treino')">Iniciar treino</button>
            ` : '<div class="workout-preview-name">Nenhum treino agendado para hoje.</div>'}
          </section>
          <section>
            <h3 class="section-title">Como registrar</h3>
            <div class="workout-step-list compact">
              <div class="workout-step-card"><strong>1. Iniciar</strong><span>Abra o treino do dia.</span></div>
              <div class="workout-step-card"><strong>2. Registrar</strong><span>Carga, reps e RPE por série.</span></div>
              <div class="workout-step-card"><strong>3. Finalizar</strong><span>Envie nota, esforço, dor e comentário.</span></div>
            </div>
          </section>
        </div>
        <div class="ops-grid">
          <section>
            <h3 class="section-title">Minha evolução</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Peso mockado</span><span class="settings-value">${progress ? progress.weightMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Gordura</span><span class="settings-value">${progress ? progress.bodyFatPercentageMock + '%' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Massa magra</span><span class="settings-value">${progress ? progress.leanMassMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="settings-label">Frequência</span><span class="settings-value">${summary.adherenceRate}% adesão</span></div>
            </div>
          </section>
          <section>
            <h3 class="section-title">Meus feedbacks</h3>
            <div class="voice-list">
              ${postFeedbacks.slice(0, 3).map(feedback => `
                <div class="voice-card ${feedback.requiresReview ? 'critical' : ''}">
                  <strong>Nota ${feedback.workoutRating}/5 · ${perceivedEffortLabel(feedback.perceivedEffort)}</strong>
                  <span>${completionStatusLabel(feedback.completionStatus)} · humor: ${feedback.mood}</span>
                  <p>${feedback.comment}</p>
                </div>
              `).join('') || '<div class="activity-item">Você ainda não enviou feedback pós-treino.</div>'}
            </div>
          </section>
        </div>
      `;
    }

    const stats = $('view-aluno-overview').querySelectorAll('.stat-value');
    if (stats.length >= 4) {
      const studentEvents = DataStore.data.workoutEvents.filter(e => e.studentId === studentId);
      const completedCount = studentEvents.filter(e => e.type === 'workout_finished').length;
      
      stats[0].textContent = completedCount + 10;
      stats[1].textContent = `${summary.adherenceRate}%`;
      stats[2].textContent = progress ? progress.strengthTrend : '+2.5kg';
      stats[3].textContent = todayWorkout ? todayWorkout.exercises.reduce((sum, ex) => sum + parseInt(ex.sets), 0) : '0';
    }
  },

  renderAlunoTreino() {
    const studentId = state.user.studentId;
    const todayWorkout = DataStore.getTodayWorkout(studentId);
    const weeklyPlan = DataStore.getStudentWeeklyPlan(studentId);
    
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

    const weekHtml = weeklyPlan.length ? `
      <div class="section-block">
        <h3 class="section-title">Minha semana</h3>
        ${renderWeeklyScheduleStrip(weeklyPlan, true)}
      </div>
    ` : '';

    const exercisesByBlock = [
      ['Aquecimento', state.workout.exercises.slice(0, 1)],
      ['Principal', state.workout.exercises.slice(1, Math.max(2, state.workout.exercises.length - 1))],
      ['Complementar', state.workout.exercises.slice(Math.max(2, state.workout.exercises.length - 1))]
    ].filter(([, items]) => items.length);

    const exercisesHtml = exercisesByBlock.map(([blockName, items]) => `
      <section class="section-block workout-block">
        <div class="section-heading-row">
          <h3 class="section-title">${blockName}</h3>
          <span>${items.length} exercício${items.length !== 1 ? 's' : ''}</span>
        </div>
        ${items.map((ex) => {
          const idx = state.workout.exercises.indexOf(ex);
          const restText = ex.rest >= 60 ? `${Math.floor(ex.rest / 60)} min` : `${ex.rest} seg`;
          const nextEx = state.workout.exercises[idx + 1];
          return `
            <div class="exercise-item workout-step-card" data-index="${idx}">
              <div class="ex-number">${String(idx + 1).padStart(2, '0')}</div>
              <div class="ex-info">
                <div class="ex-name">${ex.name}</div>
                <div class="ex-meta">${ex.muscle} · ${ex.sets} séries · ${ex.reps} reps · ${restText} desc · Carga: ${ex.loadSuggestion}</div>
                ${ex.notes ? `<div class="ex-notes">Obs: ${ex.notes}</div>` : ''}
                ${nextEx ? `<div class="ex-next">Próximo: ${nextEx.name}</div>` : '<div class="ex-next">Último exercício antes do feedback.</div>'}
              </div>
              <button class="btn btn-sm btn-primary" onclick="App.startWorkout(${idx})">Executar</button>
            </div>
          `;
        }).join('')}
      </section>
    `).join('');

    listEl.innerHTML = `${weekHtml}${exercisesHtml}`;
  },

  renderAlunoPerfil() {
    const studentId = state.user.studentId;
    const studentObj = DataStore.getStudentById(studentId);
    const assessment = DataStore.getAssessmentsByStudent(studentId)[0];
    const professional = DataStore.getProfessionalById(studentObj ? studentObj.professionalId : '');
    const plan = studentObj ? DataStore.data.plans.find(p => p.id === studentObj.planId) : null;
    const progress = DataStore.getProgressSummaryByStudent(studentId).latest;

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
        <div class="anamnese-row"><span class="an-label">Plano</span><span class="an-value">${plan ? plan.name : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Vencimento</span><span class="an-value">${studentObj ? formatDateBR(studentObj.nextDueDate) : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Peso mockado</span><span class="an-value">${progress ? progress.weightMock + ' kg' : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Gordura mockada</span><span class="an-value">${progress ? progress.bodyFatPercentageMock + '%' : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">Massa magra mockada</span><span class="an-value">${progress ? progress.leanMassMock + ' kg' : '—'}</span></div>
        <div class="anamnese-row"><span class="an-label">IMC mockado</span><span class="an-value">${progress ? progress.bmiMock : '—'}</span></div>
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
      const summary = DataStore.getProgressSummaryByStudent(studentId);
      const progress = summary.latest;
      const feedbacks = DataStore.getPostWorkoutFeedbacksByStudent(studentId);
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
      const progressHtml = `
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value">${summary.adherenceRate}%</div><div class="stat-label">Frequência</div></div>
          <div class="stat-card"><div class="stat-value">${summary.averageWorkoutRating}</div><div class="stat-label">Nota média</div></div>
          <div class="stat-card"><div class="stat-value">${progress ? progress.weightMock + ' kg' : '—'}</div><div class="stat-label">Peso mockado</div></div>
          <div class="stat-card"><div class="stat-value">${progress ? progress.bodyFatPercentageMock + '%' : '—'}</div><div class="stat-label">Gordura mockada</div></div>
        </div>
        <div class="ops-grid">
          <section class="section-block">
            <h3 class="section-title">Bioimpedância demonstrativa</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="an-label">Massa magra</span><span class="an-value">${progress ? progress.leanMassMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="an-label">Massa gorda</span><span class="an-value">${progress ? progress.fatMassMock + ' kg' : '—'}</span></div>
              <div class="settings-row"><span class="an-label">Água corporal</span><span class="an-value">${progress ? progress.bodyWaterPercentageMock + '%' : '—'}</span></div>
              <div class="settings-row"><span class="an-label">Tendência</span><span class="an-value">${progress ? progress.bodyTrend : '—'}</span></div>
            </div>
          </section>
          <section class="section-block">
            <h3 class="section-title">Percepção de esforço</h3>
            <div class="voice-list">
              ${feedbacks.slice(0, 4).map(feedback => `<div class="voice-card ${feedback.requiresReview ? 'critical' : ''}"><strong>Nota ${feedback.workoutRating}/5 · ${perceivedEffortLabel(feedback.perceivedEffort)}</strong><span>${formatEventTime(feedback.createdAt)}</span><p>${feedback.comment}</p></div>`).join('')}
            </div>
          </section>
        </div>
      `;
      if (items.length === 0) {
        listEl.innerHTML = `
          ${progressHtml}
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
        listEl.innerHTML = progressHtml + items.map(([name, maxLoad]) => {
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
    state.workout.finishedWorkoutId = state.workout.activeWorkoutId;
    
    OfflineQueue.push({
      type: 'workout_finished',
      workoutId: state.workout.finishedWorkoutId,
      online: navigator.onLine
    });

    this.openPostWorkoutFeedback();
  },

  openPostWorkoutFeedback() {
    const student = DataStore.getStudentById(state.user.studentId);
    const workout = DataStore.data.prescribedWorkouts.find(item => item.id === state.workout.finishedWorkoutId) || DataStore.getTodayWorkout(state.user.studentId);
    const modal = this.ensureModal();
    $('ops-modal-content').innerHTML = `
      <h2>Feedback pós-treino</h2>
      <p class="page-sub">${student ? student.name : 'Aluno'} · ${workout ? workout.title : 'Treino concluído'}</p>
      <form id="post-workout-feedback-form" class="mock-form">
        <input type="hidden" name="studentId" value="${state.user.studentId}">
        <input type="hidden" name="professionalId" value="${student ? student.professionalId : ''}">
        <input type="hidden" name="workoutId" value="${workout ? workout.id : ''}">
        <div class="form-grid">
          <label>Nota do treino
            <select name="workoutRating" required>
              <option value="5">5 · excelente</option>
              <option value="4">4 · bom</option>
              <option value="3">3 · mediano</option>
              <option value="2">2 · ruim</option>
              <option value="1">1 · crítico</option>
            </select>
          </label>
          <label>Esforço percebido
            <select name="perceivedEffort">
              <option value="leve">leve</option>
              <option value="moderado">moderado</option>
              <option value="pesado">pesado</option>
              <option value="muito_pesado">muito pesado</option>
            </select>
          </label>
          <label>Conseguiu completar?
            <select name="completionStatus">
              <option value="completo">completo</option>
              <option value="parcial">parcial</option>
              <option value="nao_consegui">não consegui</option>
            </select>
          </label>
          <label>Como se sentiu?
            <select name="mood">
              <option value="bem">bem</option>
              <option value="normal">normal</option>
              <option value="cansado">cansado</option>
              <option value="desmotivado">desmotivado</option>
            </select>
          </label>
          <label class="checkbox-row"><input type="checkbox" name="painReported" value="true"> Relatei dor</label>
          <label>Local da dor<input name="painLocation" placeholder="ombro, joelho, lombar..."></label>
        </div>
        <label>Comentário livre<textarea name="comment" placeholder="Como foi o treino? Teve dúvida de carga, dor, falta de equipamento ou exercício difícil?"></textarea></label>
        <div class="draft-actions">
          <button class="btn btn-primary" type="submit">Enviar feedback mockado</button>
          <button class="btn btn-ghost" type="button" onclick="App.closeModal(); App.navigate('aluno-overview')">Pular por enquanto</button>
        </div>
      </form>
    `;
    modal.classList.remove('hidden');
  },

  savePostWorkoutFeedback(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const feedback = DataStore.savePostWorkoutFeedback({
      ...data,
      workoutRating: Number(data.workoutRating),
      painReported: data.painReported === 'true'
    });
    this.closeModal();
    this.showToast(feedback.requiresReview ? 'Feedback crítico salvo localmente para revisão do professor.' : 'Feedback pós-treino salvo localmente.');
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

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
<!-- ═══════════════════════════════════════════════════════════
     PUBLIC MEMORIAL HOME
═══════════════════════════════════════════════════════════ -->
<div id="screen-landing" class="screen active">
  <main class="landing-shell" aria-labelledby="landing-title">
    <section class="landing-hero">
      <div class="landing-hero-content">
        <div class="landing-kicker">Protótipo operacional V1.4</div>
        <h1 id="landing-title" class="landing-title">PersonalOps</h1>
        <p class="landing-subtitle">O cockpit operacional do personal trainer.</p>
        <div class="landing-copy">
          <p>PersonalOps é um cockpit operacional para personal trainers. Ele conecta gestão de alunos, frequência, progresso, feedback pós-treino, biblioteca de treinos, clonagem, criação por voz/texto, Pix mockado e dashboard da plataforma.</p>
          <p>A nova fase organiza a experiência por prioridade: o professor vê quem precisa de ação, o aluno entende a semana de treino e o Admin consulta a plataforma também em mobile compacto.</p>
          <p>A versão atual separa três camadas: Admin PersonalOps para a plataforma, Professor para operação dos alunos e Aluno para execução, evolução, pagamento mockado e relato pós-treino.</p>
        </div>
        <div class="landing-actions">
          <button id="btn-enter-app" class="btn btn-primary landing-cta" type="button">Entrar na aplicação</button>
          <button id="btn-product-proposal" class="btn btn-ghost" type="button">Ver o que está sendo validado</button>
        </div>
      </div>

      <div class="ops-panel" aria-label="Fluxo operacional do PersonalOps">
        <div class="ops-panel-header">
          <span class="ops-status"></span>
          <span>Fluxo operacional</span>
        </div>
        <div class="ops-flow">
          <div class="ops-step">
            <span class="ops-step-index">01</span>
            <strong>Prescrever</strong>
            <span>Treino estruturado pelo profissional</span>
          </div>
          <div class="ops-line"></div>
          <div class="ops-step">
            <span class="ops-step-index">02</span>
            <strong>Executar</strong>
            <span>Carga, séries, repetições e descanso</span>
          </div>
          <div class="ops-line"></div>
          <div class="ops-step">
            <span class="ops-step-index">03</span>
            <strong>Ajustar</strong>
            <span>Frequência, progresso, dor e nota pós-treino</span>
          </div>
        </div>
        <div class="ops-metrics">
          <div><span>offline</span><strong>fila local</strong></div>
          <div><span>dados</span><strong>simulados</strong></div>
          <div><span>escopo</span><strong>validação</strong></div>
        </div>
      </div>
    </section>

    <section class="landing-blocks" aria-label="Proposta por público e validação">
      <article class="landing-card">
        <span class="landing-card-label">Para o personal</span>
        <h2>Cockpit do personal</h2>
        <p>Identifique alunos em atenção, faltas, inadimplência, evolução, treinos vencidos e feedbacks críticos em poucos segundos.</p>
      </article>
      <article class="landing-card">
        <span class="landing-card-label">Para o aluno</span>
        <h2>Semana organizada</h2>
        <p>O aluno vê domingo a sábado, treino do dia, sessão assistida, timer, registro de séries e feedback final.</p>
      </article>
      <article class="landing-card">
        <span class="landing-card-label">Para validação</span>
        <h2>Dashboard da plataforma</h2>
        <p>O Admin PersonalOps vê professores, alunos, uso, biblioteca global, mídia pendente, Pix mockado, notificações, saúde técnica e versão mobile compacta.</p>
      </article>
      <article class="landing-card landing-card-accent">
        <span class="landing-card-label">Diferencial</span>
        <h2>Treinos reutilizáveis</h2>
        <p>Biblioteca, clonagem entre alunos e criação por voz/texto reduzem trabalho repetitivo sem publicar nada automaticamente.</p>
      </article>
    </section>

    <section id="landing-validation" class="landing-validation">
      <div>
        <span class="landing-section-label">O que estamos validando</span>
        <h2>O que estamos validando agora</h2>
      </div>
      <ul class="validation-list">
        <li>O professor consegue identificar rapidamente alunos em atenção?</li>
        <li>A interface ajuda o professor a agir sem procurar informação?</li>
        <li>A criação de treino por biblioteca é mais eficiente que texto livre?</li>
        <li>A clonagem de treino reduz trabalho repetitivo?</li>
        <li>O aluno entende melhor sua semana de treino?</li>
        <li>O feedback pós-treino melhora a leitura do professor?</li>
        <li>O Admin mobile compacto é suficiente para consulta rápida da plataforma?</li>
      </ul>
    </section>

    <section class="landing-warning" role="note">
      <strong>Aviso de validação</strong>
      <p>Todos os dados são sintéticos. Pix, QR Code, WhatsApp, Open Finance e pagamentos são demonstrativos. Nenhuma transação real é executada.</p>
    </section>

    <section class="landing-final-cta">
      <h2>PersonalOps</h2>
      <button id="btn-hero-enter-app" class="btn btn-primary landing-cta" type="button">Entrar na aplicação</button>
    </section>

    <footer class="landing-footer">PersonalOps V1.4 — protótipo estático para validação operacional.</footer>
  </main>
</div>

<!-- ═══════════════════════════════════════════════════════════
     LOGIN SCREEN
═══════════════════════════════════════════════════════════ -->
<div id="screen-login" class="screen hidden">
  <div class="login-wrap">
    <div class="login-brand">
      <span class="brand-icon">⚡</span>
      <h1 class="brand-name">PersonalOps</h1>
      <p class="brand-tagline">Gestão de treinos personalizada</p>
    </div>

    <form id="form-login" class="login-form" novalidate>
      <div class="field-group">
        <label for="login-email">E-mail</label>
        <input type="email" id="login-email" name="email" placeholder="seu@email.com" autocomplete="email" required>
      </div>
      <div class="field-group">
        <label for="login-password">Senha</label>
        <input type="password" id="login-password" name="password" placeholder="••••••••" autocomplete="current-password" required>
      </div>
      <div id="login-error" class="login-error hidden">E-mail ou senha incorretos.</div>
      <button type="submit" class="btn btn-primary btn-full">Entrar</button>
    </form>

    <div class="login-demos">
      <p class="demos-label">Acessos demo</p>
      <div class="demo-pills">
        <button class="demo-pill" data-userid="admin-1" data-email="admin@personalops.test" data-pass="admin123">Administrativo</button>
        <button class="demo-pill" data-userid="prof-a" data-email="joao.silva@personaltrainer.com" data-pass="prof123">Professor</button>
        <button class="demo-pill" data-userid="std-01" data-email="aluno.um@email.com" data-pass="aluno123">Aluno</button>
      </div>
    </div>

    <p class="login-disclaimer">
      <strong>Protótipo estático.</strong> Autenticação e dados são simulados. Nenhuma informação real é processada.
    </p>
    <button id="btn-back-landing" class="login-back-link" type="button">Voltar ao memorial</button>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════════
     APP SHELL (shared across all profiles)
═══════════════════════════════════════════════════════════ -->
<div id="screen-app" class="screen hidden">

  <!-- Top Bar -->
  <header class="topbar">
    <button id="btn-menu" class="topbar-menu" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <div class="topbar-brand">
      <span class="brand-icon-sm">⚡</span>
      <span class="topbar-title">PersonalOps</span>
    </div>
    <div class="topbar-right">
      <span id="status-indicator" class="status-dot online" title="Online"></span>
      <button id="btn-logout" class="topbar-logout" aria-label="Sair">⎋</button>
    </div>
  </header>

  <!-- Sidebar Nav -->
  <nav id="sidebar" class="sidebar">
    <div class="sidebar-profile">
      <div class="avatar" id="nav-avatar">A</div>
      <div>
        <div class="profile-name" id="nav-name">Usuário</div>
        <div class="profile-role" id="nav-role">Perfil</div>
      </div>
    </div>
    <ul class="nav-list" id="nav-list"></ul>
    <div class="sidebar-footer">
      <span class="version-label">PersonalOps v1.4 — Protótipo</span>
    </div>
  </nav>
  <div id="sidebar-overlay" class="sidebar-overlay hidden"></div>

  <!-- Main Content -->
  <main id="main-content" class="main-content">

    <!-- ── ADMIN VIEWS ───────────────────────────────── -->
    <div id="view-admin-overview" class="view hidden" data-role="admin">
      <div class="page-header">
        <h2>Visão Geral</h2>
        <p class="page-sub">Dashboard administrativo — dados mockados</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">Perfis ativos</div></div>
        <div class="stat-card"><div class="stat-value">1</div><div class="stat-label">Professores</div></div>
        <div class="stat-card"><div class="stat-value">6</div><div class="stat-label">Alunos mockados</div></div>
        <div class="stat-card"><div class="stat-value">12</div><div class="stat-label">Treinos registrados</div></div>
      </div>
      <div class="section-block">
        <h3 class="section-title">Hipóteses em validação</h3>
        <div class="hypothesis-list">
          <div class="hypothesis-item">
            <span class="hyp-badge pending">Em teste</span>
            <span class="hyp-text">Alunos registram séries com mais precisão via RPE do que % de 1RM</span>
          </div>
          <div class="hypothesis-item">
            <span class="hyp-badge pending">Em teste</span>
            <span class="hyp-text">Professor gasta menos de 5 min criando treino por texto</span>
          </div>
          <div class="hypothesis-item">
            <span class="hyp-badge success">Validada</span>
            <span class="hyp-text">Interface dark reduz fadiga visual em sessões longas</span>
          </div>
        </div>
      </div>
    </div>

    <div id="view-admin-users" class="view hidden" data-role="admin">
      <div class="page-header">
        <h2>Usuários Demo</h2>
        <p class="page-sub">Contas simuladas para validação</p>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>E-mail</th><th>Perfil</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>admin@personalops.test</td><td><span class="role-badge admin">Admin</span></td><td><span class="status-active">Ativo</span></td></tr>
            <tr><td>professor@personalops.test</td><td><span class="role-badge professor">Professor</span></td><td><span class="status-active">Ativo</span></td></tr>
            <tr><td>aluno@personalops.test</td><td><span class="role-badge aluno">Aluno</span></td><td><span class="status-active">Ativo</span></td></tr>
            <tr><td>aluno2@personalops.test</td><td><span class="role-badge aluno">Aluno</span></td><td><span class="status-inactive">Inativo</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div id="view-admin-hypotheses" class="view hidden" data-role="admin">
      <div class="page-header">
        <h2>Hipóteses</h2>
        <p class="page-sub">Hipóteses de produto em validação nesta V1</p>
      </div>
      <div class="card-list">
        <div class="card">
          <div class="card-title">H1 — Criação de treino por texto</div>
          <div class="card-body">Professor consegue criar treino completo em texto livre e o sistema organiza em estrutura utilizável.</div>
          <div class="card-meta"><span class="hyp-badge pending">Em teste</span> · Meta: &lt;5 min</div>
        </div>
        <div class="card">
          <div class="card-title">H2 — Registro de carga via RPE</div>
          <div class="card-body">Aluno prefere registrar percepção de esforço (RPE) vs porcentagem de carga máxima.</div>
          <div class="card-meta"><span class="hyp-badge pending">Em teste</span> · Métrica: preferência declarada</div>
        </div>
        <div class="card">
          <div class="card-title">H3 — Modo offline</div>
          <div class="card-body">Aluno consegue registrar treino sem conexão e dados sincronizam ao reconectar.</div>
          <div class="card-meta"><span class="hyp-badge pending">Em teste</span> · Implementado via localStorage</div>
        </div>
      </div>
    </div>

    <div id="view-admin-settings" class="view hidden" data-role="admin">
      <div class="page-header">
        <h2>Configurações da V1</h2>
        <p class="page-sub">Parâmetros desta versão de protótipo</p>
      </div>
      <div class="settings-list">
        <div class="settings-row">
          <div class="settings-label">Versão</div>
          <div class="settings-value">1.0.0-prototype</div>
        </div>
        <div class="settings-row">
          <div class="settings-label">Ambiente</div>
          <div class="settings-value">GitHub Pages (estático)</div>
        </div>
        <div class="settings-row">
          <div class="settings-label">Autenticação</div>
          <div class="settings-value"><span class="badge-warn">Mockada — não segura</span></div>
        </div>
        <div class="settings-row">
          <div class="settings-label">Banco de dados</div>
          <div class="settings-value"><span class="badge-warn">localStorage apenas</span></div>
        </div>
        <div class="settings-row">
          <div class="settings-label">Service Worker</div>
          <div class="settings-value">Cache básico ativo</div>
        </div>
      </div>
    </div>

    <!-- ── PROFESSOR VIEWS ───────────────────────────── -->
    <div id="view-prof-overview" class="view hidden" data-role="professor">
      <div class="page-header">
        <h2>Visão Geral</h2>
        <p class="page-sub">Olá, Prof. Silva. Resumo de hoje.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">6</div><div class="stat-label">Alunos ativos</div></div>
        <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">Treinos esta semana</div></div>
        <div class="stat-card"><div class="stat-value">2</div><div class="stat-label">Feedbacks pendentes</div></div>
        <div class="stat-card"><div class="stat-value">94%</div><div class="stat-label">Adesão (30d)</div></div>
      </div>
      <div class="section-block">
        <h3 class="section-title">Atividade recente</h3>
        <div class="activity-list">
          <div class="activity-item"><span class="activity-time">Hoje, 07h22</span><span>Carlos completou Treino A — 4/5 séries</span></div>
          <div class="activity-item"><span class="activity-time">Hoje, 06h55</span><span>Ana enviou feedback sobre RPE 9 no Supino</span></div>
          <div class="activity-item"><span class="activity-time">Ontem, 18h30</span><span>Pedro não realizou treino agendado</span></div>
        </div>
      </div>
    </div>

    <div id="view-prof-alunos" class="view hidden" data-role="professor">
      <div class="page-header">
        <h2>Alunos</h2>
        <p class="page-sub">Lista mockada para validação</p>
      </div>
      <div class="student-list">
        <div class="student-card" data-id="1">
          <div class="student-avatar">C</div>
          <div class="student-info">
            <div class="student-name">Carlos Mendes</div>
            <div class="student-meta">Hipertrofia · 3x/semana · Treino A hoje</div>
          </div>
          <span class="student-status active">Ativo</span>
        </div>
        <div class="student-card" data-id="2">
          <div class="student-avatar">A</div>
          <div class="student-info">
            <div class="student-name">Ana Rodrigues</div>
            <div class="student-meta">Emagrecimento · 4x/semana · Treino B hoje</div>
          </div>
          <span class="student-status active">Ativo</span>
        </div>
        <div class="student-card" data-id="3">
          <div class="student-avatar">P</div>
          <div class="student-info">
            <div class="student-name">Pedro Lima</div>
            <div class="student-meta">Força · 5x/semana · Ausente ontem</div>
          </div>
          <span class="student-status warning">Alerta</span>
        </div>
        <div class="student-card" data-id="4">
          <div class="student-avatar">M</div>
          <div class="student-info">
            <div class="student-name">Mariana Costa</div>
            <div class="student-meta">Condicionamento · 3x/semana · Início recente</div>
          </div>
          <span class="student-status active">Ativo</span>
        </div>
      </div>
    </div>

    <div id="view-prof-criar-treino" class="view hidden" data-role="professor">
      <div class="page-header">
        <h2>Criar Treino</h2>
        <p class="page-sub">Digite em texto livre — o sistema organiza</p>
      </div>
      <div class="treino-creator">
        <div class="creator-input-area">
          <label for="treino-text-input" class="field-label">Descreva o treino</label>
          <textarea id="treino-text-input" class="treino-textarea" placeholder="Ex: Supino reto 4x8-10 com 2 min de descanso, Crucifixo inclinado 3x12 1min descanso, Tríceps corda 4x15 45seg, Desenvolvimento halteres 3x10 90seg..."></textarea>
          <div class="creator-actions">
            <button id="btn-organizar-treino" class="btn btn-primary">Organizar treino</button>
            <button id="btn-limpar-treino" class="btn btn-ghost">Limpar</button>
          </div>
        </div>

        <div id="treino-draft-area" class="treino-draft-area hidden">
          <h3 class="section-title">Rascunho estruturado</h3>
          <div id="treino-draft-content" class="treino-draft-content"></div>
          <div class="draft-actions">
            <button id="btn-salvar-treino" class="btn btn-primary">Salvar treino</button>
            <button id="btn-editar-treino" class="btn btn-ghost">Editar texto</button>
          </div>
        </div>
      </div>
    </div>

    <div id="view-prof-feedbacks" class="view hidden" data-role="professor">
      <div class="page-header">
        <h2>Feedbacks Recentes</h2>
        <p class="page-sub">Comentários e registros dos alunos</p>
      </div>
      <div class="feedback-list">
        <div class="feedback-card">
          <div class="fb-header">
            <span class="fb-student">Ana Rodrigues</span>
            <span class="fb-date">Hoje, 06h55</span>
          </div>
          <div class="fb-exercise">Supino reto — Série 3</div>
          <div class="fb-content">"RPE 9 nessa série. Senti pesado demais. Consegui completar mas forma ficou comprometida na última."</div>
          <div class="fb-tags"><span class="tag">RPE 9</span><span class="tag">Técnica</span></div>
        </div>
        <div class="feedback-card">
          <div class="fb-header">
            <span class="fb-student">Carlos Mendes</span>
            <span class="fb-date">Ontem, 08h12</span>
          </div>
          <div class="fb-exercise">Agachamento livre — Treino A completo</div>
          <div class="fb-content">"Treino ótimo. Consegui aumentar 2.5kg no agachamento. Descanso de 2min foi suficiente."</div>
          <div class="fb-tags"><span class="tag">Progressão</span><span class="tag">Positivo</span></div>
        </div>
      </div>
    </div>

    <!-- ── ALUNO VIEWS ────────────────────────────────── -->
    <div id="view-aluno-overview" class="view hidden" data-role="aluno">
      <div class="page-header">
        <h2>Visão Geral</h2>
        <p class="page-sub">Olá, Carlos. Bom treino hoje.</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">12</div><div class="stat-label">Treinos no mês</div></div>
        <div class="stat-card"><div class="stat-value">94%</div><div class="stat-label">Adesão</div></div>
        <div class="stat-card"><div class="stat-value">+2.5kg</div><div class="stat-label">Progresso no agachamento</div></div>
        <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">Séries hoje</div></div>
      </div>
      <div class="section-block">
        <div class="today-workout-preview">
          <h3 class="section-title">Treino de hoje</h3>
          <div class="workout-preview-name">Treino A — Peito e Tríceps</div>
          <div class="workout-preview-meta">5 exercícios · ~55 min</div>
          <button class="btn btn-primary" onclick="App.navigate('aluno-treino')">Iniciar treino</button>
        </div>
      </div>
    </div>

    <div id="view-aluno-treino" class="view hidden" data-role="aluno">
      <div class="page-header">
        <h2>Treino de Hoje</h2>
        <p class="page-sub">Treino A — Peito e Tríceps</p>
      </div>
      <div class="workout-exercise-list">
        <div class="exercise-item" data-index="0">
          <div class="ex-number">01</div>
          <div class="ex-info">
            <div class="ex-name">Supino Reto</div>
            <div class="ex-meta">4 séries · 8–10 reps · 2 min descanso</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.startWorkout(0)">Executar</button>
        </div>
        <div class="exercise-item" data-index="1">
          <div class="ex-number">02</div>
          <div class="ex-info">
            <div class="ex-name">Crucifixo Inclinado</div>
            <div class="ex-meta">3 séries · 12 reps · 1 min descanso</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.startWorkout(1)">Executar</button>
        </div>
        <div class="exercise-item" data-index="2">
          <div class="ex-number">03</div>
          <div class="ex-info">
            <div class="ex-name">Tríceps Corda</div>
            <div class="ex-meta">4 séries · 15 reps · 45 seg descanso</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.startWorkout(2)">Executar</button>
        </div>
        <div class="exercise-item" data-index="3">
          <div class="ex-number">04</div>
          <div class="ex-info">
            <div class="ex-name">Desenvolvimento Halteres</div>
            <div class="ex-meta">3 séries · 10 reps · 90 seg descanso</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.startWorkout(3)">Executar</button>
        </div>
        <div class="exercise-item" data-index="4">
          <div class="ex-number">05</div>
          <div class="ex-info">
            <div class="ex-name">Elevação Lateral</div>
            <div class="ex-meta">3 séries · 15 reps · 60 seg descanso</div>
          </div>
          <button class="btn btn-sm btn-ghost" onclick="App.startWorkout(4)">Executar</button>
        </div>
      </div>
    </div>

    <div id="view-aluno-modo-treino" class="view hidden" data-role="aluno">
      <div class="workout-mode-wrap">

        <!-- Exercise header -->
        <div class="wm-header">
          <button class="btn btn-ghost btn-sm" onclick="App.navigate('aluno-treino')">← Voltar</button>
          <div class="wm-exercise-name" id="wm-ex-name">Supino Reto</div>
          <div class="wm-exercise-meta" id="wm-ex-meta">4 séries · 8–10 reps</div>
        </div>

        <!-- Body figure -->
        <div class="body-figure-wrap">
          <svg id="body-figure" class="body-figure" viewBox="0 0 120 280" xmlns="http://www.w3.org/2000/svg">
            <!-- Head -->
            <circle cx="60" cy="25" r="18" class="fig-body"/>
            <!-- Neck -->
            <rect x="54" y="40" width="12" height="10" class="fig-body"/>
            <!-- Torso -->
            <rect x="35" y="50" width="50" height="60" rx="5" class="fig-body" id="fig-chest"/>
            <!-- Left arm -->
            <rect x="15" y="50" width="18" height="55" rx="8" class="fig-body fig-arm-l"/>
            <!-- Right arm -->
            <rect x="87" y="50" width="18" height="55" rx="8" class="fig-body fig-arm-r"/>
            <!-- Left forearm -->
            <rect x="10" y="108" width="14" height="40" rx="6" class="fig-body fig-forearm-l"/>
            <!-- Right forearm -->
            <rect x="96" y="108" width="14" height="40" rx="6" class="fig-body fig-forearm-r"/>
            <!-- Left leg -->
            <rect x="35" y="112" width="22" height="70" rx="8" class="fig-body"/>
            <!-- Right leg -->
            <rect x="63" y="112" width="22" height="70" rx="8" class="fig-body"/>
            <!-- Left shin -->
            <rect x="37" y="185" width="18" height="55" rx="7" class="fig-body"/>
            <!-- Right shin -->
            <rect x="65" y="185" width="18" height="55" rx="7" class="fig-body"/>
          </svg>
          <div class="body-figure-label" id="wm-muscle-label">Peitoral principal</div>
        </div>

        <!-- Set tracker -->
        <div class="set-tracker">
          <div class="set-progress">
            <span id="wm-set-current">1</span>/<span id="wm-set-total">4</span> séries
          </div>
          <div class="set-inputs">
            <div class="set-input-group">
              <label>Carga (kg)</label>
              <input type="number" id="wm-load" class="set-input" placeholder="60" min="0" step="0.5">
            </div>
            <div class="set-input-group">
              <label>Reps</label>
              <input type="number" id="wm-reps" class="set-input" placeholder="8" min="1" max="100">
            </div>
            <div class="set-input-group">
              <label>RPE</label>
              <input type="number" id="wm-rpe" class="set-input" placeholder="7" min="1" max="10" step="0.5">
            </div>
          </div>
          <button id="btn-register-set" class="btn btn-primary btn-full">Registrar série</button>
        </div>

        <!-- Rest timer -->
        <div id="rest-timer-wrap" class="rest-timer-wrap hidden">
          <div class="rest-timer-label">Descanso</div>
          <div class="rest-timer-display" id="rest-timer-display">02:00</div>
          <div class="rest-timer-bar-track">
            <div class="rest-timer-bar" id="rest-timer-bar"></div>
          </div>
          <button id="btn-skip-rest" class="btn btn-ghost btn-sm">Pular descanso</button>
        </div>

        <!-- Next exercise button -->
        <button id="btn-next-exercise" class="btn btn-outline btn-full hidden">Próximo exercício →</button>

        <!-- Offline queue indicator -->
        <div id="offline-queue-indicator" class="offline-queue hidden">
          <span class="offline-icon">📶</span>
          <span id="offline-queue-count">0 eventos na fila offline</span>
        </div>

        <!-- Registered sets log -->
        <div class="sets-log-wrap">
          <h4 class="sets-log-title">Séries registradas</h4>
          <div id="sets-log" class="sets-log"></div>
        </div>

        <!-- Coaching Cues & Tips -->
        <div class="sets-log-wrap" id="wm-coaching-tips-wrap">
          <h4 class="sets-log-title">Orientações & Execução</h4>
          <div id="wm-coaching-tips" class="coaching-tips" style="font-size: 0.85rem; line-height: 1.4; color: var(--text-dim); margin-top: 8px;"></div>
        </div>

      </div>
    </div>

    <div id="view-aluno-evolucao" class="view hidden" data-role="aluno">
      <div class="page-header">
        <h2>Evolução</h2>
        <p class="page-sub">Progressão histórica — dados mockados</p>
      </div>
      <div class="evolution-list">
        <div class="evo-card">
          <div class="evo-exercise">Supino Reto</div>
          <div class="evo-stats">
            <span class="evo-value">72.5 kg</span>
            <span class="evo-trend up">↑ +2.5kg (30d)</span>
          </div>
          <div class="evo-bar-wrap">
            <div class="evo-bar" style="width: 72%"></div>
          </div>
        </div>
        <div class="evo-card">
          <div class="evo-exercise">Agachamento</div>
          <div class="evo-stats">
            <span class="evo-value">100 kg</span>
            <span class="evo-trend up">↑ +5kg (30d)</span>
          </div>
          <div class="evo-bar-wrap">
            <div class="evo-bar" style="width: 85%"></div>
          </div>
        </div>
        <div class="evo-card">
          <div class="evo-exercise">Terra</div>
          <div class="evo-stats">
            <span class="evo-value">120 kg</span>
            <span class="evo-trend up">↑ +10kg (30d)</span>
          </div>
          <div class="evo-bar-wrap">
            <div class="evo-bar" style="width: 91%"></div>
          </div>
        </div>
        <div class="evo-card">
          <div class="evo-exercise">Tríceps Corda</div>
          <div class="evo-stats">
            <span class="evo-value">35 kg</span>
            <span class="evo-trend flat">→ estável (30d)</span>
          </div>
          <div class="evo-bar-wrap">
            <div class="evo-bar" style="width: 55%"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="view-aluno-perfil" class="view hidden" data-role="aluno">
      <div class="page-header">
        <h2>Perfil / Anamnese</h2>
        <p class="page-sub">Dados mockados — não editáveis nesta versão</p>
      </div>
      <div class="profile-section">
        <div class="profile-avatar-large">C</div>
        <div class="profile-name-large">Carlos Mendes</div>
        <div class="profile-email">aluno@personalops.test</div>
      </div>
      <div class="anamnese-list">
        <div class="anamnese-row"><span class="an-label">Objetivo</span><span class="an-value">Hipertrofia muscular</span></div>
        <div class="anamnese-row"><span class="an-label">Nível</span><span class="an-value">Intermediário</span></div>
        <div class="anamnese-row"><span class="an-label">Frequência</span><span class="an-value">3x por semana</span></div>
        <div class="anamnese-row"><span class="an-label">Restrições</span><span class="an-value">Leve dor no ombro esquerdo</span></div>
        <div class="anamnese-row"><span class="an-label">Peso</span><span class="an-value">82 kg</span></div>
        <div class="anamnese-row"><span class="an-label">Altura</span><span class="an-value">178 cm</span></div>
        <div class="anamnese-row"><span class="an-label">IMC</span><span class="an-value">25.9</span></div>
        <div class="anamnese-row"><span class="an-label">Professor</span><span class="an-value">Prof. Silva</span></div>
      </div>
    </div>

  </main>
</div>
`;
}
