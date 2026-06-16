import { describe, expect, it } from "vitest";
import {
  dayKey,
  formatConversationTimestamp,
  formatDayDivider,
  formatMessageTime,
  getInitials,
} from "@/lib/format";

describe("getInitials", () => {
  it("retorna duas iniciais para nome composto", () => {
    expect(getInitials("Maria Silva")).toBe("MS");
  });

  it("usa primeiro e último nome quando há nomes do meio", () => {
    expect(getInitials("Ana Carolina Pereira")).toBe("AP");
  });

  it("retorna duas primeiras letras quando há apenas um nome", () => {
    expect(getInitials("Joao")).toBe("JO");
  });

  it("normaliza espaços extras", () => {
    expect(getInitials("   Maria    Silva   ")).toBe("MS");
  });

  it("retorna placeholder quando a entrada é vazia", () => {
    // "?" garante que o avatar nunca renderize string vazia — degradação visual
    // controlada quando o backend devolve contactName em branco.
    expect(getInitials("")).toBe("?");
    expect(getInitials("   ")).toBe("?");
  });
});

describe("formatMessageTime", () => {
  it("formata em HH:mm", () => {
    expect(formatMessageTime("2026-06-16T09:05:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("retorna string vazia para ISO inválido", () => {
    expect(formatMessageTime("not-a-date")).toBe("");
  });
});

describe("formatDayDivider", () => {
  it("retorna 'Hoje' para a data atual", () => {
    expect(formatDayDivider(new Date().toISOString())).toBe("Hoje");
  });

  it("retorna 'Ontem' para o dia anterior", () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    expect(formatDayDivider(ontem.toISOString())).toBe("Ontem");
  });

  it("retorna data formatada para datas antigas", () => {
    expect(formatDayDivider("2020-01-15T12:00:00.000Z")).toBe("15/01/2020");
  });

  it("retorna string vazia para ISO inválido", () => {
    expect(formatDayDivider("xxx")).toBe("");
  });
});

describe("formatConversationTimestamp", () => {
  it("retorna HH:mm quando a data é hoje", () => {
    // Forçamos "hoje" deslocando agora pra meio-dia evita flakiness na borda
    // da meia-noite quando o teste roda exatamente nessa janela.
    const hoje = new Date();
    hoje.setHours(12, 30, 0, 0);
    expect(formatConversationTimestamp(hoje.toISOString())).toMatch(/^\d{2}:\d{2}$/);
  });

  it("retorna 'Ontem' para o dia anterior", () => {
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    expect(formatConversationTimestamp(ontem.toISOString())).toBe("Ontem");
  });

  it("retorna data completa para datas antigas", () => {
    const now = new Date("2026-06-16T12:00:00.000Z");
    expect(formatConversationTimestamp("2020-01-15T12:00:00.000Z", now)).toBe("15/01/2020");
  });

  it("retorna string vazia para ISO inválido", () => {
    expect(formatConversationTimestamp("xxx")).toBe("");
  });
});

describe("dayKey", () => {
  it("retorna chave YYYY-MM-DD independente do horário", () => {
    expect(dayKey("2026-06-16T09:05:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("retorna string vazia para ISO inválido", () => {
    expect(dayKey("foo")).toBe("");
  });
});
