import type { User } from '@supabase/supabase-js';
import { getSupabase } from '../supabase/client';
import { localDateISO } from '../domain/personalops';
import type { WorkspaceSnapshot } from '../domain/types';
import type { Database, TablesInsert, TablesUpdate } from '../../types/database';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Row<T extends TableName> = Tables[T]['Row'];
type Insert<T extends TableName> = TablesInsert<T>;
type Update<T extends TableName> = TablesUpdate<T>;

function failure(context: string, error: { message: string } | null): never {
  throw new Error(error ? `${context}: ${error.message}` : context);
}

export async function insertRow<T extends TableName>(table: T, values: Insert<T>): Promise<Row<T>> {
  const { data, error } = await getSupabase()
    .from(table as 'tasks')
    .insert(values as never)
    .select()
    .single();
  if (error || !data) return failure(`Não foi possível criar em ${table}`, error);
  return data as unknown as Row<T>;
}

export async function updateRow<T extends TableName>(
  table: T,
  id: string,
  values: Update<T>,
): Promise<Row<T>> {
  const { data, error } = await getSupabase()
    .from(table as 'tasks')
    .update(values as never)
    .eq('id', id)
    .select()
    .single();
  if (error || !data) return failure(`Não foi possível atualizar ${table}`, error);
  return data as unknown as Row<T>;
}

export async function removeRow<T extends TableName>(table: T, id: string): Promise<void> {
  const { error } = await getSupabase()
    .from(table as 'tasks')
    .delete()
    .eq('id', id);
  if (error) failure(`Não foi possível excluir de ${table}`, error);
}

export async function ensureProfile(user: User): Promise<void> {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (error) failure('Não foi possível consultar o perfil', error);
  if (!data) {
    const { error: insertError } = await getSupabase()
      .from('profiles')
      .insert({
        id: user.id,
        display_name: String(user.user_metadata.display_name ?? ''),
      });
    if (insertError) failure('Não foi possível ativar o perfil', insertError);
  }
}

export async function completeOnboarding(
  userId: string,
  values: { displayName: string; timezone: string; capacityMinutes: number },
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from('profiles')
    .update({
      display_name: values.displayName,
      timezone: values.timezone,
      default_daily_capacity_minutes: values.capacityMinutes,
      onboarding_completed: true,
    })
    .eq('id', userId);
  if (error) failure('Não foi possível concluir a configuração', error);

  const { count, error: countError } = await client
    .from('areas')
    .select('*', { count: 'exact', head: true });
  if (countError) failure('Não foi possível consultar as áreas', countError);
  if ((count ?? 0) === 0) {
    const { error: areasError } = await client.from('areas').insert([
      { name: 'Pessoal', color: '#FFC83D', position: 0 },
      { name: 'Trabalho', color: '#245D52', position: 1 },
      { name: 'Saúde', color: '#C95A3B', position: 2 },
    ]);
    if (areasError) failure('Não foi possível criar as áreas iniciais', areasError);
  }
}

export async function ensureTodayInfrastructure(snapshot: WorkspaceSnapshot): Promise<boolean> {
  const client = getSupabase();
  const today = localDateISO();
  let changed = false;

  if (!snapshot.dailyPlans.some((plan) => plan.plan_date === today)) {
    const { error } = await client.from('daily_plans').insert({
      plan_date: today,
      capacity_minutes: snapshot.profile.default_daily_capacity_minutes,
    });
    if (error && error.code !== '23505') failure('Não foi possível abrir o plano de hoje', error);
    changed = !error;
  }

  const weekday = new Date(`${today}T12:00:00`).getDay();
  const existing = new Set(
    snapshot.routineOccurrences
      .filter((occurrence) => occurrence.occurrence_date === today)
      .map((occurrence) => occurrence.routine_id),
  );
  const missing = snapshot.routines
    .filter(
      (routine) =>
        routine.status === 'active' &&
        !existing.has(routine.id) &&
        (routine.frequency_type === 'daily' || routine.days_of_week.includes(weekday)),
    )
    .map((routine) => ({ routine_id: routine.id, occurrence_date: today }));

  if (missing.length > 0) {
    const { error } = await client
      .from('routine_occurrences')
      .upsert(missing, { onConflict: 'routine_id,occurrence_date', ignoreDuplicates: true });
    if (error) failure('Não foi possível preparar as rotinas de hoje', error);
    changed = true;
  }

  return changed;
}

export async function loadWorkspace(user: User): Promise<WorkspaceSnapshot> {
  await ensureProfile(user);
  const client = getSupabase();
  // Limita o fan-out por lote. Disparar todas as consultas simultaneamente
  // satura conexões do navegador e torna o refresh frágil em redes reais.
  const [profile, areas, goals, projects, priorities] = await Promise.all([
    client.from('profiles').select('*').eq('id', user.id).single(),
    client.from('areas').select('*').order('position'),
    client.from('goals').select('*').order('created_at', { ascending: false }),
    client.from('projects').select('*').order('created_at', { ascending: false }),
    client.from('priorities').select('*').order('position'),
  ]);
  const [tasks, commitments, routines, routineOccurrences, energyCheckins] = await Promise.all([
    client
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    client.from('commitments').select('*').order('starts_at'),
    client.from('routines').select('*').order('created_at'),
    client
      .from('routine_occurrences')
      .select('*')
      .order('occurrence_date', { ascending: false })
      .limit(120),
    client
      .from('energy_checkins')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(120),
  ]);
  const [dailyPlans, reviews, progressEntries, taskEvents] = await Promise.all([
    client.from('daily_plans').select('*').order('plan_date', { ascending: false }).limit(90),
    client.from('reviews').select('*').order('period_start', { ascending: false }).limit(50),
    client
      .from('progress_entries')
      .select('*')
      .order('recorded_on', { ascending: false })
      .limit(100),
    client.from('task_events').select('*').order('created_at', { ascending: false }).limit(150),
  ]);

  const results = [
    profile,
    areas,
    goals,
    projects,
    priorities,
    tasks,
    commitments,
    routines,
    routineOccurrences,
    energyCheckins,
    dailyPlans,
    reviews,
    progressEntries,
    taskEvents,
  ];
  const firstError = results.find((result) => result.error)?.error;
  if (firstError) failure('Não foi possível carregar o workspace', firstError);
  if (!profile.data) failure('Perfil não encontrado', null);

  return {
    profile: profile.data,
    areas: areas.data ?? [],
    goals: goals.data ?? [],
    projects: projects.data ?? [],
    priorities: priorities.data ?? [],
    tasks: tasks.data ?? [],
    commitments: commitments.data ?? [],
    routines: routines.data ?? [],
    routineOccurrences: routineOccurrences.data ?? [],
    energyCheckins: energyCheckins.data ?? [],
    dailyPlans: dailyPlans.data ?? [],
    reviews: reviews.data ?? [],
    progressEntries: progressEntries.data ?? [],
    taskEvents: taskEvents.data ?? [],
  };
}
