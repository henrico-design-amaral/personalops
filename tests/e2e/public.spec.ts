import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { expect, test } from './fixtures';

test('páginas públicas respondem, navegam e não têm violações sérias', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'PersonalOps organiza decisões antes de organizar listas',
  );
  await expect(page.getByRole('link', { name: /Abrir meu sistema/i })).toHaveAttribute(
    'href',
    /entrar/,
  );
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((item) => ['serious', 'critical'].includes(item.impact ?? '')),
  ).toEqual([]);

  await mkdir('output/playwright', { recursive: true });
  await page.screenshot({
    path: `output/playwright/home-${testInfo.project.name}.png`,
    fullPage: true,
  });

  await page.goto('/entrar/');
  await expect(page.getByLabel('E-mail')).toBeVisible();
  await expect(page.getByLabel('Senha')).toBeVisible();
  await page.getByRole('link', { name: 'Recuperar acesso' }).click();
  await expect(page).toHaveURL(/recuperar/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('rota protegida encerra sessão ausente com redirecionamento explícito', async ({ page }) => {
  await page.goto('/app/hoje/');
  await page.waitForURL(/\/entrar\/\?motivo=sessao/);
  await expect(
    page.getByRole('heading', { name: 'Volte ao que precisa de atenção.' }),
  ).toBeVisible();
});
