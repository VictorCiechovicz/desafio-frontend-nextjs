"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { useSuggestReply } from "@/lib/hooks/useSuggestReply";

interface Props {
  conversationId: string;
}

// Altura máxima do textarea em px (~5 linhas com text-sm + leading-relaxed).
// Acima disso o conteúdo rola dentro do textarea em vez de empurrar o layout.
const MAX_TEXTAREA_HEIGHT_PX = 140;
const ERROR_TOAST_DURATION_MS = 4_000;

export function Composer({ conversationId }: Props) {
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestionSource, setSuggestionSource] = useState<"mock" | "mock-fallback" | null>(
    null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const helperId = useId();

  const sendMutation = useSendMessage(conversationId);
  const suggestMutation = useSuggestReply(conversationId);

  // Auto-grow: redimensiona o textarea conforme o conteúdo até o cap.
  // Setamos height=auto antes pra que scrollHeight reflita o tamanho real
  // (sem isso o textarea só "cresce" e nunca encolhe ao apagar texto).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [text]);

  // O toast de erro some sozinho depois de alguns segundos pra não exigir
  // ação do usuário (erro de IA não bloqueia o fluxo de envio).
  useEffect(() => {
    if (!errorMessage) return;
    const timeout = setTimeout(() => setErrorMessage(null), ERROR_TOAST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [errorMessage]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Editou após receber sugestão da IA: o badge deixa de refletir a verdade.
    if (suggestionSource !== null) setSuggestionSource(null);
  };

  const send = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      // tempId precisa ser único por envio para suportar disparos em rápida
      // sucessão sem colisão no cache. crypto.randomUUID está disponível em
      // todos os browsers que o Next 15 suporta como target.
      const tempId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      sendMutation.mutate({ text: trimmed, tempId });
      setText("");
      setSuggestionSource(null);
    },
    [sendMutation],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia; Shift+Enter quebra linha (padrão de chat). isComposing evita
    // enviar enquanto IMEs (japonês/chinês/coreano) compõem caracteres.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(text);
    }
  };

  const handleSuggest = () => {
    // Se o usuário já tem texto, evitamos sobrescrever sem aviso.
    // window.confirm é simples mas suficiente: não temos sistema de modal aqui
    // e a ação é destrutiva o bastante pra justificar fricção mínima.
    if (text.trim().length > 0) {
      const ok = window.confirm("Substituir o texto atual pela sugestão da IA?");
      if (!ok) return;
    }

    suggestMutation.mutate(undefined, {
      onSuccess: (data) => {
        setText(data.suggestion);
        setSuggestionSource(data.source === "openai" ? null : data.source);
        // Foca o textarea ao final pro usuário poder editar antes de enviar.
        // requestAnimationFrame garante que o auto-grow já reflowed.
        requestAnimationFrame(() => {
          const el = textareaRef.current;
          if (!el) return;
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        });
      },
      onError: () => {
        setErrorMessage("Não foi possível gerar sugestão. Tente novamente.");
      },
    });
  };

  const isSubmitting = sendMutation.isPending;
  const isSuggesting = suggestMutation.isPending;
  const canSend = text.trim().length > 0 && !isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 border-t border-neutral-200 bg-white px-3 py-2 md:px-4 md:py-3"
    >
      {suggestionSource && (
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-600">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          <span>Sugestão {suggestionSource === "mock-fallback" ? "fallback" : "mock"}</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={isSuggesting}
          aria-label="Sugerir resposta com IA"
          className={clsx(
            "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition",
            "hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {isSuggesting ? (
            <Spinner />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-4 w-4"
            >
              <path d="M12 3v3" />
              <path d="M12 18v3" />
              <path d="M5 12H2" />
              <path d="M22 12h-3" />
              <path d="M6.34 6.34L4.22 4.22" />
              <path d="M19.78 19.78l-2.12-2.12" />
              <path d="M6.34 17.66l-2.12 2.12" />
              <path d="M19.78 4.22l-2.12 2.12" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
          <span className="hidden md:inline">
            {isSuggesting ? "Gerando…" : "Sugerir IA"}
          </span>
        </button>

        <div className="relative flex min-w-0 flex-1 items-end">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem"
            rows={1}
            aria-label="Mensagem"
            aria-describedby={helperId}
            className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-[#25D366] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
            style={{ maxHeight: MAX_TEXTAREA_HEIGHT_PX }}
          />
          <span id={helperId} className="sr-only">
            Pressione Enter para enviar, Shift mais Enter para nova linha.
          </span>
        </div>

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar mensagem"
          className={clsx(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white transition",
            "hover:bg-[#1ebe5a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40",
            "disabled:cursor-not-allowed disabled:bg-neutral-300",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-4 w-4"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {errorMessage && (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 text-xs text-red-600"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
}

function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-4 w-4 animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

