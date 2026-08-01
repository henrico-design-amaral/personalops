import { existsSync } from 'node:fs';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

if (existsSync('.env.local')) config({ path: '.env.local' });
if (existsSync('.env.test')) config({ path: '.env.test', override: true });

const required = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'E2E_USER_A_EMAIL',
  'E2E_USER_A_PASSWORD',
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Configuração de seed ausente: ${missing.join(', ')}`);

const client = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false },
  },
);
const { data: auth, error: authError } = await client.auth.signInWithPassword({
  email: process.env.E2E_USER_A_EMAIL,
  password: process.env.E2E_USER_A_PASSWORD,
});
if (authError || !auth.user) throw new Error(`Login de seed falhou: ${authError?.message}`);

const today = new Date().toISOString().slice(0, 10);
const upsertOne = async (table, values, match) => {
  const { data: existing, error: lookupError } = await client
    .from(table)
    .select('id')
    .match(match)
    .maybeSingle();
  if (lookupError) throw new Error(`Consulta de seed ${table}: ${lookupError.message}`);
  const query = existing
    ? client.from(table).update(values).eq('id', existing.id)
    : client.from(table).insert(values);
  const { data, error } = await query.select().single();
  if (error) throw new Error(`Seed ${table}: ${error.message}`);
  return data;
};

const area = await upsertOne(
  'areas',
  { name: 'Vida pessoal', description: 'Cuidado, casa e relações.', color: '#FFC83D' },
  { name: 'Vida pessoal' },
);
const goal = await upsertOne(
  'goals',
  {
    title: 'Recuperar margem no cotidiano',
    desired_outcome: 'Encerrar a semana com capacidade preservada.',
    area_id: area.id,
    status: 'active',
    progress: 20,
  },
  { title: 'Recuperar margem no cotidiano' },
);
const priority = await upsertOne(
  'priorities',
  {
    title: 'Proteger a manhã de trabalho profundo',
    rationale: 'O avanço mais importante depende de energia alta.',
    area_id: area.id,
    goal_id: goal.id,
    impact: 5,
    urgency: 4,
    effort: 3,
    position: 0,
  },
  { title: 'Proteger a manhã de trabalho profundo' },
);
await upsertOne(
  'tasks',
  {
    title: 'Definir o primeiro bloco de foco',
    notes: 'Seed de desenvolvimento; pode ser removido.',
    area_id: area.id,
    goal_id: goal.id,
    priority_id: priority.id,
    scheduled_date: today,
    due_date: today,
    estimated_minutes: 30,
    status: 'planned',
  },
  { title: 'Definir o primeiro bloco de foco' },
);
await upsertOne(
  'routines',
  {
    title: 'Revisão de abertura',
    description: 'Ler capacidade e escolher o próximo passo.',
    frequency_type: 'daily',
    days_of_week: [0, 1, 2, 3, 4, 5, 6],
    period: 'morning',
    estimated_minutes: 10,
  },
  { title: 'Revisão de abertura' },
);
const { error: energyError } = await client.from('energy_checkins').insert({
  energy_level: 3,
  capacity_level: 3,
  period: 'morning',
  impact_note: 'Registro criado pelo seed de desenvolvimento.',
});
if (energyError) throw new Error(`Seed energy_checkins: ${energyError.message}`);
await client.auth.signOut();
console.log('Seed de desenvolvimento persistido para um usuário autenticado.');
