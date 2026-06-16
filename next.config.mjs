import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sem isso o Next detecta o lockfile do $HOME e calcula o tracing a partir
  // de lá, gerando warning e (em alguns ambientes) erros sutis de resolução
  // em RSC. Travar no próprio diretório do projeto evita o falso positivo.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
