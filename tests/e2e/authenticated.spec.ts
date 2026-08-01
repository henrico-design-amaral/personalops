import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { expect, test } from './fixtures';

if (existsSync('.env.test')) config({ path: '.env.test' });
const email = process.env.E2E_USER_A_EMAIL;
const password = process.env.E2E_USER_A_PASSWORD;

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(
    !['desktop-1440', 'mobile-390'].includes(testInfo.project.name),
    'Fluxos funcionais completos cobertos em desktop e mobile; as demais larguras cobrem QA pública.',
  );
  test.skip(!email || !password, 'Credenciais E2E não configuradas.');
  await page.goto('/entrar/');
  await page.getByLabel('E-mail').fill(email ?? '');
  await page.getByLabel('Senha').fill(password ?? '');
  await page.getByRole('button', { name: 'Entrar no sistema' }).click();
  await page.waitForURL(/\/app\/hoje\//);
  await expect(page.getByText('Carregando dados protegidos…')).toBeHidden({ timeout: 20_000 });
  const onboarding = page.getByRole('heading', { name: 'Ajuste o sistema ao seu dia.' });
  if (await onboarding.isVisible()) {
    await page.getByLabel('Como você quer ser chamado').fill('Pessoa de teste');
    await page.getByRole('button', { name: 'Abrir meu sistema' }).click();
    await expect(onboarding).toBeHidden({ timeout: 20_000 });
  }
  await expect(page.getByRole('heading', { name: 'Hoje', exact: true })).toBeVisible();
});

test('organiza e persiste o dia real', async ({ page }, testInfo) => {
  const marker = `E2E ${Date.now()}`;
  await page.getByRole('button', { name: 'Registrar estado' }).click();
  await expect(page.getByText('Estado do dia registrado.')).toBeVisible();

  await page.getByRole('link', { name: 'Prioridades' }).first().click();
  await page.getByRole('button', { name: 'Nova prioridade' }).click();
  await page
    .getByRole('textbox', { name: 'Resultado prioritário', exact: true })
    .fill(`${marker} prioridade`);
  await page.getByLabel('Por que merece atenção').fill('Prova operacional E2E.');
  await page.getByTestId('dialog-save').click();
  await expect(page.getByText('Prioridade salva.')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(`${marker} prioridade`)).toBeVisible();

  await page.getByRole('link', { name: 'Tarefas' }).first().click();
  await page.getByRole('button', { name: 'Nova tarefa' }).click();
  await page.getByLabel('Próximo passo').fill(`${marker} tarefa`);
  await page.getByLabel('Agendar para').fill(new Date().toISOString().slice(0, 10));
  await page.getByLabel('Prioridade').selectOption({ label: `${marker} prioridade` });
  await page.getByTestId('dialog-save').click();
  await expect(page.getByText('Tarefa salva.')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(`${marker} tarefa`)).toBeVisible();
  await page.getByRole('button', { name: `Concluir ${marker} tarefa` }).click();
  await expect(page.getByText('Tarefa concluída.')).toBeVisible();
  await page.reload();
  await page.getByLabel('Filtrar tarefas por status').selectOption('all');
  await expect(page.getByText(`${marker} tarefa`)).toBeVisible();
  await page.getByRole('link', { name: 'Hoje' }).first().click();
  await expect(page.getByText(`${marker} tarefa`)).toBeVisible();

  await mkdir('output/playwright', { recursive: true });
  await page.screenshot({
    path: `output/playwright/tasks-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test('cria rotina e revisão persistentes', async ({ page }, testInfo) => {
  const marker = `E2E ${Date.now()}`;
  await page.getByRole('link', { name: 'Rotinas' }).first().click();
  await page.getByRole('button', { name: 'Nova rotina' }).click();
  await page.getByLabel('Nome da rotina').fill(`${marker} rotina`);
  await page.getByTestId('dialog-save').click();
  await expect(page.getByText('Rotina salva.')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(`${marker} rotina`)).toBeVisible();

  await page.getByRole('link', { name: 'Hoje' }).first().click();
  await page.getByRole('button', { name: `Concluir ${marker} rotina` }).click();
  await expect(page.getByText('Rotina registrada.')).toBeVisible();

  const reviewsLink = page.getByRole('link', { name: 'Revisões' });
  const moreButton = page.getByRole('button', { name: 'Abrir mais seções' });
  if (await moreButton.isVisible()) {
    await moreButton.click();
    await reviewsLink.last().click();
  } else {
    await reviewsLink.first().click();
  }
  await page.getByRole('button', { name: /Nova revisão/i }).click();
  await page
    .getByLabel('Ciclo')
    .selectOption(testInfo.project.name === 'mobile-390' ? 'daily' : 'weekly');
  await page.getByLabel('O que foi concluído').fill(`${marker} avançou`);
  await page.getByLabel('Próximas prioridades').fill('Continuar a validação real.');
  await page.getByTestId('dialog-save').click();
  await expect(page.getByText('Revisão salva.')).toBeVisible();
  await page.reload();
  await expect(page.getByText(`${marker} avançou`)).toBeVisible();
  const createdReview = page.getByRole('article').filter({ hasText: `${marker} avançou` });
  page.once('dialog', (dialog) => dialog.accept());
  await createdReview.getByRole('button', { name: 'Excluir revisão' }).click();
  await expect(createdReview).toBeHidden();
});

test('logout remove a sessão persistida', async ({ page }) => {
  const settingsLink = page.getByRole('link', { name: 'Configurações' });
  const moreButton = page.getByRole('button', { name: 'Abrir mais seções' });
  if (await moreButton.isVisible()) {
    await moreButton.click();
    await settingsLink.last().click();
  } else {
    await settingsLink.first().click();
  }
  await page.getByRole('button', { name: 'Sair do PersonalOps' }).click();
  await page.waitForURL(/\/entrar\/\?motivo=sessao/);
  await page.goto('/app/hoje/');
  await page.waitForURL(/\/entrar\/\?motivo=sessao/);
});
