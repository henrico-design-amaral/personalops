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
  'E2E_USER_B_EMAIL',
  'E2E_USER_B_PASSWORD',
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Credenciais de teste ausentes: ${missing.join(', ')}`);

const makeClient = () =>
  createClient(process.env.PUBLIC_SUPABASE_URL, process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const a = makeClient();
const b = makeClient();

const signIn = async (client, email, password, label) => {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(`Login do usuário ${label} falhou: ${error?.message}`);
  return data.user;
};

const userA = await signIn(a, process.env.E2E_USER_A_EMAIL, process.env.E2E_USER_A_PASSWORD, 'A');
const userB = await signIn(b, process.env.E2E_USER_B_EMAIL, process.env.E2E_USER_B_PASSWORD, 'B');
if (userA.id === userB.id) throw new Error('O teste exige dois usuários distintos.');

const marker = `RLS ${Date.now()}`;
const { data: rowA, error: insertAError } = await a
  .from('areas')
  .insert({ name: `${marker} A`, color: '#FFC83D' })
  .select()
  .single();
if (insertAError || !rowA)
  throw new Error(`Usuário A não conseguiu inserir: ${insertAError?.message}`);

const { data: visibleToB, error: readBError } = await b
  .from('areas')
  .select('id')
  .eq('id', rowA.id);
if (readBError) throw readBError;
if (visibleToB.length !== 0) throw new Error('Falha RLS: B leu o registro de A.');

const { data: updatedByB, error: updateBError } = await b
  .from('areas')
  .update({ name: 'invasão' })
  .eq('id', rowA.id)
  .select('id');
if (updateBError) throw updateBError;
if (updatedByB.length !== 0) throw new Error('Falha RLS: B alterou o registro de A.');

const { error: forgedInsertError } = await b.from('areas').insert({
  name: `${marker} forjado`,
  user_id: userA.id,
  color: '#FFC83D',
});
if (!forgedInsertError) throw new Error('Falha RLS: B criou um registro em nome de A.');

const { data: rowB, error: insertBError } = await b
  .from('areas')
  .insert({ name: `${marker} B`, color: '#245D52' })
  .select()
  .single();
if (insertBError || !rowB)
  throw new Error(`Usuário B não conseguiu inserir: ${insertBError?.message}`);

const { data: visibleToA, error: readAError } = await a
  .from('areas')
  .select('id')
  .eq('id', rowB.id);
if (readAError) throw readAError;
if (visibleToA.length !== 0) throw new Error('Falha RLS: A leu o registro de B.');

await Promise.all([
  a.from('areas').delete().eq('id', rowA.id),
  b.from('areas').delete().eq('id', rowB.id),
]);
await Promise.all([a.auth.signOut(), b.auth.signOut()]);
console.log('RLS validado: leitura, alteração e identidade forjada foram isoladas entre A e B.');
