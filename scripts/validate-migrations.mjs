import { readdir, readFile } from 'node:fs/promises';

const directory = new URL('../supabase/migrations/', import.meta.url);
const files = (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort();
if (files.length < 2)
  throw new Error('A migration principal e a migration de índices são obrigatórias.');

const versions = files.map((name) => name.slice(0, 14));
if (
  new Set(versions).size !== versions.length ||
  versions.some((version) => !/^\d{14}$/.test(version))
) {
  throw new Error('As migrations precisam ter timestamps únicos de 14 dígitos.');
}

const sql = (await Promise.all(files.map((name) => readFile(new URL(name, directory), 'utf8'))))
  .join('\n')
  .toLowerCase();

const tables = [
  'profiles',
  'areas',
  'goals',
  'projects',
  'priorities',
  'tasks',
  'commitments',
  'routines',
  'routine_occurrences',
  'energy_checkins',
  'daily_plans',
  'daily_plan_items',
  'reviews',
  'progress_entries',
  'task_events',
];

for (const table of tables) {
  if (!sql.includes(`create table public.${table}`)) throw new Error(`Tabela ausente: ${table}`);
}
for (const operation of ['select', 'insert', 'update', 'delete']) {
  if (!sql.includes(`for ${operation} to authenticated`)) {
    throw new Error(`Políticas RLS de ${operation} não foram encontradas.`);
  }
}
if (!sql.includes('enable row level security') || !sql.includes('force row level security')) {
  throw new Error('RLS precisa estar habilitado e forçado.');
}
if (/service[_ -]?role/.test(sql)) throw new Error('Migration não deve depender de service_role.');

console.log(`${files.length} migrations e ${tables.length} tabelas validadas.`);
