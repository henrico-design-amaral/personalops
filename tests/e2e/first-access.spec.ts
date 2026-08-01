import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { expect, test } from './fixtures';

if (existsSync('.env.local')) config({ path: '.env.local' });
if (existsSync('.env.test')) config({ path: '.env.test' });

const url = process.env.PUBLIC_SUPABASE_URL;
const key = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = process.env.E2E_USER_B_EMAIL;
const password = process.env.E2E_USER_B_PASSWORD;

test.beforeEach(async ({}, testInfo) => {
  test.skip(
    !['desktop-1440', 'mobile-390'].includes(testInfo.project.name),
    'Primeiro acesso coberto nos extremos desktop e mobile.',
  );
  test.skip(!url || !key || !email || !password, 'Ambiente E2E B não configurado.');

  const client = createClient(url ?? '', key ?? '');
  const { data, error: authError } = await client.auth.signInWithPassword({
    email: email ?? '',
    password: password ?? '',
  });
  if (authError || !data.user) throw authError ?? new Error('Usuário E2E B não autenticado.');
  const { error } = await client
    .from('profiles')
    .update({ onboarding_completed: false, display_name: '' })
    .eq('id', data.user.id);
  if (error) throw error;
  await client.auth.signOut();
});

test('primeiro acesso configura e persiste o perfil', async ({ page }, testInfo) => {
  const displayName = testInfo.project.name === 'mobile-390' ? 'Pessoa mobile' : 'Pessoa desktop';
  await page.goto('/entrar/');
  await page.getByLabel('E-mail').fill(email ?? '');
  await page.getByLabel('Senha').fill(password ?? '');
  await page.getByRole('button', { name: 'Entrar no sistema' }).click();
  await page.waitForURL(/\/app\/hoje\//);

  const onboarding = page.getByRole('heading', { name: 'Ajuste o sistema ao seu dia.' });
  await expect(onboarding).toBeVisible({ timeout: 20_000 });
  await page.getByLabel('Como você quer ser chamado').fill(displayName);
  await page.getByRole('button', { name: 'Abrir meu sistema' }).click();
  await expect(onboarding).toBeHidden({ timeout: 30_000 });
  await expect(page.getByRole('heading', { name: 'Hoje', exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hoje', exact: true })).toBeVisible({
    timeout: 20_000,
  });
  if (testInfo.project.name === 'mobile-390') {
    await page.getByRole('button', { name: 'Abrir mais seções' }).click();
    await page.getByRole('link', { name: 'Configurações' }).last().click();
    await expect(page.getByLabel('Nome')).toHaveValue(displayName);
  } else {
    await expect(page.getByText(displayName)).toBeVisible();
  }
});
