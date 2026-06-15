import {
  differenceInCalendarDays,
  format,
  isThisWeek,
  isToday,
  isYesterday,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatConversationTimestamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Ontem";

  // isThisWeek com weekStartsOn=1 evita mostrar "domingo" como semana corrente
  // num sábado (semana de seg–dom). Fallback de 6 dias garante coerência se a
  // semana já virou no calendário mas ainda é "recente" o suficiente para abreviar.
  if (isThisWeek(date, { weekStartsOn: 1 }) || differenceInCalendarDays(now, date) < 7) {
    return capitalize(format(date, "EEE", { locale: ptBR }).replace(".", ""));
  }

  return format(date, "dd/MM/yyyy");
}

// Separador exibido no meio da lista de mensagens quando o dia muda.
// Hoje/Ontem em texto humano; mais antigo cai pra data completa em pt-BR.
export function formatDayDivider(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";
  return format(date, "dd/MM/yyyy");
}

// Hora curta da bolha (HH:mm). Centralizado pra manter consistência caso o formato mude.
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "HH:mm");
}

// Chave estável de dia (YYYY-MM-DD) usada pra agrupar mensagens. Não depende de locale.
export function dayKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
