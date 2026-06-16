"use client";

import { useEffect, useState } from "react";

// Atrasa a propagação de uma flag booleana — só vira true se ela ficar true
// por mais que `delayMs`. Usado pra esconder indicadores de "Atualizando…"
// durante o polling normal (5s/3s): em rede saudável o refetch resolve em
// dezenas de ms, então piscar o indicador é puro ruído. Quando o fetch
// realmente demora (rede ruim, backend lento), o indicador aparece e cumpre
// seu papel original de avisar que os dados estão chegando.
//
// Padrão equivalente ao "loading shimmer" do Gmail/Slack: silencioso no caso
// feliz, presente quando faz diferença.
export function useDelayedFlag(flag: boolean, delayMs = 600): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!flag) {
      setDelayed(false);
      return;
    }
    const t = setTimeout(() => setDelayed(true), delayMs);
    return () => clearTimeout(t);
  }, [flag, delayMs]);

  return delayed;
}
