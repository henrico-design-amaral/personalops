import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { User } from '@supabase/supabase-js';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CircleGauge,
  ClipboardCheck,
  Compass,
  FolderKanban,
  History,
  ListTodo,
  LogOut,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Repeat2,
  Settings2,
  Target,
  Trash2,
  X,
} from 'lucide-preact';
import { getSupabase } from '../../lib/supabase/client';
import {
  completeOnboarding,
  ensureTodayInfrastructure,
  insertRow,
  loadWorkspace,
  removeRow,
  updateRow,
} from '../../lib/data/repository';
import {
  buildTodaySummary,
  completionRate,
  latestEnergy,
  localDateISO,
  priorityScore,
  recommendNextStep,
} from '../../lib/domain/personalops';
import type {
  AppView,
  Goal,
  Priority,
  Review,
  Routine,
  Task,
  WorkspaceSnapshot,
} from '../../lib/domain/types';

interface Props {
  initialView: AppView;
  basePath: string;
}

type DialogKind =
  | 'task'
  | 'priority'
  | 'routine'
  | 'goal'
  | 'review'
  | 'commitment'
  | 'area'
  | 'project';

interface DialogRequest {
  kind: DialogKind;
  id?: string;
  values?: Record<string, unknown>;
}

const NAV_ITEMS: Array<{ view: AppView; label: string; icon: typeof Compass }> = [
  { view: 'hoje', label: 'Hoje', icon: Compass },
  { view: 'prioridades', label: 'Prioridades', icon: CircleGauge },
  { view: 'tarefas', label: 'Tarefas', icon: ListTodo },
  { view: 'rotinas', label: 'Rotinas', icon: Repeat2 },
  { view: 'objetivos', label: 'Objetivos', icon: Target },
  { view: 'revisoes', label: 'Revisões', icon: ClipboardCheck },
  { view: 'historico', label: 'Histórico', icon: History },
  { view: 'configuracoes', label: 'Configurações', icon: Settings2 },
];

const TITLES: Record<AppView, string> = {
  hoje: 'Hoje',
  prioridades: 'Prioridades',
  tarefas: 'Tarefas',
  rotinas: 'Rotinas',
  objetivos: 'Objetivos',
  revisoes: 'Revisões',
  historico: 'Histórico',
  configuracoes: 'Configurações',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  paused: 'Pausada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  inbox: 'Entrada',
  planned: 'Planejada',
  in_progress: 'Em andamento',
  blocked: 'Bloqueada',
  pending: 'Pendente',
  skipped: 'Ignorada',
  draft: 'Rascunho',
  scheduled: 'Agendado',
};

function routeFor(basePath: string, view: AppView): string {
  return `${basePath}app/${view}/`;
}

function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return 'Sem data';
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
  }).format(date);
}

function toDateTimeLocal(value: unknown): string {
  if (typeof value !== 'string' || !value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'completed'
      ? 'success'
      : status === 'blocked' || status === 'cancelled'
        ? 'warning'
        : 'info';
  return <span class={`badge ${tone}`}>{STATUS_LABELS[status] ?? status}</span>;
}

function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div class="empty-state">
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        {action && onAction ? (
          <button class="button button-secondary" type="button" onClick={onAction}>
            {action}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Onboarding({ user, onComplete }: { user: User; onComplete: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setSaving(true);
    setMessage('');
    try {
      await completeOnboarding(user.id, {
        displayName: String(data.get('displayName') ?? '').trim(),
        timezone: String(data.get('timezone') ?? 'America/Sao_Paulo'),
        capacityMinutes: Number(data.get('capacityMinutes') ?? 360),
      });
      await onComplete();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Não foi possível concluir a configuração.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main id="conteudo" class="auth-shell compact">
      <span class="wordmark auth-brand">
        personal<span>ops</span>
      </span>
      <section class="auth-panel compact" aria-labelledby="onboarding-title">
        <div class="auth-copy">
          <p class="signal-label">Configuração inicial</p>
          <h1 id="onboarding-title">Ajuste o sistema ao seu dia.</h1>
          <p>Três escolhas bastam para abrir a visão Hoje. Você poderá alterar tudo depois.</p>
        </div>
        <div class="auth-form-wrap">
          <form onSubmit={submit}>
            <div class="field">
              <label for="onboarding-name">Como você quer ser chamado</label>
              <input
                id="onboarding-name"
                name="displayName"
                required
                minLength={2}
                maxLength={80}
                value={String(user.user_metadata.display_name ?? '')}
              />
            </div>
            <div class="field">
              <label for="onboarding-timezone">Fuso horário</label>
              <select id="onboarding-timezone" name="timezone" required>
                <option value="America/Sao_Paulo">Brasília</option>
                <option value="America/Manaus">Manaus</option>
                <option value="America/Recife">Recife</option>
                <option value="America/Fortaleza">Fortaleza</option>
              </select>
            </div>
            <div class="field">
              <label for="onboarding-capacity">Capacidade diária de referência</label>
              <select id="onboarding-capacity" name="capacityMinutes" required>
                <option value="240">4 horas</option>
                <option value="360" selected>
                  6 horas
                </option>
                <option value="480">8 horas</option>
                <option value="600">10 horas</option>
              </select>
            </div>
            <button class="button button-gold auth-submit" type="submit" disabled={saving}>
              {saving ? 'Preparando…' : 'Abrir meu sistema'}
            </button>
            <p class="form-message" role="status">
              {message}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function EnergyPanel({
  snapshot,
  saving,
  onSave,
}: {
  snapshot: WorkspaceSnapshot;
  saving: boolean;
  onSave: (energy: number, capacity: number) => Promise<void>;
}) {
  const today = localDateISO();
  const current = latestEnergy(
    snapshot.energyCheckins.filter((item) => item.recorded_at.startsWith(today)),
  );
  const [energy, setEnergy] = useState(current?.energy_level ?? 3);
  const [capacity, setCapacity] = useState(current?.capacity_level ?? 3);
  return (
    <section class="surface" aria-labelledby="energy-title">
      <header class="surface-header">
        <h3 id="energy-title">Energia e capacidade</h3>
        <span>{current ? 'Atualizado hoje' : 'Ainda não registrado'}</span>
      </header>
      <div class="energy-form">
        <div class="energy-controls">
          {[
            ['Energia', energy, setEnergy],
            ['Capacidade', capacity, setCapacity],
          ].map(([label, value, setter]) => (
            <div class="scale-control" key={String(label)}>
              <span>{String(label)}</span>
              <div class="scale-buttons">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    type="button"
                    aria-label={`${label} ${level} de 5`}
                    aria-pressed={value === level}
                    onClick={() => (setter as (next: number) => void)(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          class="button button-secondary"
          type="button"
          disabled={saving}
          onClick={() => onSave(energy, capacity)}
        >
          {saving ? 'Salvando…' : 'Registrar estado'}
        </button>
      </div>
    </section>
  );
}

function TodayView({ snapshot, saving, openDialog, mutate }: ViewProps) {
  const today = localDateISO();
  const summary = buildTodaySummary(snapshot, today);
  const energy = latestEnergy(
    snapshot.energyCheckins.filter((item) => item.recorded_at.startsWith(today)),
  );
  const tasks = snapshot.tasks.filter(
    (task) =>
      task.scheduled_date === today ||
      (task.due_date && task.due_date < today && !['completed', 'cancelled'].includes(task.status)),
  );
  const priorities = [...snapshot.priorities]
    .filter((item) => item.status === 'active')
    .sort((a, b) => priorityScore(b) - priorityScore(a))
    .slice(0, 4);
  const occurrences = snapshot.routineOccurrences.filter((item) => item.occurrence_date === today);
  const commitments = snapshot.commitments.filter(
    (item) => item.starts_at.startsWith(today) && item.status === 'scheduled',
  );

  const setTaskStatus = async (task: Task) => {
    const next = task.status === 'completed' ? 'planned' : 'completed';
    await mutate(
      async () => {
        await updateRow('tasks', task.id, {
          status: next,
          completed_at: next === 'completed' ? new Date().toISOString() : null,
        });
        await insertRow('task_events', {
          task_id: task.id,
          event_type: next === 'completed' ? 'status_changed' : 'reopened',
          from_status: task.status,
          to_status: next,
        });
      },
      next === 'completed' ? 'Tarefa concluída.' : 'Tarefa reaberta.',
    );
  };

  const setRoutineStatus = async (id: string, status: 'completed' | 'pending') => {
    await mutate(
      () =>
        updateRow('routine_occurrences', id, {
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        }),
      status === 'completed' ? 'Rotina registrada.' : 'Rotina reaberta.',
    );
  };

  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>O que merece atenção agora</h2>
          <p>
            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(
              new Date(`${today}T12:00:00`),
            )}
          </p>
        </div>
        <button
          class="button button-primary"
          type="button"
          onClick={() => openDialog({ kind: 'task' })}
        >
          <Plus size={18} />
          <span>Nova tarefa</span>
        </button>
      </div>
      <div class="today-grid">
        <section class="signal-panel surface" aria-label="Recomendação do dia">
          <div class="next-step">
            <span>Próximo passo recomendado</span>
            <p>{recommendNextStep(snapshot, today)}</p>
          </div>
          <div class="capacity-panel">
            <div>
              <strong>{energy ? `${energy.energy_level}/5` : '—'}</strong>
              <span>energia</span>
            </div>
            <div>
              <strong>{summary.capacityMinutes}m</strong>
              <span>capacidade</span>
            </div>
          </div>
        </section>
        <section class="summary-strip" aria-label="Resumo do dia">
          <div>
            <strong>{summary.planned}</strong>
            <span>planejadas</span>
          </div>
          <div>
            <strong>{summary.completed}</strong>
            <span>concluídas</span>
          </div>
          <div>
            <strong>{summary.overdue}</strong>
            <span>atrasadas</span>
          </div>
          <div>
            <strong>{summary.blocked}</strong>
            <span>bloqueadas</span>
          </div>
          <div>
            <strong>
              {summary.routineCompleted}/{summary.routineTotal}
            </strong>
            <span>rotinas</span>
          </div>
          <div>
            <strong>{summary.plannedMinutes}m</strong>
            <span>carga prevista</span>
          </div>
        </section>

        <section class="surface" aria-labelledby="today-tasks-title">
          <header class="surface-header">
            <h3 id="today-tasks-title">Execução do dia</h3>
            <button
              class="button button-quiet"
              type="button"
              onClick={() => openDialog({ kind: 'task' })}
            >
              <Plus size={16} />
              Adicionar
            </button>
          </header>
          {tasks.length ? (
            <ul class="item-list">
              {tasks.map((task) => (
                <li
                  class={`item-row ${task.status === 'completed' ? 'is-completed' : ''}`}
                  key={task.id}
                >
                  <button
                    class="item-check"
                    type="button"
                    aria-label={
                      task.status === 'completed'
                        ? `Reabrir ${task.title}`
                        : `Concluir ${task.title}`
                    }
                    onClick={() => setTaskStatus(task)}
                  >
                    {task.status === 'completed' ? <Check size={16} /> : null}
                  </button>
                  <div class="item-main">
                    <span class="item-title">{task.title}</span>
                    <span class="item-meta">
                      <StatusBadge status={task.status} />
                      {task.estimated_minutes ? <span>{task.estimated_minutes} min</span> : null}
                      {task.due_date && task.due_date < today ? (
                        <span class="badge warning">atrasada</span>
                      ) : null}
                    </span>
                  </div>
                  <div class="item-actions">
                    <button
                      class="icon-button"
                      type="button"
                      aria-label={`Editar ${task.title}`}
                      onClick={() =>
                        openDialog({
                          kind: 'task',
                          id: task.id,
                          values: task as unknown as Record<string, unknown>,
                        })
                      }
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nada foi planejado para hoje"
              text="Adicione um próximo passo que respeite a capacidade disponível."
              action="Criar tarefa"
              onAction={() => openDialog({ kind: 'task' })}
            />
          )}
        </section>

        <EnergyPanel
          snapshot={snapshot}
          saving={saving}
          onSave={(energyLevel, capacityLevel) =>
            mutate(
              () =>
                insertRow('energy_checkins', {
                  energy_level: energyLevel,
                  capacity_level: capacityLevel,
                }),
              'Estado do dia registrado.',
            )
          }
        />

        <section class="surface" aria-labelledby="today-priorities-title">
          <header class="surface-header">
            <h3 id="today-priorities-title">Prioridades reais</h3>
            <span>{priorities.length} ativas</span>
          </header>
          {priorities.length ? (
            <ul class="item-list">
              {priorities.map((priority) => (
                <li class="item-row" key={priority.id}>
                  <span class="badge priority">{priorityScore(priority)}</span>
                  <div class="item-main">
                    <span class="item-title">{priority.title}</span>
                    <span class="item-meta">
                      <span>impacto {priority.impact}/5</span>
                      <span>urgência {priority.urgency}/5</span>
                    </span>
                  </div>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label={`Editar ${priority.title}`}
                    onClick={() =>
                      openDialog({
                        kind: 'priority',
                        id: priority.id,
                        values: priority as unknown as Record<string, unknown>,
                      })
                    }
                  >
                    <Pencil size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Sem prioridade ativa"
              text="Escolha um resultado que mereça atenção antes de criar mais tarefas."
              action="Criar prioridade"
              onAction={() => openDialog({ kind: 'priority' })}
            />
          )}
        </section>

        <section class="surface" aria-labelledby="today-routines-title">
          <header class="surface-header">
            <h3 id="today-routines-title">Rotinas e compromissos</h3>
            <div class="entity-actions">
              <span>{occurrences.length + commitments.length} itens</span>
              <button
                class="button button-quiet"
                type="button"
                onClick={() => openDialog({ kind: 'commitment' })}
              >
                <Plus size={16} />
                Compromisso
              </button>
            </div>
          </header>
          {occurrences.length || commitments.length ? (
            <ul class="item-list">
              {occurrences.map((occurrence) => {
                const routine = snapshot.routines.find((item) => item.id === occurrence.routine_id);
                return (
                  <li
                    class={`item-row ${occurrence.status === 'completed' ? 'is-completed' : ''}`}
                    key={occurrence.id}
                  >
                    <button
                      class="item-check"
                      type="button"
                      aria-label={
                        occurrence.status === 'completed'
                          ? `Reabrir ${routine?.title}`
                          : `Concluir ${routine?.title}`
                      }
                      onClick={() =>
                        setRoutineStatus(
                          occurrence.id,
                          occurrence.status === 'completed' ? 'pending' : 'completed',
                        )
                      }
                    >
                      {occurrence.status === 'completed' ? <Check size={16} /> : null}
                    </button>
                    <div class="item-main">
                      <span class="item-title">{routine?.title ?? 'Rotina'}</span>
                      <span class="item-meta">
                        <span>rotina</span>
                        {routine?.estimated_minutes ? (
                          <span>{routine.estimated_minutes} min</span>
                        ) : null}
                      </span>
                    </div>
                    <Repeat2 size={17} aria-hidden="true" />
                  </li>
                );
              })}
              {commitments.map((commitment) => (
                <li class="item-row" key={commitment.id}>
                  <CalendarDays size={18} aria-hidden="true" />
                  <div class="item-main">
                    <span class="item-title">{commitment.title}</span>
                    <span class="item-meta">
                      <span>{formatDate(commitment.starts_at, true)}</span>
                      <span>custo {commitment.energy_cost}/5</span>
                    </span>
                  </div>
                  <span class="badge info">compromisso</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Dia sem rotina ou compromisso"
              text="Use esse espaço para proteger capacidade, não para preenchê-la."
              action="Criar rotina"
              onAction={() => openDialog({ kind: 'routine' })}
            />
          )}
        </section>
      </div>
    </div>
  );
}

interface ViewProps {
  snapshot: WorkspaceSnapshot;
  saving: boolean;
  openDialog: (request: DialogRequest) => void;
  mutate: (action: () => Promise<unknown>, success: string) => Promise<void>;
}

function PrioritiesView({ snapshot, openDialog, mutate }: ViewProps) {
  const ordered = [...snapshot.priorities].sort((a, b) => a.position - b.position);
  const updateStatus = (priority: Priority, status: Priority['status']) =>
    mutate(
      () =>
        updateRow('priorities', priority.id, {
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        }),
      `Prioridade ${STATUS_LABELS[status]?.toLowerCase() ?? 'atualizada'}.`,
    );
  const move = async (priority: Priority, direction: -1 | 1) => {
    const index = ordered.findIndex((item) => item.id === priority.id);
    const other = ordered[index + direction];
    if (!other) return;
    await mutate(async () => {
      await updateRow('priorities', priority.id, { position: other.position });
      await updateRow('priorities', other.id, { position: priority.position });
    }, 'Ordem atualizada.');
  };
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Prioridades</h2>
          <p>Resultados que justificam atenção, ordenados por impacto, urgência e esforço.</p>
        </div>
        <button
          class="button button-primary"
          type="button"
          onClick={() => openDialog({ kind: 'priority' })}
        >
          <Plus size={18} />
          Nova prioridade
        </button>
      </div>
      {ordered.length ? (
        <div class="entity-stack">
          {ordered.map((priority, index) => (
            <article class="surface entity-row" key={priority.id}>
              <div>
                <div class="entity-meta">
                  <span class="badge priority">score {priorityScore(priority)}</span>
                  <StatusBadge status={priority.status} />
                  {priority.due_date ? (
                    <span class="badge">até {formatDate(priority.due_date)}</span>
                  ) : null}
                </div>
                <h3>{priority.title}</h3>
                <p>{priority.rationale || 'Sem justificativa registrada.'}</p>
              </div>
              <div class="entity-actions">
                <button
                  class="icon-button"
                  type="button"
                  aria-label="Mover prioridade para cima"
                  disabled={index === 0}
                  onClick={() => move(priority, -1)}
                >
                  <ChevronUp size={17} />
                </button>
                <button
                  class="icon-button"
                  type="button"
                  aria-label="Mover prioridade para baixo"
                  disabled={index === ordered.length - 1}
                  onClick={() => move(priority, 1)}
                >
                  <ChevronDown size={17} />
                </button>
                <button
                  class="button button-quiet"
                  type="button"
                  onClick={() =>
                    updateStatus(priority, priority.status === 'paused' ? 'active' : 'paused')
                  }
                >
                  {priority.status === 'paused' ? 'Retomar' : 'Pausar'}
                </button>
                <button
                  class="button button-quiet"
                  type="button"
                  onClick={() => updateStatus(priority, 'completed')}
                >
                  Concluir
                </button>
                <button
                  class="icon-button"
                  type="button"
                  aria-label={`Editar ${priority.title}`}
                  onClick={() =>
                    openDialog({
                      kind: 'priority',
                      id: priority.id,
                      values: priority as unknown as Record<string, unknown>,
                    })
                  }
                >
                  <Pencil size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma prioridade registrada"
          text="Uma prioridade descreve o resultado que merece atenção, não apenas uma ação."
          action="Criar prioridade"
          onAction={() => openDialog({ kind: 'priority' })}
        />
      )}
    </div>
  );
}

function TasksView({ snapshot, openDialog, mutate }: ViewProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('open');
  const filtered = snapshot.tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.notes}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      status === 'all' ||
      (status === 'open'
        ? !['completed', 'cancelled'].includes(task.status)
        : task.status === status);
    return matchesQuery && matchesStatus;
  });
  const setStatusAndHistory = async (task: Task, next: Task['status']) =>
    mutate(
      async () => {
        await updateRow('tasks', task.id, {
          status: next,
          completed_at: next === 'completed' ? new Date().toISOString() : null,
        });
        await insertRow('task_events', {
          task_id: task.id,
          event_type: next === 'completed' ? 'status_changed' : 'reopened',
          from_status: task.status,
          to_status: next,
        });
      },
      next === 'completed' ? 'Tarefa concluída.' : 'Tarefa reaberta.',
    );
  const archive = async (task: Task) => {
    if (!window.confirm(`Excluir “${task.title}”? O histórico será mantido.`)) return;
    await mutate(async () => {
      await insertRow('task_events', {
        task_id: task.id,
        event_type: 'deleted',
        from_status: task.status,
        to_status: task.status,
      });
      await updateRow('tasks', task.id, { deleted_at: new Date().toISOString() });
    }, 'Tarefa removida.');
  };
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Tarefas</h2>
          <p>Próximos passos executáveis, com agenda, prazo, relações e histórico.</p>
        </div>
        <button
          class="button button-primary"
          type="button"
          data-testid="new-task"
          onClick={() => openDialog({ kind: 'task' })}
        >
          <Plus size={18} />
          Nova tarefa
        </button>
      </div>
      <div class="filter-bar">
        <label class="search-field">
          <span class="sr-only">Buscar tarefas</span>
          <input
            type="search"
            placeholder="Buscar por título ou nota"
            value={query}
            onInput={(event) => setQuery(event.currentTarget.value)}
          />
        </label>
        <select
          aria-label="Filtrar tarefas por status"
          value={status}
          onChange={(event) => setStatus(event.currentTarget.value)}
        >
          <option value="open">Abertas</option>
          <option value="all">Todas</option>
          <option value="planned">Planejadas</option>
          <option value="in_progress">Em andamento</option>
          <option value="blocked">Bloqueadas</option>
          <option value="completed">Concluídas</option>
        </select>
      </div>
      {filtered.length ? (
        <section class="surface">
          <ul class="item-list">
            {filtered.map((task) => (
              <li
                class={`item-row ${task.status === 'completed' ? 'is-completed' : ''}`}
                key={task.id}
              >
                <button
                  class="item-check"
                  type="button"
                  aria-label={
                    task.status === 'completed' ? `Reabrir ${task.title}` : `Concluir ${task.title}`
                  }
                  onClick={() =>
                    setStatusAndHistory(task, task.status === 'completed' ? 'planned' : 'completed')
                  }
                >
                  {task.status === 'completed' ? <Check size={16} /> : null}
                </button>
                <div class="item-main">
                  <span class="item-title">{task.title}</span>
                  <span class="item-meta">
                    <StatusBadge status={task.status} />
                    {task.scheduled_date ? (
                      <span>agenda {formatDate(task.scheduled_date)}</span>
                    ) : null}
                    {task.due_date ? <span>prazo {formatDate(task.due_date)}</span> : null}
                    {task.estimated_minutes ? <span>{task.estimated_minutes} min</span> : null}
                  </span>
                </div>
                <div class="item-actions">
                  <button
                    class="icon-button"
                    type="button"
                    aria-label={`Editar ${task.title}`}
                    onClick={() =>
                      openDialog({
                        kind: 'task',
                        id: task.id,
                        values: task as unknown as Record<string, unknown>,
                      })
                    }
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label={`Excluir ${task.title}`}
                    onClick={() => archive(task)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <EmptyState
          title="Nenhuma tarefa encontrada"
          text={
            query
              ? 'A busca não encontrou correspondências.'
              : 'Crie o próximo passo de uma prioridade real.'
          }
          {...(!query
            ? { action: 'Criar tarefa', onAction: () => openDialog({ kind: 'task' }) }
            : {})}
        />
      )}
    </div>
  );
}

function RoutinesView({ snapshot, openDialog, mutate }: ViewProps) {
  const archive = async (routine: Routine) => {
    if (!window.confirm(`Excluir a rotina “${routine.title}” e suas ocorrências?`)) return;
    await mutate(() => removeRow('routines', routine.id), 'Rotina excluída.');
  };
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Rotinas</h2>
          <p>Cadências que reaparecem no dia certo e acumulam evidência de execução.</p>
        </div>
        <button
          class="button button-primary"
          type="button"
          onClick={() => openDialog({ kind: 'routine' })}
        >
          <Plus size={18} />
          Nova rotina
        </button>
      </div>
      {snapshot.routines.length ? (
        <div class="entity-stack">
          {snapshot.routines.map((routine) => {
            const occurrences = snapshot.routineOccurrences.filter(
              (item) => item.routine_id === routine.id,
            );
            return (
              <article class="surface entity-row" key={routine.id}>
                <div>
                  <div class="entity-meta">
                    <StatusBadge status={routine.status} />
                    <span class="badge">
                      {routine.frequency_type === 'daily' ? 'diária' : 'semanal'}
                    </span>
                    <span class="badge success">{completionRate(occurrences)}% consistência</span>
                  </div>
                  <h3>{routine.title}</h3>
                  <p>
                    {routine.description ||
                      `${routine.estimated_minutes} minutos, período ${routine.period}.`}
                  </p>
                </div>
                <div class="entity-actions">
                  <button
                    class="button button-quiet"
                    type="button"
                    onClick={() =>
                      mutate(
                        () =>
                          updateRow('routines', routine.id, {
                            status: routine.status === 'paused' ? 'active' : 'paused',
                          }),
                        'Rotina atualizada.',
                      )
                    }
                  >
                    {routine.status === 'paused' ? 'Retomar' : 'Pausar'}
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label={`Editar ${routine.title}`}
                    onClick={() =>
                      openDialog({
                        kind: 'routine',
                        id: routine.id,
                        values: routine as unknown as Record<string, unknown>,
                      })
                    }
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    class="icon-button"
                    type="button"
                    aria-label={`Excluir ${routine.title}`}
                    onClick={() => archive(routine)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma rotina ativa"
          text="Crie uma cadência pequena o bastante para sobreviver aos dias difíceis."
          action="Criar rotina"
          onAction={() => openDialog({ kind: 'routine' })}
        />
      )}
    </div>
  );
}

function GoalsView({ snapshot, openDialog, mutate }: ViewProps) {
  const updateProgress = (goal: Goal, delta: number) =>
    mutate(async () => {
      const progress = Math.min(100, Math.max(0, goal.progress + delta));
      await updateRow('goals', goal.id, {
        progress,
        status: progress === 100 ? 'completed' : goal.status,
        completed_at: progress === 100 ? new Date().toISOString() : null,
      });
      await insertRow('progress_entries', {
        goal_id: goal.id,
        progress_delta: delta,
        note: `Progresso ajustado para ${progress}%.`,
      });
    }, 'Progresso atualizado.');
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Objetivos e projetos</h2>
          <p>Resultados de médio prazo conectados às prioridades e ao trabalho executado.</p>
        </div>
        <div class="topbar-actions">
          <button
            class="button button-secondary"
            type="button"
            onClick={() => openDialog({ kind: 'project' })}
          >
            <FolderKanban size={17} />
            Novo projeto
          </button>
          <button
            class="button button-primary"
            type="button"
            onClick={() => openDialog({ kind: 'goal' })}
          >
            <Plus size={18} />
            Novo objetivo
          </button>
        </div>
      </div>
      <section class="entity-stack">
        {snapshot.goals.map((goal) => (
          <article class="surface entity-row" key={goal.id}>
            <div>
              <div class="entity-meta">
                <StatusBadge status={goal.status} />
                {goal.target_date ? (
                  <span class="badge">até {formatDate(goal.target_date)}</span>
                ) : null}
              </div>
              <h3>{goal.title}</h3>
              <p>{goal.desired_outcome || 'Resultado desejado ainda não descrito.'}</p>
              <div class="progress-track" aria-label={`${goal.progress}% concluído`}>
                <span style={{ width: `${goal.progress}%` }} />
              </div>
            </div>
            <div class="entity-actions">
              <button
                class="button button-quiet"
                type="button"
                onClick={() => updateProgress(goal, -10)}
              >
                -10%
              </button>
              <button
                class="button button-quiet"
                type="button"
                onClick={() => updateProgress(goal, 10)}
              >
                +10%
              </button>
              <button
                class="icon-button"
                type="button"
                aria-label={`Editar ${goal.title}`}
                onClick={() =>
                  openDialog({
                    kind: 'goal',
                    id: goal.id,
                    values: goal as unknown as Record<string, unknown>,
                  })
                }
              >
                <Pencil size={17} />
              </button>
            </div>
          </article>
        ))}
        {snapshot.goals.length === 0 ? (
          <EmptyState
            title="Nenhum objetivo ativo"
            text="Defina um resultado observável e conecte prioridades a ele."
            action="Criar objetivo"
            onAction={() => openDialog({ kind: 'goal' })}
          />
        ) : null}
      </section>
      {snapshot.projects.length ? (
        <section class="surface" style={{ marginTop: '1rem' }}>
          <header class="surface-header">
            <h3>Projetos</h3>
            <span>{snapshot.projects.length} registrados</span>
          </header>
          <ul class="item-list">
            {snapshot.projects.map((project) => (
              <li class="item-row" key={project.id}>
                <FolderKanban size={18} />
                <div class="item-main">
                  <span class="item-title">{project.name}</span>
                  <span class="item-meta">
                    <StatusBadge status={project.status} />
                    {project.target_date ? (
                      <span>até {formatDate(project.target_date)}</span>
                    ) : null}
                  </span>
                </div>
                <button
                  class="icon-button"
                  type="button"
                  aria-label={`Editar ${project.name}`}
                  onClick={() =>
                    openDialog({
                      kind: 'project',
                      id: project.id,
                      values: project as unknown as Record<string, unknown>,
                    })
                  }
                >
                  <Pencil size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ReviewsView({ snapshot, openDialog, mutate }: ViewProps) {
  const archive = async (review: Review) => {
    if (!window.confirm('Excluir esta revisão?')) return;
    await mutate(() => removeRow('reviews', review.id), 'Revisão excluída.');
  };
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Revisões</h2>
          <p>Planejado versus realizado, energia consumida e decisões para o próximo ciclo.</p>
        </div>
        <button
          class="button button-primary"
          type="button"
          onClick={() => openDialog({ kind: 'review' })}
        >
          <Plus size={18} />
          Nova revisão
        </button>
      </div>
      {snapshot.reviews.length ? (
        <div class="entity-stack">
          {snapshot.reviews.map((review) => (
            <article class="surface entity-row" key={review.id}>
              <div>
                <div class="entity-meta">
                  <span class="badge priority">
                    {review.review_type === 'daily'
                      ? 'diária'
                      : review.review_type === 'weekly'
                        ? 'semanal'
                        : 'mensal'}
                  </span>
                  <StatusBadge status={review.status} />
                  <span class="badge">
                    {formatDate(review.period_start)} a {formatDate(review.period_end)}
                  </span>
                </div>
                <h3>{review.completed_summary || 'Revisão em andamento'}</h3>
                <p>
                  {review.adjustments ||
                    review.blockers ||
                    'Abra para registrar aprendizados e próximas decisões.'}
                </p>
              </div>
              <div class="entity-actions">
                <button
                  class="icon-button"
                  type="button"
                  aria-label="Editar revisão"
                  onClick={() =>
                    openDialog({
                      kind: 'review',
                      id: review.id,
                      values: review as unknown as Record<string, unknown>,
                    })
                  }
                >
                  <Pencil size={17} />
                </button>
                <button
                  class="icon-button"
                  type="button"
                  aria-label="Excluir revisão"
                  onClick={() => archive(review)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma revisão registrada"
          text="Feche o ciclo com evidência, não com culpa."
          action="Iniciar revisão"
          onAction={() => openDialog({ kind: 'review' })}
        />
      )}
    </div>
  );
}

function HistoryView({ snapshot }: ViewProps) {
  const today = localDateISO();
  const thirtyDaysAgo = localDateISO(new Date(Date.now() - 29 * 86_400_000));
  const recentTasks = snapshot.tasks.filter(
    (task) => task.updated_at.slice(0, 10) >= thirtyDaysAgo,
  );
  const completed = recentTasks.filter((task) => task.status === 'completed').length;
  const open = snapshot.tasks.filter(
    (task) => !['completed', 'cancelled'].includes(task.status),
  ).length;
  const blocked = snapshot.tasks.filter((task) => task.status === 'blocked').length;
  const energy = snapshot.energyCheckins.filter(
    (item) => item.recorded_at.slice(0, 10) >= thirtyDaysAgo,
  );
  const averageEnergy = energy.length
    ? (energy.reduce((sum, item) => sum + item.energy_level, 0) / energy.length).toFixed(1)
    : '—';
  const occurrences = snapshot.routineOccurrences.filter(
    (item) => item.occurrence_date >= thirtyDaysAgo,
  );
  const activeGoals = snapshot.goals.filter((goal) => goal.status === 'active').length;
  const todaySummary = buildTodaySummary(snapshot, today);
  const indicators = [
    [completed, 'tarefas concluídas em 30 dias'],
    [open, 'pendências abertas'],
    [`${completionRate(occurrences)}%`, 'consistência das rotinas'],
    [averageEnergy, 'energia média'],
    [activeGoals, 'objetivos ativos'],
    [blocked, 'itens bloqueados'],
    [`${todaySummary.completed}/${todaySummary.planned}`, 'realizado versus planejado hoje'],
    [
      snapshot.commitments.filter(
        (item) => item.status === 'scheduled' && item.starts_at < new Date().toISOString(),
      ).length,
      'compromissos vencidos',
    ],
    [snapshot.progressEntries.length, 'registros de progresso'],
  ];
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Histórico e indicadores</h2>
          <p>Leituras úteis para decidir. Nenhum número existe apenas para decorar.</p>
        </div>
      </div>
      <section class="indicator-grid">
        {indicators.map(([value, label]) => (
          <article class="surface indicator" key={String(label)}>
            <span>{String(label)}</span>
            <strong>{String(value)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}

function SettingsView({
  snapshot,
  openDialog,
  mutate,
}: ViewProps & { onSignOut: () => Promise<void> }) {
  const save = async (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    await mutate(
      () =>
        updateRow('profiles', snapshot.profile.id, {
          display_name: String(values.get('displayName') ?? '').trim(),
          timezone: String(values.get('timezone') ?? ''),
          default_daily_capacity_minutes: Number(values.get('capacityMinutes') ?? 360),
        }),
      'Preferências salvas.',
    );
  };
  return (
    <div class="view-content">
      <div class="view-heading">
        <div>
          <h2>Configurações</h2>
          <p>Preferências pessoais, áreas e segurança da sessão.</p>
        </div>
      </div>
      <div class="settings-grid">
        <section class="surface settings-form">
          <header class="surface-header">
            <h3>Perfil e capacidade</h3>
          </header>
          <form onSubmit={save} style={{ paddingTop: '1rem' }}>
            <div class="field">
              <label for="settings-name">Nome</label>
              <input
                id="settings-name"
                name="displayName"
                required
                minLength={2}
                maxLength={80}
                value={snapshot.profile.display_name}
              />
            </div>
            <div class="field">
              <label for="settings-timezone">Fuso horário</label>
              <select id="settings-timezone" name="timezone" value={snapshot.profile.timezone}>
                <option value="America/Sao_Paulo">Brasília</option>
                <option value="America/Manaus">Manaus</option>
                <option value="America/Recife">Recife</option>
                <option value="America/Fortaleza">Fortaleza</option>
              </select>
            </div>
            <div class="field">
              <label for="settings-capacity">Capacidade diária em minutos</label>
              <input
                id="settings-capacity"
                name="capacityMinutes"
                type="number"
                min="0"
                max="1440"
                step="30"
                value={snapshot.profile.default_daily_capacity_minutes}
              />
            </div>
            <button class="button button-primary" type="submit">
              Salvar preferências
            </button>
          </form>
        </section>
        <aside class="entity-stack">
          <section class="surface account-panel">
            <h3>Áreas pessoais</h3>
            <p>
              {snapshot.areas.length
                ? snapshot.areas.map((area) => area.name).join(', ')
                : 'Nenhuma área registrada.'}
            </p>
            <button
              class="button button-secondary"
              type="button"
              onClick={() => openDialog({ kind: 'area' })}
            >
              <Plus size={17} />
              Adicionar área
            </button>
          </section>
          <section class="surface account-panel">
            <h3>Sessão</h3>
            <p>Sair remove a sessão deste navegador. Seus dados permanecem no Supabase.</p>
            <button
              class="button button-danger"
              type="button"
              onClick={() => getSupabase().auth.signOut()}
            >
              <LogOut size={17} />
              Sair do PersonalOps
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function DialogForm({
  request,
  snapshot,
  saving,
  onClose,
  onSave,
}: {
  request: DialogRequest;
  snapshot: WorkspaceSnapshot;
  saving: boolean;
  onClose: () => void;
  onSave: (request: DialogRequest, data: FormData) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    const first = dialog.current?.querySelector<HTMLElement>('input, select, textarea');
    first?.focus();
  }, []);
  const value = (key: string, fallback = '') => String(request.values?.[key] ?? fallback);
  const title: Record<DialogKind, string> = {
    task: 'Tarefa',
    priority: 'Prioridade',
    routine: 'Rotina',
    goal: 'Objetivo',
    review: 'Revisão',
    commitment: 'Compromisso',
    area: 'Área pessoal',
    project: 'Projeto',
  };
  const submit = async (event: SubmitEvent & { currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    await onSave(request, new FormData(event.currentTarget));
  };
  return (
    <dialog class="app-dialog" ref={dialog} onClose={onClose} onCancel={onClose}>
      <header class="dialog-header">
        <h2>
          {request.id ? 'Editar' : 'Criar'} {title[request.kind].toLowerCase()}
        </h2>
        <button
          class="icon-button"
          type="button"
          aria-label="Fechar"
          onClick={() => dialog.current?.close()}
        >
          <X size={19} />
        </button>
      </header>
      <form class="dialog-body" onSubmit={submit}>
        <div class="form-grid">
          {request.kind === 'task' ? (
            <>
              <div class="field full">
                <label for="task-title">Próximo passo</label>
                <input
                  id="task-title"
                  name="title"
                  required
                  minLength={1}
                  maxLength={220}
                  value={value('title')}
                  data-testid="task-title"
                />
              </div>
              <div class="field full">
                <label for="task-notes">Notas</label>
                <textarea id="task-notes" name="notes" maxLength={5000} value={value('notes')} />
              </div>
              <div class="field">
                <label for="task-status">Status</label>
                <select id="task-status" name="status" value={value('status', 'planned')}>
                  <option value="inbox">Entrada</option>
                  <option value="planned">Planejada</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="blocked">Bloqueada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div class="field">
                <label for="task-minutes">Esforço em minutos</label>
                <input
                  id="task-minutes"
                  name="estimatedMinutes"
                  type="number"
                  min="1"
                  max="1440"
                  value={value('estimated_minutes')}
                />
              </div>
              <div class="field">
                <label for="task-schedule">Agendar para</label>
                <input
                  id="task-schedule"
                  name="scheduledDate"
                  type="date"
                  value={value('scheduled_date', localDateISO())}
                />
              </div>
              <div class="field">
                <label for="task-due">Prazo</label>
                <input id="task-due" name="dueDate" type="date" value={value('due_date')} />
              </div>
              <div class="field">
                <label for="task-area">Área</label>
                <select id="task-area" name="areaId" value={value('area_id')}>
                  <option value="">Sem área</option>
                  {snapshot.areas.map((area) => (
                    <option value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div class="field">
                <label for="task-priority">Prioridade</label>
                <select id="task-priority" name="priorityId" value={value('priority_id')}>
                  <option value="">Sem prioridade</option>
                  {snapshot.priorities.map((priority) => (
                    <option value={priority.id}>{priority.title}</option>
                  ))}
                </select>
              </div>
              <div class="field">
                <label for="task-goal">Objetivo</label>
                <select id="task-goal" name="goalId" value={value('goal_id')}>
                  <option value="">Sem objetivo</option>
                  {snapshot.goals.map((goal) => (
                    <option value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
              <div class="field">
                <label for="task-project">Projeto</label>
                <select id="task-project" name="projectId" value={value('project_id')}>
                  <option value="">Sem projeto</option>
                  {snapshot.projects.map((project) => (
                    <option value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div class="field full">
                <label for="task-blocked">Motivo do bloqueio</label>
                <input
                  id="task-blocked"
                  name="blockedReason"
                  maxLength={1200}
                  value={value('blocked_reason')}
                />
              </div>
            </>
          ) : null}
          {request.kind === 'priority' ? (
            <>
              <div class="field full">
                <label for="priority-title">Resultado prioritário</label>
                <input
                  id="priority-title"
                  name="title"
                  required
                  maxLength={180}
                  value={value('title')}
                />
              </div>
              <div class="field full">
                <label for="priority-rationale">Por que merece atenção</label>
                <textarea
                  id="priority-rationale"
                  name="rationale"
                  maxLength={1200}
                  value={value('rationale')}
                />
              </div>
              {['impact', 'urgency', 'effort'].map((key) => (
                <div class="field">
                  <label for={`priority-${key}`}>
                    {key === 'impact' ? 'Impacto' : key === 'urgency' ? 'Urgência' : 'Esforço'}{' '}
                    (1–5)
                  </label>
                  <input
                    id={`priority-${key}`}
                    name={key}
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={value(key, '3')}
                  />
                </div>
              ))}
              <div class="field">
                <label for="priority-status">Status</label>
                <select id="priority-status" name="status" value={value('status', 'active')}>
                  <option value="active">Ativa</option>
                  <option value="paused">Pausada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div class="field">
                <label for="priority-due">Prazo</label>
                <input id="priority-due" name="dueDate" type="date" value={value('due_date')} />
              </div>
              <div class="field">
                <label for="priority-area">Área</label>
                <select id="priority-area" name="areaId" value={value('area_id')}>
                  <option value="">Sem área</option>
                  {snapshot.areas.map((area) => (
                    <option value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div class="field">
                <label for="priority-goal">Objetivo</label>
                <select id="priority-goal" name="goalId" value={value('goal_id')}>
                  <option value="">Sem objetivo</option>
                  {snapshot.goals.map((goal) => (
                    <option value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          {request.kind === 'routine' ? (
            <>
              <div class="field full">
                <label for="routine-title">Nome da rotina</label>
                <input
                  id="routine-title"
                  name="title"
                  required
                  maxLength={160}
                  value={value('title')}
                />
              </div>
              <div class="field full">
                <label for="routine-description">Orientação</label>
                <textarea
                  id="routine-description"
                  name="description"
                  maxLength={1200}
                  value={value('description')}
                />
              </div>
              <div class="field">
                <label for="routine-frequency">Frequência</label>
                <select
                  id="routine-frequency"
                  name="frequencyType"
                  value={value('frequency_type', 'daily')}
                >
                  <option value="daily">Diária</option>
                  <option value="weekly">Dias da semana</option>
                </select>
              </div>
              <div class="field">
                <label for="routine-period">Período</label>
                <select id="routine-period" name="period" value={value('period', 'flexible')}>
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noite</option>
                  <option value="flexible">Flexível</option>
                </select>
              </div>
              <div class="field">
                <label for="routine-minutes">Duração estimada</label>
                <input
                  id="routine-minutes"
                  name="estimatedMinutes"
                  type="number"
                  min="1"
                  max="720"
                  required
                  value={value('estimated_minutes', '15')}
                />
              </div>
              <div class="field">
                <label for="routine-time">Horário</label>
                <input
                  id="routine-time"
                  name="scheduledTime"
                  type="time"
                  value={value('scheduled_time')}
                />
              </div>
              <div class="field full">
                <span class="fieldset-label">Dias da semana</span>
                <fieldset class="day-picker">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label, index) => (
                    <label>
                      <input
                        type="checkbox"
                        name="days"
                        value={index}
                        checked={
                          Array.isArray(request.values?.days_of_week) &&
                          (request.values?.days_of_week as number[]).includes(index)
                        }
                      />
                      {label}
                    </label>
                  ))}
                </fieldset>
              </div>
            </>
          ) : null}
          {request.kind === 'goal' ? (
            <>
              <div class="field full">
                <label for="goal-title">Objetivo</label>
                <input
                  id="goal-title"
                  name="title"
                  required
                  maxLength={160}
                  value={value('title')}
                />
              </div>
              <div class="field full">
                <label for="goal-outcome">Resultado observável</label>
                <textarea
                  id="goal-outcome"
                  name="desiredOutcome"
                  maxLength={1200}
                  value={value('desired_outcome')}
                />
              </div>
              <div class="field">
                <label for="goal-status">Estado</label>
                <select id="goal-status" name="status" value={value('status', 'active')}>
                  <option value="planned">Planejado</option>
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div class="field">
                <label for="goal-progress">Progresso</label>
                <input
                  id="goal-progress"
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  value={value('progress', '0')}
                />
              </div>
              <div class="field">
                <label for="goal-date">Data-alvo</label>
                <input id="goal-date" name="targetDate" type="date" value={value('target_date')} />
              </div>
              <div class="field">
                <label for="goal-area">Área</label>
                <select id="goal-area" name="areaId" value={value('area_id')}>
                  <option value="">Sem área</option>
                  {snapshot.areas.map((area) => (
                    <option value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          {request.kind === 'project' ? (
            <>
              <div class="field full">
                <label for="project-name">Projeto</label>
                <input
                  id="project-name"
                  name="name"
                  required
                  maxLength={140}
                  value={value('name')}
                />
              </div>
              <div class="field full">
                <label for="project-outcome">Resultado esperado</label>
                <textarea
                  id="project-outcome"
                  name="outcome"
                  maxLength={1200}
                  value={value('outcome')}
                />
              </div>
              <div class="field">
                <label for="project-status">Estado</label>
                <select id="project-status" name="status" value={value('status', 'active')}>
                  <option value="active">Ativo</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div class="field">
                <label for="project-date">Data-alvo</label>
                <input
                  id="project-date"
                  name="targetDate"
                  type="date"
                  value={value('target_date')}
                />
              </div>
              <div class="field">
                <label for="project-area">Área</label>
                <select id="project-area" name="areaId" value={value('area_id')}>
                  <option value="">Sem área</option>
                  {snapshot.areas.map((area) => (
                    <option value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div class="field">
                <label for="project-goal">Objetivo</label>
                <select id="project-goal" name="goalId" value={value('goal_id')}>
                  <option value="">Sem objetivo</option>
                  {snapshot.goals.map((goal) => (
                    <option value={goal.id}>{goal.title}</option>
                  ))}
                </select>
              </div>
            </>
          ) : null}
          {request.kind === 'commitment' ? (
            <>
              <div class="field full">
                <label for="commitment-title">Compromisso</label>
                <input
                  id="commitment-title"
                  name="title"
                  required
                  maxLength={180}
                  value={value('title')}
                />
              </div>
              <div class="field">
                <label for="commitment-start">Início</label>
                <input
                  id="commitment-start"
                  name="startsAt"
                  type="datetime-local"
                  required
                  value={toDateTimeLocal(request.values?.starts_at)}
                />
              </div>
              <div class="field">
                <label for="commitment-end">Fim</label>
                <input
                  id="commitment-end"
                  name="endsAt"
                  type="datetime-local"
                  value={toDateTimeLocal(request.values?.ends_at)}
                />
              </div>
              <div class="field">
                <label for="commitment-energy">Custo de energia</label>
                <input
                  id="commitment-energy"
                  name="energyCost"
                  type="number"
                  min="1"
                  max="5"
                  value={value('energy_cost', '3')}
                />
              </div>
              <div class="field">
                <label for="commitment-area">Área</label>
                <select id="commitment-area" name="areaId" value={value('area_id')}>
                  <option value="">Sem área</option>
                  {snapshot.areas.map((area) => (
                    <option value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div class="field full">
                <label for="commitment-notes">Notas</label>
                <textarea
                  id="commitment-notes"
                  name="notes"
                  maxLength={2000}
                  value={value('notes')}
                />
              </div>
            </>
          ) : null}
          {request.kind === 'review' ? (
            <>
              <div class="field">
                <label for="review-type">Ciclo</label>
                <select id="review-type" name="reviewType" value={value('review_type', 'weekly')}>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
              <div class="field">
                <label for="review-status">Estado</label>
                <select id="review-status" name="status" value={value('status', 'draft')}>
                  <option value="draft">Rascunho</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
              <div class="field">
                <label for="review-start">Início</label>
                <input
                  id="review-start"
                  name="periodStart"
                  type="date"
                  required
                  value={value('period_start', localDateISO())}
                />
              </div>
              <div class="field">
                <label for="review-end">Fim</label>
                <input
                  id="review-end"
                  name="periodEnd"
                  type="date"
                  required
                  value={value('period_end', localDateISO())}
                />
              </div>
              {(
                [
                  ['completedSummary', 'completed_summary', 'O que foi concluído'],
                  ['stalledSummary', 'stalled_summary', 'O que não avançou'],
                  ['blockers', 'blockers', 'Por que não avançou'],
                  ['energyDrains', 'energy_drains', 'O que consumiu energia'],
                  ['adjustments', 'adjustments', 'O que precisa mudar'],
                  ['nextPriorities', 'next_priorities', 'Próximas prioridades'],
                ] as const
              ).map(([name, key, label]) => (
                <div class="field full">
                  <label for={`review-${name}`}>{label}</label>
                  <textarea id={`review-${name}`} name={name} maxLength={5000} value={value(key)} />
                </div>
              ))}
            </>
          ) : null}
          {request.kind === 'area' ? (
            <>
              <div class="field full">
                <label for="area-name">Nome da área</label>
                <input id="area-name" name="name" required maxLength={80} value={value('name')} />
              </div>
              <div class="field full">
                <label for="area-description">Descrição</label>
                <textarea
                  id="area-description"
                  name="description"
                  maxLength={600}
                  value={value('description')}
                />
              </div>
              <div class="field">
                <label for="area-color">Cor de referência</label>
                <input
                  id="area-color"
                  name="color"
                  type="color"
                  value={value('color', '#FFC83D')}
                />
              </div>
            </>
          ) : null}
        </div>
        <div class="form-actions">
          <button
            class="button button-secondary"
            type="button"
            onClick={() => dialog.current?.close()}
          >
            Cancelar
          </button>
          <button
            class="button button-primary"
            type="submit"
            disabled={saving}
            data-testid="dialog-save"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default function PersonalOpsApp({ initialView, basePath }: Props) {
  const [view, setView] = useState<AppView>(initialView);
  const [user, setUser] = useState<User>();
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [dialog, setDialog] = useState<DialogRequest>();
  const [toast, setToast] = useState<{ message: string; tone?: 'error' }>();
  const [moreOpen, setMoreOpen] = useState(false);
  const userRef = useRef<User>();

  const refresh = useCallback(async (knownUser?: User) => {
    const currentUser = knownUser ?? userRef.current;
    if (!currentUser) return;
    const first = await loadWorkspace(currentUser);
    if (first.profile.onboarding_completed && (await ensureTodayInfrastructure(first))) {
      setSnapshot(await loadWorkspace(currentUser));
    } else {
      setSnapshot(first);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const boot = async () => {
      try {
        const { data, error: authError } = await getSupabase().auth.getUser();
        if (authError || !data.user) {
          window.location.replace(`${basePath}entrar/?motivo=sessao`);
          return;
        }
        if (!active) return;
        userRef.current = data.user;
        setUser(data.user);
        await refresh(data.user);
      } catch (bootError) {
        if (active)
          setError(
            bootError instanceof Error
              ? bootError.message
              : 'Não foi possível abrir o PersonalOps.',
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void boot();
    const { data: listener } = getSupabase().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') window.location.replace(`${basePath}entrar/?motivo=sessao`);
    });
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      active = false;
      listener.subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [basePath, refresh]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(undefined), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const mutate = useCallback(
    async (action: () => Promise<unknown>, success: string) => {
      if (!navigator.onLine) {
        setToast({ message: 'Sem conexão. Reconecte para salvar com segurança.', tone: 'error' });
        return;
      }
      setSaving(true);
      try {
        await action();
        await refresh();
        setToast({ message: success });
      } catch (mutationError) {
        setToast({
          message:
            mutationError instanceof Error ? mutationError.message : 'A alteração não foi salva.',
          tone: 'error',
        });
        throw mutationError;
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const saveDialog = async (request: DialogRequest, data: FormData) => {
    const nullable = (key: string) => String(data.get(key) ?? '').trim() || null;
    const text = (key: string) => String(data.get(key) ?? '').trim();
    await mutate(
      async () => {
        if (request.kind === 'task') {
          const values = {
            title: text('title'),
            notes: text('notes'),
            status: text('status') as Task['status'],
            estimated_minutes: nullable('estimatedMinutes')
              ? Number(data.get('estimatedMinutes'))
              : null,
            scheduled_date: nullable('scheduledDate'),
            due_date: nullable('dueDate'),
            area_id: nullable('areaId'),
            priority_id: nullable('priorityId'),
            goal_id: nullable('goalId'),
            project_id: nullable('projectId'),
            blocked_reason: text('blockedReason'),
            completed_at: text('status') === 'completed' ? new Date().toISOString() : null,
          };
          const task = request.id
            ? await updateRow('tasks', request.id, values)
            : await insertRow('tasks', values);
          await insertRow('task_events', {
            task_id: task.id,
            event_type: request.id ? 'updated' : 'created',
            to_status: task.status,
          });
        }
        if (request.kind === 'priority') {
          const values = {
            title: text('title'),
            rationale: text('rationale'),
            impact: Number(data.get('impact')),
            urgency: Number(data.get('urgency')),
            effort: Number(data.get('effort')),
            status: text('status') as Priority['status'],
            due_date: nullable('dueDate'),
            area_id: nullable('areaId'),
            goal_id: nullable('goalId'),
            completed_at: text('status') === 'completed' ? new Date().toISOString() : null,
          };
          if (request.id) await updateRow('priorities', request.id, values);
          else
            await insertRow('priorities', {
              ...values,
              position: snapshot?.priorities.length ?? 0,
            });
        }
        if (request.kind === 'routine') {
          const values = {
            title: text('title'),
            description: text('description'),
            frequency_type: text('frequencyType'),
            period: text('period') as Routine['period'],
            estimated_minutes: Number(data.get('estimatedMinutes')),
            scheduled_time: nullable('scheduledTime'),
            days_of_week: data.getAll('days').map(Number),
          };
          if (request.id) await updateRow('routines', request.id, values);
          else await insertRow('routines', values);
        }
        if (request.kind === 'goal') {
          const values = {
            title: text('title'),
            desired_outcome: text('desiredOutcome'),
            status: text('status') as Goal['status'],
            progress: Number(data.get('progress')),
            target_date: nullable('targetDate'),
            area_id: nullable('areaId'),
            completed_at: text('status') === 'completed' ? new Date().toISOString() : null,
          };
          if (request.id) await updateRow('goals', request.id, values);
          else await insertRow('goals', values);
        }
        if (request.kind === 'project') {
          const values = {
            name: text('name'),
            outcome: text('outcome'),
            status: text('status') as 'active' | 'paused' | 'completed' | 'cancelled',
            target_date: nullable('targetDate'),
            area_id: nullable('areaId'),
            goal_id: nullable('goalId'),
          };
          if (request.id) await updateRow('projects', request.id, values);
          else await insertRow('projects', values);
        }
        if (request.kind === 'commitment') {
          const start = text('startsAt');
          const end = text('endsAt');
          const values = {
            title: text('title'),
            starts_at: new Date(start).toISOString(),
            ends_at: end ? new Date(end).toISOString() : null,
            energy_cost: Number(data.get('energyCost')),
            area_id: nullable('areaId'),
            notes: text('notes'),
          };
          if (request.id) await updateRow('commitments', request.id, values);
          else await insertRow('commitments', values);
        }
        if (request.kind === 'review') {
          const values = {
            review_type: text('reviewType') as Review['review_type'],
            period_start: text('periodStart'),
            period_end: text('periodEnd'),
            status: text('status') as Review['status'],
            completed_summary: text('completedSummary'),
            stalled_summary: text('stalledSummary'),
            blockers: text('blockers'),
            energy_drains: text('energyDrains'),
            adjustments: text('adjustments'),
            next_priorities: text('nextPriorities'),
            completed_at: text('status') === 'completed' ? new Date().toISOString() : null,
          };
          if (request.id) await updateRow('reviews', request.id, values);
          else await insertRow('reviews', values);
        }
        if (request.kind === 'area') {
          const values = {
            name: text('name'),
            description: text('description'),
            color: text('color'),
            position: snapshot?.areas.length ?? 0,
          };
          if (request.id) await updateRow('areas', request.id, values);
          else await insertRow('areas', values);
        }
      },
      `${request.kind === 'review' ? 'Revisão' : request.kind === 'priority' ? 'Prioridade' : request.kind === 'routine' ? 'Rotina' : request.kind === 'goal' ? 'Objetivo' : request.kind === 'commitment' ? 'Compromisso' : request.kind === 'area' ? 'Área' : request.kind === 'project' ? 'Projeto' : 'Tarefa'} salva.`,
    );
    setDialog(undefined);
  };

  const navigate = (nextView: AppView, event?: MouseEvent) => {
    event?.preventDefault();
    setMoreOpen(false);
    setView(nextView);
    window.history.pushState({}, '', routeFor(basePath, nextView));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const primaryAction = useMemo<DialogKind>(() => {
    if (view === 'prioridades') return 'priority';
    if (view === 'rotinas') return 'routine';
    if (view === 'objetivos') return 'goal';
    if (view === 'revisoes') return 'review';
    return 'task';
  }, [view]);

  if (loading)
    return (
      <main id="conteudo" class="app-loading">
        <div class="loading-panel">
          <div class="loading-mark" aria-hidden="true" />
          <h1>Organizando seu sistema</h1>
          <p>Carregando dados protegidos…</p>
        </div>
      </main>
    );
  if (error || !user || !snapshot)
    return (
      <main id="conteudo" class="app-error">
        <div class="error-panel">
          <h1>Não foi possível abrir o sistema</h1>
          <p>{error || 'A sessão não está disponível.'}</p>
          <button
            class="button button-primary"
            type="button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={17} />
            Tentar novamente
          </button>
        </div>
      </main>
    );
  if (!snapshot.profile.onboarding_completed)
    return <Onboarding user={user} onComplete={() => refresh(user)} />;

  const viewProps: ViewProps = { snapshot, saving, openDialog: setDialog, mutate };
  return (
    <div class="app-shell">
      <aside class="app-sidebar">
        <a
          class="wordmark"
          href={routeFor(basePath, 'hoje')}
          onClick={(event) => navigate('hoje', event)}
        >
          personal<span>ops</span>
        </a>
        <nav class="app-nav" aria-label="Navegação do sistema">
          {NAV_ITEMS.map(({ view: itemView, label, icon: Icon }) => (
            <a
              href={routeFor(basePath, itemView)}
              aria-current={view === itemView ? 'page' : undefined}
              onClick={(event) => navigate(itemView, event)}
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
        </nav>
        <div class="sidebar-meta">
          <strong>{snapshot.profile.display_name || 'Meu sistema'}</strong>
          <span>{user.email}</span>
        </div>
      </aside>
      <main id="conteudo" class="app-main">
        {!online ? (
          <div class="offline-banner" role="status">
            <Activity size={17} />
            Sem conexão. A leitura continua disponível, mas salvamentos estão pausados.
          </div>
        ) : null}
        <header class="app-topbar">
          <div class="topbar-title">
            <span>PersonalOps</span>
            <h1>{TITLES[view]}</h1>
          </div>
          <div class="topbar-actions">
            <span class={`connection-state ${online ? '' : 'offline'}`}>
              <i />
              <span>{online ? 'Sincronizado' : 'Offline'}</span>
            </span>
            {view !== 'configuracoes' && view !== 'historico' ? (
              <button
                class="button button-primary"
                type="button"
                onClick={() => setDialog({ kind: primaryAction })}
              >
                <Plus size={17} />
                <span>Criar</span>
              </button>
            ) : null}
          </div>
        </header>
        {view === 'hoje' ? <TodayView {...viewProps} /> : null}
        {view === 'prioridades' ? <PrioritiesView {...viewProps} /> : null}
        {view === 'tarefas' ? <TasksView {...viewProps} /> : null}
        {view === 'rotinas' ? <RoutinesView {...viewProps} /> : null}
        {view === 'objetivos' ? <GoalsView {...viewProps} /> : null}
        {view === 'revisoes' ? <ReviewsView {...viewProps} /> : null}
        {view === 'historico' ? <HistoryView {...viewProps} /> : null}
        {view === 'configuracoes' ? (
          <SettingsView
            {...viewProps}
            onSignOut={() =>
              getSupabase()
                .auth.signOut()
                .then(() => undefined)
            }
          />
        ) : null}
      </main>
      {moreOpen ? (
        <nav class="mobile-more-menu" aria-label="Mais seções">
          {NAV_ITEMS.slice(4).map(({ view: itemView, label, icon: Icon }) => (
            <a
              href={routeFor(basePath, itemView)}
              aria-current={view === itemView ? 'page' : undefined}
              onClick={(event) => navigate(itemView, event)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      ) : null}
      <nav class="mobile-nav" aria-label="Navegação móvel">
        {NAV_ITEMS.slice(0, 4).map(({ view: itemView, label, icon: Icon }) => (
          <a
            href={routeFor(basePath, itemView)}
            aria-current={view === itemView ? 'page' : undefined}
            onClick={(event) => navigate(itemView, event)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </a>
        ))}
        <button
          type="button"
          aria-label="Abrir mais seções"
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((current) => !current)}
        >
          <Menu size={20} />
          <span>Mais</span>
        </button>
      </nav>
      {dialog ? (
        <DialogForm
          request={dialog}
          snapshot={snapshot}
          saving={saving}
          onClose={() => setDialog(undefined)}
          onSave={saveDialog}
        />
      ) : null}
      <div class="toast-region" aria-live="polite" aria-atomic="true">
        {toast ? <div class={`toast ${toast.tone ?? ''}`}>{toast.message}</div> : null}
      </div>
    </div>
  );
}
