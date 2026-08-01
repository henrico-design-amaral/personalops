import type {
  EnergyCheckin,
  Priority,
  RoutineOccurrence,
  Task,
  TodaySummary,
  WorkspaceSnapshot,
} from './types';

export function localDateISO(date = new Date()): string {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function priorityScore(priority: Pick<Priority, 'impact' | 'urgency' | 'effort'>): number {
  return priority.impact * 2 + priority.urgency * 2 - priority.effort;
}

export function isOverdue(
  task: Pick<Task, 'due_date' | 'status' | 'deleted_at'>,
  today: string,
): boolean {
  return Boolean(
    !task.deleted_at &&
      task.due_date &&
      task.due_date < today &&
      !['completed', 'cancelled'].includes(task.status),
  );
}

export function latestEnergy(checkins: EnergyCheckin[]): EnergyCheckin | undefined {
  return [...checkins].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))[0];
}

export function buildTodaySummary(
  snapshot: WorkspaceSnapshot,
  today = localDateISO(),
): TodaySummary {
  const tasks = snapshot.tasks.filter((task) => !task.deleted_at);
  const todayTasks = tasks.filter((task) => task.scheduled_date === today);
  const occurrences = snapshot.routineOccurrences.filter(
    (occurrence) => occurrence.occurrence_date === today,
  );
  const plan = snapshot.dailyPlans.find((candidate) => candidate.plan_date === today);

  return {
    planned: todayTasks.length,
    completed: todayTasks.filter((task) => task.status === 'completed').length,
    overdue: tasks.filter((task) => isOverdue(task, today)).length,
    blocked: tasks.filter((task) => task.status === 'blocked').length,
    routineCompleted: occurrences.filter((occurrence) => occurrence.status === 'completed').length,
    routineTotal: occurrences.length,
    capacityMinutes: plan?.capacity_minutes ?? snapshot.profile.default_daily_capacity_minutes,
    plannedMinutes: todayTasks.reduce((total, task) => total + (task.estimated_minutes ?? 0), 0),
  };
}

export function recommendNextStep(snapshot: WorkspaceSnapshot, today = localDateISO()): string {
  const energy = latestEnergy(
    snapshot.energyCheckins.filter((checkin) => checkin.recorded_at.startsWith(today)),
  );
  if (!energy) return 'Registre energia e capacidade para calibrar o dia.';

  const activeTasks = snapshot.tasks.filter(
    (task) => !task.deleted_at && !['completed', 'cancelled'].includes(task.status),
  );
  const blocked = activeTasks.find((task) => task.status === 'blocked');
  if (blocked) return `Destrave “${blocked.title}” antes de adicionar mais trabalho.`;

  const overdue = activeTasks
    .filter((task) => isOverdue(task, today))
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))[0];
  if (overdue) return `Replaneje ou conclua “${overdue.title}”, que está atrasada.`;

  const todayTasks = activeTasks.filter((task) => task.scheduled_date === today);
  const candidate = [...todayTasks].sort((a, b) => {
    if (energy.energy_level <= 2)
      return (a.estimated_minutes ?? 999) - (b.estimated_minutes ?? 999);
    return (b.estimated_minutes ?? 0) - (a.estimated_minutes ?? 0);
  })[0];
  if (candidate) return `Execute “${candidate.title}” como próximo passo concreto.`;

  const priority = [...snapshot.priorities]
    .filter((item) => item.status === 'active')
    .sort((a, b) => priorityScore(b) - priorityScore(a))[0];
  if (priority) return `Defina uma tarefa executável para “${priority.title}”.`;

  return 'Escolha uma prioridade real antes de preencher a agenda.';
}

export function completionRate(occurrences: RoutineOccurrence[]): number {
  if (occurrences.length === 0) return 0;
  const completed = occurrences.filter((occurrence) => occurrence.status === 'completed').length;
  return Math.round((completed / occurrences.length) * 100);
}
