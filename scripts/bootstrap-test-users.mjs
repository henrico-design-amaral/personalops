import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

if (existsSync('.env.local')) config({ path: '.env.local' });
if (existsSync('.env.test') && !process.argv.includes('--force')) {
  throw new Error('.env.test já existe. Use --force somente para substituir as contas locais.');
}

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key)
  throw new Error('Configure PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_PUBLISHABLE_KEY.');

const stamp = Date.now().toString(36);
const accounts = [
  { label: 'A', email: `personalops-e2e-a-${stamp}@henrico.works` },
  { label: 'B', email: `personalops-e2e-b-${stamp}@henrico.works` },
].map((account) => ({ ...account, password: `${randomBytes(24).toString('base64url')}!9a` }));

for (const account of accounts) {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await client.auth.signUp({
    email: account.email,
    password: account.password,
    options: {
      data: { display_name: `E2E ${account.label}`, test_suite: 'personalops_e2e' },
    },
  });
  if (error) throw new Error(`Não foi possível criar o usuário ${account.label}: ${error.message}`);
}

const contents = [
  `E2E_USER_A_EMAIL=${accounts[0].email}`,
  `E2E_USER_A_PASSWORD=${accounts[0].password}`,
  `E2E_USER_B_EMAIL=${accounts[1].email}`,
  `E2E_USER_B_PASSWORD=${accounts[1].password}`,
  '',
].join('\n');
await writeFile('.env.test', contents, { encoding: 'utf8', mode: 0o600 });
console.log('Duas contas E2E foram criadas e as credenciais foram salvas apenas em .env.test.');
