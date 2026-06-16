import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./tests/msw/server";

// MSW v2: o handler-set padrão é vazio; cada teste registra handlers via
// server.use(...). onUnhandledRequest:"error" garante que qualquer chamada
// não-mockada estoura ao invés de cair silenciosamente em rede real.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// jsdom não implementa scrollTo; alguns componentes (MessageList) chamam.
// Stub minimalista pra evitar exceção em testes que renderizem essa árvore.
if (typeof window !== "undefined" && !window.HTMLElement.prototype.scrollTo) {
  window.HTMLElement.prototype.scrollTo = () => {};
}
