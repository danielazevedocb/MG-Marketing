import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DATE_FNS_PT_BR = ptBR;

const ISO_DATE_PATTERN = "yyyy-MM-dd";

export function parseDateOnly(
  value: string | undefined | null,
): Date | undefined {
  if (!value?.trim()) return undefined;

  const parsed = parse(value.trim(), ISO_DATE_PATTERN, new Date());
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed;
}

export function toDateOnlyString(date: Date): string {
  return format(date, ISO_DATE_PATTERN);
}

export function formatDateBr(date: Date): string {
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

/// Inverso de `formatDateBr` — parseia "dd/MM/yyyy" (usado em texto livre
/// de templates). `undefined` se não bater com o formato.
export function parseDateBr(
  value: string | undefined | null,
): Date | undefined {
  if (!value?.trim()) return undefined;

  const parsed = parse(value.trim(), "dd/MM/yyyy", new Date());
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed;
}

export function formatDateTimeBr(date: Date): string {
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function parseIsoDateTime(
  value: string | undefined | null,
): Date | undefined {
  if (!value?.trim()) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed;
}

export function setTimeOnDate(
  date: Date,
  hours: number,
  minutes: number,
): Date {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function padTimeUnit(value: number): string {
  return String(value).padStart(2, "0");
}
