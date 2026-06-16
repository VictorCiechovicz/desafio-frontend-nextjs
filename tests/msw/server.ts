import { setupServer } from "msw/node";

// Servidor MSW único para o lifecycle do Vitest. Handlers por teste vão via
// server.use(...) — manter o set padrão vazio força cada spec a declarar
// explicitamente o que mocka, evitando vazamento entre testes.
export const server = setupServer();
