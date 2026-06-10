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
    const invoices = DataStore.data.invoices;
    const students = DataStore.data.students;
    const scheduledNotifications = DataStore.data.notificationEvents.filter(event => event.status === 'scheduled');
    const openInvoices = invoices.filter(invoice => ['open', 'due_soon'].includes(invoice.status));
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue');
    const projectedRevenue = invoices
      .filter(invoice => ['open', 'due_soon', 'scheduled'].includes(invoice.status))
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
    const activeStudents = students.filter(student => !['paused', 'canceled'].includes(student.paymentStatus));
    const delinquentStudents = students.filter(student => student.paymentStatus === 'overdue');

    view.innerHTML = `
      <div class="page-header">
        <h2>Administrativo</h2>
        <p class="page-sub">Cockpit financeiro mockado — nenhum pagamento real é processado.</p>
      </div>
      <div class="stats-grid stats-grid-six">
        <div class="stat-card"><div class="stat-value">${formatCurrencyBR(projectedRevenue)}</div><div class="stat-label">Receita prevista</div></div>
        <div class="stat-card"><div class="stat-value">${openInvoices.length}</div><div class="stat-label">Cobranças Pix em aberto</div></div>
        <div class="stat-card"><div class="stat-value">${overdueInvoices.length}</div><div class="stat-label">Cobranças vencidas</div></div>
        <div class="stat-card"><div class="stat-value">${scheduledNotifications.length}</div><div class="stat-label">Notificações agendadas</div></div>
        <div class="stat-card"><div class="stat-value">${activeStudents.length}</div><div class="stat-label">Alunos ativos</div></div>
        <div class="stat-card"><div class="stat-value">${delinquentStudents.length}</div><div class="stat-label">Alunos inadimplentes</div></div>
      </div>
      <div class="demo-warning">Pagamentos, QR Code Pix, links e notificações são demonstrativos. Não realizar pagamento real.</div>
      <div class="ops-grid">
        <section class="section-block">
          <h3 class="section-title">Cobranças recentes</h3>
          <div class="invoice-list">
            ${invoices.slice(0, 8).map(invoice => {
              const student = DataStore.getStudentById(invoice.studentId);
              return `
                <div class="invoice-row">
                  <div>
                    <strong>${student ? student.name : invoice.studentId}</strong>
                    <span>${formatDateBR(invoice.dueDate)} · ${invoice.paymentMethod.toUpperCase()} mockado</span>
                  </div>
                  <div class="invoice-row-right">
                    <strong>${formatCurrencyBR(invoice.amount)}</strong>
                    <span class="student-status ${statusTone(invoice.status)}">${paymentStatusLabel(invoice.status)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
        <section class="section-block">
          <h3 class="section-title">Régua de notificações</h3>
          <div class="notification-list">
            ${DataStore.data.notificationEvents.slice(0, 8).map(event => {
              const student = DataStore.getStudentById(event.studentId);
              return `
                <div class="notification-row">
                  <span class="student-status ${statusTone(event.status === 'sent' ? 'paid' : event.status)}">${event.status}</span>
                  <div>
                    <strong>${student ? student.name : event.studentId}</strong>
                    <span>${event.channel} · ${formatEventTime(event.scheduledFor)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
      <section class="section-block">
        <h3 class="section-title">Gateway mockado</h3>
        <div class="gateway-grid">
          ${DataStore.data.professionals.map(professional => `
            <div class="gateway-card">
              <strong>${professional.displayName || professional.name}</strong>
              <span>Provider ativo: ${professional.financialProfile.paymentProvider}</span>
              <span>Futuros: ${professional.financialProfile.futureProviders.join(', ')}</span>
            </div>
          `).join('')}
        </div>
      </section>
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
    const profId = state.user.professionalId;
    const professional = DataStore.getProfessionalById(profId);
    const students = DataStore.getStudentsByProfessional(profId);
    const studentIds = students.map(s => s.id);
    const invoices = DataStore.getInvoicesByProfessional(profId);
    const upcomingInvoices = DataStore.getUpcomingInvoices(profId);
    const overdueInvoices = DataStore.getOverdueInvoices(profId);
    const library = DataStore.getWorkoutLibrary(profId);
    const voiceDrafts = DataStore.data.voiceDrafts.filter(draft => draft.professionalId === profId);
    
    const subEl = $('view-prof-overview').querySelector('.page-sub');
    if (subEl) subEl.textContent = `Olá, ${state.user.name}. Alunos, treinos e recebimentos em um só fluxo.`;

    const stats = $('view-prof-overview').querySelectorAll('.stat-value');
    if (stats.length >= 4) {
      const workoutsThisWeek = DataStore.data.prescribedWorkouts.filter(w => studentIds.includes(w.studentId)).length;
      const pendingFeedbacks = DataStore.getFeedbacksByProfessional(profId).filter(f => f.requiresReview).length;

      stats[0].textContent = students.length;
      stats[1].textContent = upcomingInvoices.length;
      stats[2].textContent = overdueInvoices.length;
      stats[3].textContent = pendingFeedbacks;

      const labels = $('view-prof-overview').querySelectorAll('.stat-label');
      if (labels.length >= 4) {
        labels[0].textContent = 'Alunos ativos';
        labels[1].textContent = 'Vencimentos próximos';
        labels[2].textContent = 'Inadimplentes';
        labels[3].textContent = 'Feedbacks pendentes';
      }
    }

    const activityList = $('view-prof-overview').querySelector('.activity-list');
    if (activityList) {
      activityList.innerHTML = `
        <div class="ops-grid">
          <div>
            <h3 class="section-title">Dados Pix mockados</h3>
            <div class="settings-list compact">
              <div class="settings-row"><span class="settings-label">Titular</span><span class="settings-value">${professional.financialProfile.accountHolderName}</span></div>
              <div class="settings-row"><span class="settings-label">Documento</span><span class="settings-value">${professional.financialProfile.documentMasked}</span></div>
              <div class="settings-row"><span class="settings-label">Chave Pix</span><span class="settings-value">${professional.financialProfile.pixKeyMasked}</span></div>
              <div class="settings-row"><span class="settings-label">Provider</span><span class="settings-value">${professional.financialProfile.paymentProvider}</span></div>
            </div>
          </div>
          <div>
            <h3 class="section-title">Vencimentos próximos</h3>
            <div class="invoice-list">
              ${upcomingInvoices.slice(0, 5).map(invoice => {
                const student = DataStore.getStudentById(invoice.studentId);
                return `<div class="invoice-row">
                  <div><strong>${student.name}</strong><span>${formatDateBR(invoice.dueDate)} · ${formatCurrencyBR(invoice.amount)}</span></div>
                  <span class="student-status ${statusTone(invoice.status)}">${paymentStatusLabel(invoice.status)}</span>
                </div>`;
              }).join('') || '<div class="activity-item">Sem vencimentos próximos.</div>'}
            </div>
          </div>
        </div>
        <div class="ops-grid">
          <div>
            <h3 class="section-title">Biblioteca de treinos</h3>
            <div class="library-list">
              ${library.slice(0, 6).map(workout => `
                <div class="library-card">
                  <div>
                    <strong>${workout.name}</strong>
                    <span>${workout.level} · ${workout.estimatedDurationMinutes} min</span>
                  </div>
                  <button class="btn btn-sm btn-ghost" onclick="App.cloneWorkoutMock('${workout.id}', '${students[0].id}')">Clonar treino</button>
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <h3 class="section-title">Voz/texto assistido</h3>
            <div class="voice-list">
              ${voiceDrafts.map(draft => {
                const student = DataStore.getStudentById(draft.studentId);
                return `<div class="voice-card">
                  <strong>${student ? student.name : draft.studentId} · ${draft.parsedResult.workoutTitle}</strong>
                  <span>Confiança ${Math.round(draft.confidence * 100)}% · revisão obrigatória</span>
                  <p>${draft.rawTranscript}</p>
                </div>`;
              }).join('') || '<div class="activity-item">Sem rascunhos para revisar.</div>'}
            </div>
          </div>
        </div>
        <div id="clone-toast" class="clone-toast hidden"></div>
      `;
    }
  },

  renderProfAlunos() {
    const studentListEl = $('view-prof-alunos').querySelector('.student-list');
    if (studentListEl) {
      const profId = state.user.professionalId;
      const myStudents = DataStore.getStudentsByProfessional(profId);
      
      studentListEl.innerHTML = myStudents.map(s => {
        const avatar = s.name.charAt(0);
        const invoice = DataStore.getInvoicesByStudent(s.id)[0];
        const plan = DataStore.data.plans.find(p => p.id === s.planId);
        const riskClass = s.riskLevel === 'high' ? 'danger' : (s.riskLevel === 'medium' ? 'warning' : 'active');
        const riskLabel = s.riskLevel === 'high' ? 'Alto risco' : (s.riskLevel === 'medium' ? 'Atenção' : 'Baixo risco');
        const schedule = DataStore.getWeeklyScheduleByStudent(s.id);
        const weekSummary = schedule ? Object.values(schedule.days).filter(day => day.type === 'workout').map(day => day.title).join(' · ') : 'Sem grade';
        
        return `
          <div class="student-card" data-id="${s.id}">
            <div class="student-avatar">${avatar}</div>
            <div class="student-info">
              <div class="student-name">${s.name}</div>
              <div class="student-meta">${s.goal} · ${s.trainingMode} · ${s.level} · ${plan ? plan.name : 'Sem plano'}</div>
              <div class="student-meta">Vencimento: ${formatDateBR(s.nextDueDate)} · ${billingFrequencyLabel(s.billingFrequency)} · ${weekSummary}</div>
              <div class="student-notes">${s.notes || ''}</div>
            </div>
            <div class="student-card-actions">
              <span class="student-status ${statusTone(s.paymentStatus)}">${paymentStatusLabel(s.paymentStatus)}</span>
              <span class="student-status ${riskClass}">${riskLabel}</span>
              ${invoice ? `<button class="btn btn-sm btn-ghost" onclick="App.cloneWorkoutMock('lib-01', '${s.id}')">Clonar treino</button>` : ''}
            </div>
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

  cloneWorkoutMock(sourceWorkoutId, targetStudentId) {
    try {
      const cloned = DataStore.cloneWorkoutMock(sourceWorkoutId, targetStudentId);
      if (state.currentView) this.renderView(state.currentView);
      this.showToast(`Treino clonado como rascunho para ${DataStore.getStudentById(targetStudentId).name}.`);
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

  renderAlunoOverview() {
    const studentId = state.user.studentId;
    const studentObj = DataStore.getStudentById(studentId);
    const studentName = studentObj ? studentObj.name.split(' ')[0] : state.user.name;
    const plan = studentObj ? DataStore.data.plans.find(p => p.id === studentObj.planId) : null;
    const invoice = DataStore.getInvoicesByStudent(studentId)
      .find(item => ['open', 'due_soon', 'overdue', 'scheduled'].includes(item.status))
      || DataStore.getInvoicesByStudent(studentId)[0];
    const schedule = DataStore.getWeeklyScheduleByStudent(studentId);

    const subEl = $('view-aluno-overview').querySelector('.page-sub');
    if (subEl) subEl.textContent = `Olá, ${studentName}. Seu treino e sua cobrança mockada estão organizados.`;

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
        <div class="ops-grid">
          <section>
            <h3 class="section-title">Treino de hoje</h3>
            ${todayWorkout ? `
              <div class="workout-preview-name">${todayWorkout.title}</div>
              <div class="workout-preview-meta">${todayWorkout.exercises.length} exercício${todayWorkout.exercises.length !== 1 ? 's' : ''} · ~${todayWorkout.estimatedDurationMinutes} min</div>
              <button class="btn btn-primary" onclick="App.navigate('aluno-treino')">Iniciar treino</button>
            ` : '<div class="workout-preview-name">Nenhum treino agendado para hoje.</div>'}
          </section>
          <section>
            <h3 class="section-title">Semana de treino</h3>
            <div class="week-grid-mini">
              ${schedule ? Object.entries(schedule.days).map(([day, item]) => `
                <div class="week-day">
                  <strong>${getDayLabel(day)}</strong>
                  <span>${item.title}</span>
                </div>
              `).join('') : '<div class="activity-item">Sem grade semanal.</div>'}
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
      stats[1].textContent = studentObj ? (studentObj.adherenceStatus === 'Alta' ? '94%' : '65%') : '94%';
      stats[2].textContent = studentObj && studentObj.level === 'Avançado' ? '+5.0kg' : '+2.5kg';
      stats[3].textContent = todayWorkout ? todayWorkout.exercises.reduce((sum, ex) => sum + parseInt(ex.sets), 0) : '0';
    }
  },

  renderAlunoTreino() {
    const studentId = state.user.studentId;
    const todayWorkout = DataStore.getTodayWorkout(studentId);
    const schedule = DataStore.getWeeklyScheduleByStudent(studentId);
    
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

    const weekHtml = schedule ? `
      <div class="section-block">
        <h3 class="section-title">Grade semanal</h3>
        <div class="week-grid">
          ${Object.entries(schedule.days).map(([day, item]) => `
            <div class="week-day ${item.type}">
              <strong>${getDayLabel(day)}</strong>
              <span>${item.title}</span>
              <small>${item.type}</small>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const exercisesHtml = state.workout.exercises.map((ex, idx) => {
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

    listEl.innerHTML = `${weekHtml}${exercisesHtml}`;
  },

  renderAlunoPerfil() {
    const studentId = state.user.studentId;
    const studentObj = DataStore.getStudentById(studentId);
    const assessment = DataStore.getAssessmentsByStudent(studentId)[0];
    const professional = DataStore.getProfessionalById(studentObj ? studentObj.professionalId : '');
    const plan = studentObj ? DataStore.data.plans.find(p => p.id === studentObj.planId) : null;

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
        <div class="landing-kicker">Protótipo operacional V1</div>
        <h1 id="landing-title" class="landing-title">PersonalOps</h1>
        <p class="landing-subtitle">O cockpit operacional do personal trainer.</p>
        <div class="landing-copy">
          <p>O PersonalOps é um protótipo de sistema para personal trainers criarem, entregarem e acompanharem treinos com mais clareza, velocidade e confiabilidade.</p>
          <p>Ele nasce de uma dor simples: o treino real acontece em ambientes imperfeitos. Academia sem internet boa, aluno treinando sozinho, carga esquecida, pausa confusa, feedback perdido e aplicativos que nem sempre acompanham o ritmo da rotina.</p>
          <p>O objetivo do PersonalOps é transformar essa operação em um fluxo mais claro: o personal prescreve, o aluno executa, o app registra e o profissional acompanha os sinais importantes para ajustar o treino com mais precisão.</p>
        </div>
        <div class="landing-actions">
          <button id="btn-enter-app" class="btn btn-primary landing-cta" type="button">Entrar na aplicação</button>
          <button id="btn-product-proposal" class="btn btn-ghost" type="button">Ver proposta do produto</button>
        </div>
      </div>

      <div class="ops-panel" aria-label="Fluxo operacional do PersonalOps">
        <div class="ops-panel-header">
          <span class="ops-status"></span>
          <span>Fluxo de treino</span>
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
            <strong>Acompanhar</strong>
            <span>Sinais importantes para ajuste do treino</span>
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
        <h2>Prescrição com menos atrito</h2>
        <p>Organize alunos, treinos, feedbacks e sinais de evolução em uma visão operacional simples.</p>
      </article>
      <article class="landing-card">
        <span class="landing-card-label">Para o aluno</span>
        <h2>Treino mais claro na prática</h2>
        <p>Acompanhe o treino do dia, registre carga, séries e repetições, use timer de descanso e mantenha o progresso salvo.</p>
      </article>
      <article class="landing-card">
        <span class="landing-card-label">Para validação</span>
        <h2>Protótipo em evolução</h2>
        <p>Esta versão é estática, usa dados simulados e existe para validar fluxo, clareza, utilidade e experiência antes de qualquer banco real.</p>
      </article>
      <article class="landing-card landing-card-accent">
        <span class="landing-card-label">Diferencial</span>
        <h2>Offline-first como princípio</h2>
        <p>Nada que acontece durante o treino deveria depender totalmente da internet. A V1 já simula fila local para eventos de treino.</p>
      </article>
    </section>

    <section id="landing-validation" class="landing-validation">
      <div>
        <span class="landing-section-label">O que estamos validando</span>
        <h2>Hipóteses antes de qualquer banco real</h2>
      </div>
      <ul class="validation-list">
        <li>O personal entende melhor seus alunos com uma visão operacional?</li>
        <li>O aluno consegue seguir o treino com menos fricção?</li>
        <li>O timer e o registro de série melhoram a execução?</li>
        <li>A fila offline resolve uma dor real de academia?</li>
        <li>O produto parece útil antes de ter banco real?</li>
      </ul>
    </section>

    <section class="landing-warning" role="note">
      <strong>Aviso de validação</strong>
      <p>Esta é uma versão de validação. Nenhum dado real de saúde, aluno, pagamento ou avaliação física deve ser inserido.</p>
    </section>

    <section class="landing-final-cta">
      <h2>PersonalOps</h2>
      <button id="btn-hero-enter-app" class="btn btn-primary landing-cta" type="button">Entrar na aplicação</button>
    </section>

    <footer class="landing-footer">PersonalOps V1 — protótipo estático para validação inicial.</footer>
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
        <button class="demo-pill" data-email="admin@personalops.test" data-pass="admin123">Administrativo</button>
        <button class="demo-pill" data-email="professor@personalops.test" data-pass="prof123">Professor</button>
        <button class="demo-pill" data-email="aluno@personalops.test" data-pass="aluno123">Aluno</button>
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
      <span class="version-label">PersonalOps v1.0 — Protótipo</span>
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
