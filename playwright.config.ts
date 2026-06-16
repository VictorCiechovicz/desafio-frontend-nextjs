import { defineConfig, devices } from "@playwright/test";

// E2E aponta para o servidor local em :4000 e a app Next em :3000. Os dois sobem
// via `webServer` do Playwright — o runner aguarda cada porta antes de
// começar os testes. Em CI, reuseExistingServer:true evita re-builds; localmente
// também é o que queremos quando o dev já tem `npm run dev` rodando.
const PORT = 3000;
const API_PORT = 4000;

export default defineConfig({
  testDir: "./tests/e2e",
  // Um worker só: temos um único spec por enquanto e o backend in-memory não
  // foi pensado pra concorrência (mutações cruzariam entre cenários).
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      // Sobe o backend in-memory. cwd aponta pro diretório `server/` porque
      // o local.mjs importa via caminho relativo `./src/router.mjs`.
      command: "node local.mjs",
      cwd: "./server",
      url: `http://localhost:${API_PORT}/conversations`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      // Next em modo dev pra iterar rápido sem build prévio. NEXT_PUBLIC_* é
      // resolvida em runtime no client; o dev server respeita o env injetado
      // aqui (sobrepondo .env do projeto).
      command: "npm run dev",
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_URL: `http://localhost:${API_PORT}`,
      },
    },
  ],
});
