import type { Tables } from '../../types/database';

export type Area = Tables<'areas'>;
export type Commitment = Tables<'commitments'>;
export type DailyPlan = Tables<'daily_plans'>;
export type EnergyCheckin = Tables<'energy_checkins'>;
export type Goal = Tables<'goals'>;
export type Priority = Tables<'priorities'>;
export type Profile = Tables<'profiles'>;
export type Project = Tables<'projects'>;
export type ProgressEntry = Tables<'progress_entries'>;
export type Review = Tables<'reviews'>;
export type Routine = Tables<'routines'>;
export type RoutineOccurrence = Tables<'routine_occurrences'>;
export type Task = Tables<'tasks'>;
export type TaskEvent = Tables<'task_events'>;

export type AppView =
  | 'hoje'
  | 'prioridades'
  | 'tarefas'
  | 'rotinas'
  | 'objetivos'
  | 'revisoes'
  | 'historico'
  | 'configuracoes';

export interface WorkspaceSnapshot {
  profile: Profile;
  areas: Area[];
  goals: Goal[];
  projects: Project[];
  priorities: Priority[];
  tasks: Task[];
  commitments: Commitment[];
  routines: Routine[];
  routineOccurrences: RoutineOccurrence[];
  energyCheckins: EnergyCheckin[];
  dailyPlans: DailyPlan[];
  reviews: Review[];
  progressEntries: ProgressEntry[];
  taskEvents: TaskEvent[];
}

export interface TodaySummary {
  planned: number;
  completed: number;
  overdue: number;
  blocked: number;
  routineCompleted: number;
  routineTotal: number;
  capacityMinutes: number;
  plannedMinutes: number;
}
