import { ConnectionCheck } from "@/components/ConnectionCheck";

export default function HealthPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Health check</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Página de debug. Confere se a API definida em{" "}
        <code className="rounded bg-muted px-1">NEXT_PUBLIC_API_URL</code> está respondendo.
      </p>

      <div className="mt-6 rounded-lg border border-border p-4">
        <h2 className="text-sm font-medium text-muted-foreground">Verificação de conexão com a API</h2>
        <ConnectionCheck />
      </div>
    </main>
  );
}
