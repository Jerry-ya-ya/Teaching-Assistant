import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:4173/Teaching-Assistant/', headless: true, viewport: { width: 1440, height: 1000 } },
  webServer: { command: 'node scripts/preview.mjs', url: 'http://127.0.0.1:4173/Teaching-Assistant/', reuseExistingServer: !process.env['CI'] },
});
