import { expect, test } from "@playwright/test";

// Smoke test do golden path: lista carrega → abre conversa → envia mensagem →
// vê a bolha. É a jornada principal que justifica o app existir; cobrir só ela
// já dá muito sinal de regressão em troca de pouco custo de manutenção. Casos
// de erro/retry/IA seguem padrão e ficam pra evolução.
test("envia uma mensagem e ela aparece no histórico", async ({ page }) => {
  // Timeout maior cobre a primeira compilação de /c/[id] no Next dev.
  test.setTimeout(60_000);

  // 1) Carrega a lista pra descobrir um id válido do seed do server local
  //    (assim o teste não acopla a "c-1001" caso o seed mude).
  await page.goto("/");
  const firstConversation = page.locator('a[href^="/c/"]').first();
  await firstConversation.waitFor({ state: "visible" });
  const href = await firstConversation.getAttribute("href");
  expect(href).toMatch(/^\/c\//);

  // 2) Vai direto pela URL — evita o RSC prefetch via <Link> que dispara um
  //    Invariant intermitente no Next 15 dev (`clientReferenceManifest`
  //    indefinido no primeiro hit "frio" da rota dinâmica). page.goto força
  //    o request HTML completo, que compila a rota antes de servir.
  await page.goto(href!);

  // exact:true porque "Enviar mensagem" (botão) também daria match em
  // partial — e o strict-mode do Playwright reclamaria de ambiguidade.
  const composer = page.getByLabel("Mensagem", { exact: true });
  await composer.waitFor({ state: "visible" });

  const messageText = `e2e ping ${Date.now()}`;
  await composer.fill(messageText);
  await page.getByRole("button", { name: "Enviar mensagem" }).click();

  // O histórico expõe role="log" + aria-label "Histórico de mensagens"
  // (MessageList.tsx). Ancorar aí evita match acidental em qualquer outra
  // superfície da UI.
  const history = page.getByRole("log", { name: "Histórico de mensagens" });
  await expect(history.getByText(messageText)).toBeVisible({ timeout: 10_000 });
});
