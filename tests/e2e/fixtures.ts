import { expect, test as base } from '@playwright/test';

type RuntimeHealth = {
  runtimeHealth: void;
};

function requestLabel(rawURL: string): string {
  try {
    const url = new URL(rawURL);
    return `${url.origin}${url.pathname}`;
  } catch {
    return rawURL;
  }
}

export const test = base.extend<RuntimeHealth>({
  runtimeHealth: [
    async ({ page }, use) => {
      const failures: string[] = [];
      page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error') failures.push(`console: ${message.text()}`);
      });
      page.on('requestfailed', (request) => {
        const reason = request.failure()?.errorText ?? 'unknown';
        if (reason !== 'net::ERR_ABORTED') {
          failures.push(`request: ${requestLabel(request.url())} (${reason})`);
        }
      });
      page.on('response', (response) => {
        if (response.status() >= 500) {
          failures.push(`response: ${requestLabel(response.url())} (${response.status()})`);
        }
      });

      await use();
      expect(failures, 'Console, exceções e requests críticas precisam permanecer limpos.').toEqual(
        [],
      );
    },
    { auto: true },
  ],
});

export { expect };
