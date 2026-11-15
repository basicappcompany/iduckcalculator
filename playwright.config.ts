import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  // WASM codecs on a busy machine can be slow; a generous wait costs nothing when things are fast.
  expect: { timeout: 40_000 },
  fullyParallel: true,
  // Each test runs real codecs in its own browser, so more than 3 at once starves them of CPU.
  workers: 3,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Uses the Chrome already installed on the machine (and on GitHub's Ubuntu runners),
    // so no browser download is needed.
    channel: 'chrome',
  },
  // Tests run against the production build, which is what ships.
  // E2E_NO_BUILD=1 serves the dist/ that already exists (CI builds once in an earlier step; locally run `pnpm build` first). Without it the
  // site is rebuilt here, which on a slow machine can exceed the 180 s limit.
  webServer: {
    command: process.env['E2E_NO_BUILD'] ? `pnpm preview --host 127.0.0.1 --port ${PORT}` : `pnpm build && pnpm preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
