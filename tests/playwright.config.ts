import { defineConfig, devices } from "@playwright/test";

/**
 * Configuração do Playwright para o projeto SQA Social Media.
 *
 * IMPORTANTE: antes de rodar os testes, garanta que:
 *   - O backend está rodando em http://localhost:8080 (pasta /api)
 *   - O frontend está rodando em http://localhost:3000 (pasta /client)
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});